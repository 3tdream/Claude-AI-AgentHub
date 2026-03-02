import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";

type RouteParams = { params: Promise<{ sessionId: string }> };

// POST /api/agent-hub/sessions/[sessionId]/messages — send message
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const body = await request.json();

    if (!body.message) {
      return NextResponse.json(
        { success: false, error: "message is required" },
        { status: 400 },
      );
    }

    const data = await agentHubFetch(`/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: body.message,
        waitForResponse: body.waitForResponse ?? true,
        timeout: body.timeout ?? 60000,
        attachments: body.attachments,
      }),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
