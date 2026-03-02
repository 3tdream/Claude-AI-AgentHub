import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";

type RouteParams = { params: Promise<{ teamId: string }> };

// GET /api/agent-hub/teams/[teamId]/agents — list agents by team
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const data = await agentHubFetch(
      `/teams/${teamId}/agents?limit=${limit}&offset=${offset}`,
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}

// POST /api/agent-hub/teams/[teamId]/agents — assign agent to team
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { teamId } = await params;
    const body = await request.json();
    const data = await agentHubFetch(`/teams/${teamId}/agents`, {
      method: "POST",
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
