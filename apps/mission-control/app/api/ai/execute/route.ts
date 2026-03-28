import { NextRequest, NextResponse } from "next/server";
import { callAI, callAIWithTools } from "@/lib/direct-ai-client";
import { loadAgentPrompt } from "@/lib/agent-prompt-loader";
import { AGENT_TOOLS, READ_ONLY_TOOLS, QA_TOOLS, executeTool } from "@/lib/agent-tools";
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

    if (!agentId || !userInput) {
      return NextResponse.json(
        { success: false, error: "agentId and userInput are required" },
        { status: 400 },
      );
    }

    let systemPrompt =
      systemPromptOverride || (await loadAgentPrompt(agentId));

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

    // --- Execution logging ---
    addLog({
      type: "decision",
      agentId,
      content: `[execute] ${agentId} | ${useTools ? "tools" : "standard"} | "${userInput.substring(0, 60)}"`,
    }).catch(() => {});

    // --- Tool-use mode ---
    if (useTools) {
      const tools = (toolMode === "qa" ? QA_TOOLS : toolMode === "readonly" ? READ_ONLY_TOOLS : AGENT_TOOLS) as any[];
      let toolCallCount = 0;

      const result = await callAIWithTools({
        model: model || "sonnet-4-6",
        systemPrompt,
        userPrompt: userInput,
        tools,
        maxToolSteps: maxToolSteps || 15,
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
