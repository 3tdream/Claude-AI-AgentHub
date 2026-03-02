import { NextRequest, NextResponse } from "next/server";
import { executeAgent } from "@/lib/agent-hub-client";

// POST /api/agent-hub/execute — execute an agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.assistantId || !body.userInput) {
      return NextResponse.json(
        { success: false, error: "assistantId and userInput are required" },
        { status: 400 },
      );
    }

    const result = await executeAgent({
      assistantId: body.assistantId,
      userInput: body.userInput,
      attachments: body.attachments,
      responseFormat: body.responseFormat,
      systemPromptOverride: body.systemPromptOverride,
      sessionId: body.sessionId,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[API] Execute error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
