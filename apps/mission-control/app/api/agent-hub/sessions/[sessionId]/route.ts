import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";

type RouteParams = { params: Promise<{ sessionId: string }> };

// GET /api/agent-hub/sessions/[sessionId] — get session messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const data = await agentHubFetch(
      `/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`,
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// DELETE /api/agent-hub/sessions/[sessionId] — delete session
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const data = await agentHubFetch(`/sessions/${sessionId}`, { method: "DELETE" });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
