import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { agentPrompts } from "@/lib/agent-prompts-cache";

type RouteParams = { params: Promise<{ agentId: string }> };

// GET /api/agent-hub/agents/[agentId]/prompt — get prompt or prompt history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);

    if (searchParams.get("history") === "true") {
      const limit = searchParams.get("limit") || "10";
      const offset = searchParams.get("offset") || "0";
      const data = await agentHubFetch(
        `/agents/${agentId}/prompt/history?limit=${limit}&offset=${offset}`,
      );
      return NextResponse.json({ success: true, data });
    }

    const data = await agentHubFetch(`/agents/${agentId}/prompt`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    const { agentId } = await params;
    // Fallback: return cached prompt or empty
    const cachedPrompt = agentPrompts[agentId] || "";
    const { searchParams } = new URL(request.url);

    if (searchParams.get("history") === "true") {
      return NextResponse.json({ success: true, data: [], cached: true });
    }
    return NextResponse.json({ success: true, data: cachedPrompt, cached: true });
  }
}

// PUT /api/agent-hub/agents/[agentId]/prompt — update prompt
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const data = await agentHubFetch(`/agents/${agentId}/prompt`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API] Update prompt error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
