import { NextRequest, NextResponse } from "next/server";
import { callAI, callAIWithTools } from "@/lib/direct-ai-client";
import { loadAgentPrompt } from "@/lib/agent-prompt-loader";
import { AGENT_TOOLS, READ_ONLY_TOOLS, QA_TOOLS, executeTool } from "@/lib/agent-tools";
import { addLog } from "@/lib/logs-storage";

/**
 * POST /api/ai/execute — Direct AI execution
 * Supports two modes:
 *   1. Standard: single prompt → single response
 *   2. Tool-use: multi-turn with file system access (useTools: true)
 */
export async function POST(request: NextRequest) {
  try {
    const { agentId, model, userInput, systemPromptOverride, useTools, toolMode, maxToolSteps } =
      await request.json();

    if (!agentId || !userInput) {
      return NextResponse.json(
        { success: false, error: "agentId and userInput are required" },
        { status: 400 },
      );
    }

    const systemPrompt =
      systemPromptOverride || (await loadAgentPrompt(agentId));

    // --- Tool-use mode ---
    if (useTools) {
      const tools = toolMode === "qa" ? QA_TOOLS : toolMode === "readonly" ? READ_ONLY_TOOLS : AGENT_TOOLS;
      let toolCallCount = 0;

      const result = await callAIWithTools({
        model: model || "sonnet-4-6",
        systemPrompt,
        userPrompt: userInput,
        tools,
        maxToolSteps: maxToolSteps || 15,
        onToolCall: async (name, input) => {
          toolCallCount++;
          addLog({
            type: "decision",
            agentId,
            agentName: agentId,
            content: `Tool call: ${name}(${JSON.stringify(input).substring(0, 200)})`,
          }).catch(() => {});
          return executeTool(name, input);
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
