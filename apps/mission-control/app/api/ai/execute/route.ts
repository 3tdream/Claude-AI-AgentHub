import { NextRequest, NextResponse } from "next/server";
import { callAI } from "@/lib/direct-ai-client";
import { loadAgentPrompt } from "@/lib/agent-prompt-loader";

/**
 * POST /api/ai/execute — Direct AI execution
 * Replaces /api/agent-hub/execute for pipeline steps.
 * Calls Claude/OpenAI directly using local agent prompts.
 */
export async function POST(request: NextRequest) {
  try {
    const { agentId, model, userInput, systemPromptOverride } =
      await request.json();

    if (!agentId || !userInput) {
      return NextResponse.json(
        { success: false, error: "agentId and userInput are required" },
        { status: 400 },
      );
    }

    // Load system prompt from local .md file (or use override)
    const systemPrompt =
      systemPromptOverride || (await loadAgentPrompt(agentId));

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
