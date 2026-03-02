import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";

type RouteParams = { params: Promise<{ teamId: string }> };

// GET /api/agent-hub/teams/[teamId]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const data = await agentHubFetch(`/teams/${teamId}`);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// PATCH /api/agent-hub/teams/[teamId]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const data = await agentHubFetch(`/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// DELETE /api/agent-hub/teams/[teamId]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const data = await agentHubFetch(`/teams/${teamId}`, { method: "DELETE" });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
