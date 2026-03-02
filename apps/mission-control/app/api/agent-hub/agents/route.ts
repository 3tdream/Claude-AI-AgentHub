import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedAgents } from "@/lib/agent-hub-cache";

// GET /api/agent-hub/agents — list all agents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const raw = await agentHubFetch<{ agents: unknown[]; pagination: unknown }>(
      `/agents?limit=${limit}&offset=${offset}`,
    );
    return NextResponse.json({ success: true, data: raw.agents ?? raw });
  } catch {
    // Fallback to cached data when Agent Hub backend is unreachable
    console.log("[API] Agent Hub unreachable, serving cached agents");
    return NextResponse.json({ success: true, data: cachedAgents, cached: true });
  }
}

// POST /api/agent-hub/agents — create agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await agentHubFetch("/agents", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API] Create agent error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
