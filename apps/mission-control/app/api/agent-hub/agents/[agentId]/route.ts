import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedAgents } from "@/lib/agent-hub-cache";

type RouteParams = { params: Promise<{ agentId: string }> };

// GET /api/agent-hub/agents/[agentId] — get agent info
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const data = await agentHubFetch(`/agents/${agentId}`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    // Fallback to cache
    const { agentId } = await params;
    const cached = cachedAgents.find((a) => a.id === agentId);
    if (cached) {
      console.log(`[API] Agent Hub unreachable, serving cached agent: ${cached.name}`);
      return NextResponse.json({ success: true, data: cached });
    }
    console.error("[API] Get agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// PATCH /api/agent-hub/agents/[agentId] — update agent
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const body = await request.json();
    const data = await agentHubFetch(`/agents/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API] Update agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// DELETE /api/agent-hub/agents/[agentId] — delete agent
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const data = await agentHubFetch(`/agents/${agentId}`, { method: "DELETE" });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API] Delete agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
