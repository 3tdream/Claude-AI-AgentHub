import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedTeams } from "@/lib/agent-hub-cache";

// GET /api/agent-hub/teams — list all teams
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const raw = await agentHubFetch<{ teams: unknown[]; pagination: unknown }>(
      `/teams?limit=${limit}&offset=${offset}`,
    );
    return NextResponse.json({ success: true, data: raw.teams ?? raw });
  } catch {
    // Fallback to cached data when Agent Hub backend is unreachable
    console.log("[API] Agent Hub unreachable, serving cached teams");
    return NextResponse.json({ success: true, data: cachedTeams, cached: true });
  }
}

// POST /api/agent-hub/teams — create team
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await agentHubFetch("/teams", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API] Create team error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
