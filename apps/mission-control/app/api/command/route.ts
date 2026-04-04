import { NextRequest, NextResponse } from "next/server";
import { classifyIntent } from "@/lib/intent-classifier";
import { callAIWithTools } from "@/lib/direct-ai-client";
import { AGENT_TOOLS, executeTool } from "@/lib/agent-tools";
import { loadProjectContext } from "@/lib/project-context-loader";
import { searchKB } from "@/lib/kb-storage";
import { addLog } from "@/lib/logs-storage";
import { routeToAgent } from "@/lib/agent-router";
import { loadAgentPrompt } from "@/lib/agent-prompt-loader";
import path from "path";

const APPS_DIR = path.resolve(process.cwd(), "..");

/**
 * POST /api/command — Unified command execution
 *
 * Intent classifier decides: direct (Claude) / pipeline / hybrid
 * Direct mode: Claude + file tools + KB + project context
 */
export async function POST(req: NextRequest) {
  try {
    const { input, projectId } = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: "input required" }, { status: 400 });
    }

    // 1. Classify intent
    const intent = classifyIntent(input);

    // Log
    addLog({
      type: "decision",
      content: `Command: "${input.substring(0, 80)}" → ${intent.intent} (${Math.round(intent.confidence * 100)}%: ${intent.reason})`,
    }).catch(() => {});

    // 2. If pipeline → return intent only (UI will redirect to orchestration)
    if (intent.intent === "pipeline") {
      return NextResponse.json({
        intent,
        action: "redirect_to_pipeline",
        message: `This task needs a pipeline (${intent.pipelineMode} mode). Redirecting to Orchestration.`,
      });
    }

    // 3. DIRECT execution: route to best agent, then run with tools
    const projectPath = projectId ? path.join(APPS_DIR, projectId) : undefined;

    // Pick the best agent for this task
    const routeResult = routeToAgent(input);

    addLog({
      type: "decision",
      content: `[command] routed to ${routeResult.agentName} (${routeResult.agentId})${routeResult.isFallback ? " [fallback]" : ` matched: ${routeResult.matchedKeywords.join(", ")}`}`,
    }).catch(() => {});

    // Load agent system prompt from .md file / agent-prompts-cache
    const agentBasePrompt = await loadAgentPrompt(routeResult.agentId);

    // Load context
    let contextBlock = "";

    // KB search for relevant patterns
    const kbResults = await searchKB(input.split(/\s+/).slice(0, 5).join(" "));
    if (kbResults.length > 0) {
      contextBlock += `\n## Relevant KB patterns:\n${kbResults.slice(0, 3).map((e) => `- [${e.severity}] ${e.title}`).join("\n")}\n`;
    }

    // Project context
    if (projectId) {
      const ctx = await loadProjectContext(projectId);
      if (ctx) {
        contextBlock += ctx.promptBlock;
      }
    }

    const systemPrompt = `${agentBasePrompt}

You have file tools: list_files, read_file, edit_file, create_file, run_command.
${projectId ? `Active project: ${projectId}. All file operations target this project.` : "Working in mission-control."}

Rules:
- Make precise, minimal edits
- Always read the file before editing
- One edit_file call per change (don't rewrite entire files)
- After editing, briefly confirm what you changed
${contextBlock}`;

    let toolCallLog: { name: string; path?: string; success: boolean }[] = [];

    const result = await callAIWithTools({
      model: "sonnet-4-6",
      systemPrompt,
      userPrompt: input,
      tools: AGENT_TOOLS as unknown as any[],
      maxToolSteps: 10,
      readBudget: 5,
      onToolCall: async (name, toolInput) => {
        const res = await executeTool(name, toolInput, projectPath);
        toolCallLog.push({
          name,
          path: toolInput.path,
          success: res.success,
        });
        addLog({
          type: "decision",
          content: `[command] ${name}(${toolInput.path || toolInput.command?.substring(0, 50) || "..."}) → ${res.success ? "OK" : "FAIL"}`,
        }).catch(() => {});
        return res;
      },
    });

    return NextResponse.json({
      intent,
      action: "executed",
      agent: { id: routeResult.agentId, name: routeResult.agentName, isFallback: routeResult.isFallback },
      response: result.content,
      toolCalls: toolCallLog,
      tokensUsed: result.tokensUsed,
      model: result.model,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
