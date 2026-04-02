import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedAgents } from "@/lib/agent-hub-cache";
import { promises as fs } from "fs";
import path from "path";

const OVERRIDES_FILE = path.join(process.cwd(), "data", "agent-overrides.json");

async function loadOverrides(): Promise<Record<string, Record<string, unknown>>> {
  try {
    return JSON.parse(await fs.readFile(OVERRIDES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

// GET /api/agent-hub/agents — list all agents (with local overrides applied)
export async function GET(request: NextRequest) {
  const overrides = await loadOverrides();

  function applyOverridesToList(agents: any[]): any[] {
    return agents.map((a) => overrides[a.id] ? { ...a, ...overrides[a.id] } : a);
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const raw = await agentHubFetch<{ agents: unknown[]; pagination: unknown }>(
      `/agents?limit=${limit}&offset=${offset}`,
    );
    const agents = raw.agents ?? raw;
    return NextResponse.json({ success: true, data: applyOverridesToList(agents as any[]) });
  } catch {
    console.log("[API] Agent Hub unreachable, serving cached agents");
    return NextResponse.json({ success: true, data: applyOverridesToList(cachedAgents as any[]), cached: true });
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
