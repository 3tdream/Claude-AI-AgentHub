import { NextRequest, NextResponse } from "next/server";
import { callAI, callAIWithTools } from "@/lib/direct-ai-client";
import { loadAgentPrompt } from "@/lib/agent-prompt-loader";
import { AGENT_TOOLS, READ_ONLY_TOOLS, QA_TOOLS, DESIGNER_TOOLS, executeTool } from "@/lib/agent-tools";
import { addLog } from "@/lib/logs-storage";
import { searchKB } from "@/lib/kb-storage";

/**
 * POST /api/ai/execute — Direct AI execution
 * Supports two modes:
 *   1. Standard: single prompt → single response
 *   2. Tool-use: multi-turn with file system access (useTools: true)
 */
export async function POST(request: NextRequest) {
  try {
    const { agentId, model, userInput, systemPromptOverride, useTools, toolMode, maxToolSteps, readBudget, projectPath: projectId } =
      await request.json();

    // Resolve project ID to absolute path
    const path = await import("path");
    const projectPath = projectId
      ? path.resolve(process.cwd(), "..", projectId)
      : undefined;

    // Smart model router: opus for edit-heavy/complex tasks, sonnet for simple reads
    const resolvedModel = (() => {
      if (model && (model.includes("claude") || model.includes("sonnet") || model.includes("haiku") || model.includes("opus"))) return model;
      // Smart routing: if task mentions edit/create/fix/build → opus, otherwise sonnet
      const t = (userInput || "").toLowerCase();
      const complexSignals = /\b(edit|create|add|fix|build|implement|refactor|move|change|replace)\b/;
      if (complexSignals.test(t)) return "claude-opus-4-6";
      return "sonnet-4-6";
    })();

    if (!agentId || !userInput) {
      return NextResponse.json(
        { success: false, error: "agentId and userInput are required" },
        { status: 400 },
      );
    }

    let systemPrompt =
      systemPromptOverride || (await loadAgentPrompt(agentId));

    // --- Project structure map (saves tool steps on exploration) ---
    systemPrompt += `\n\n## PROJECT STRUCTURE (do NOT waste tool calls exploring — use this map)
Home page (main): app/(shell)/home/page.tsx — imports from components/home/
Agent Fleet (left panel with collapse): app/(shell)/home/page.tsx — look for fleetCollapsed, PanelLeftClose
Pipeline Panel: components/home/pipeline-panel.tsx
Pipeline History: components/home/pipeline-history.tsx
Pipeline Input: components/home/pipeline-input.tsx
Agent Card: components/home/agent-card.tsx
Agent Panel (tabs): components/home/agent-panel.tsx
Chat Tab: components/home/chat-tab.tsx
Config Tab: components/home/config-tab.tsx
Health Panel: components/home/health-panel.tsx
Knowledge Panel: components/home/knowledge-panel.tsx
Sidebar (navigation): components/shell/sidebar.tsx
Topbar: components/shell/topbar.tsx
Pipeline Executor: lib/pipeline-executor.ts
Agent Tools: lib/agent-tools.ts
KB Storage: lib/kb-storage.ts
Types: types/workflow.ts, types/knowledge-base.ts
START with read_file on the SPECIFIC file you need. Do NOT list_files.`;

    // --- KB context injection (prevents "sandbox" bypass) ---
    try {
      const keywords = userInput.split(/\s+/).slice(0, 5).join(" ");
      const kbResults = await searchKB(keywords);
      if (kbResults.length > 0) {
        const kbBlock = kbResults.slice(0, 5).map((e) =>
          `- [${e.severity}] ${e.title}: ${e.content.substring(0, 100)}`
        ).join("\n");
        systemPrompt += `\n\n## KB Context (mandatory — do not ignore):\n${kbBlock}`;
      }
    } catch { /* KB unavailable — proceed without */ }

    // --- Recent execution history (gives agent context of what was done before) ---
    try {
      const fsPromises = await import("fs/promises");
      const pathMod = await import("path");
      const historyDir = pathMod.join(process.cwd(), "data", "pipeline-runs");
      const files = await fsPromises.readdir(historyDir);
      const recentFiles = files.filter(f => f.endsWith(".json")).slice(-5);
      const recentTasks: string[] = [];
      for (const f of recentFiles) {
        try {
          const run = JSON.parse(await fsPromises.readFile(pathMod.join(historyDir, f), "utf-8"));
          if (run.input) recentTasks.push(`- [${run.status}] ${run.input.substring(0, 80)}`);
        } catch { /* skip */ }
      }
      if (recentTasks.length > 0) {
        systemPrompt += `\n\n## RECENT TASKS (for context — what was done recently):\n${recentTasks.join("\n")}`;
      }
    } catch { /* no history — proceed without */ }

    // --- Execution logging ---
    addLog({
      type: "decision",
      agentId,
      content: `[execute] ${agentId} | ${useTools ? "tools" : "standard"} | "${userInput.substring(0, 60)}"`,
    }).catch(() => {});

    // --- Tool-use mode ---
    if (useTools) {
      const tools = (toolMode === "qa" ? QA_TOOLS : toolMode === "designer" ? DESIGNER_TOOLS : toolMode === "readonly" ? READ_ONLY_TOOLS : AGENT_TOOLS) as any[];
      let toolCallCount = 0;

      const result = await callAIWithTools({
        model: resolvedModel,
        systemPrompt,
        userPrompt: userInput,
        tools,
        maxToolSteps: maxToolSteps ?? 50, // no practical limit — agent works until done
        readBudget: readBudget || 10,
        onToolCall: async (name, input) => {
          toolCallCount++;
          addLog({
            type: "decision",
            agentId,
            agentName: agentId,
            content: `Tool call: ${name}(${JSON.stringify(input).substring(0, 200)})`,
          }).catch(() => {});
          return executeTool(name, input, projectPath || undefined);
        },
      });

      return NextResponse.json({
        success: true,
        content: result.content,
        provider: result.provider,
        model: result.model,
        tokensUsed: result.tokensUsed,
        durationMs: result.durationMs,
        toolCalls: result.toolCalls || [],
        toolCallCount: toolCallCount,
      });
    }

    // --- Standard mode ---
    const result = await callAI({
      model: model || "sonnet-4-6",
      systemPrompt,
      userPrompt: userInput,
    });

    return NextResponse.json({
      success: true,
      content: result.content,
      provider: result.provider,
      model: result.model,
      tokensUsed: result.tokensUsed,
      durationMs: result.durationMs,
    });
  } catch (error) {
    console.error("[API] Direct AI execute error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
