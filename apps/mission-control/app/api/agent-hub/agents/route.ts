import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedAgents } from "@/lib/agent-hub-cache";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const OVERRIDES_FILE = path.join(process.cwd(), "data", "agent-overrides.json");

async function loadOverrides(): Promise<Record<string, Record<string, unknown>>> {
  try {
    return JSON.parse(await fs.readFile(OVERRIDES_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function saveOverrides(overrides: Record<string, Record<string, unknown>>) {
  await fs.mkdir(path.dirname(OVERRIDES_FILE), { recursive: true });
  await fs.writeFile(OVERRIDES_FILE, JSON.stringify(overrides, null, 2), "utf-8");
}

// GET /api/agent-hub/agents — list all agents (with local overrides applied)
export async function GET(request: NextRequest) {
  const overrides = await loadOverrides();

  function applyOverridesToList(agents: any[]): any[] {
    return agents
      .map((a) => overrides[a.id] ? { ...a, ...overrides[a.id] } : a)
      .filter((a) => !a._deleted);
  }

  // Collect locally-created agents (those with _local: true that aren't in the base list)
  function getLocalAgents(baseIds: Set<string>): any[] {
    return Object.entries(overrides)
      .filter(([id, o]) => (o as any)._local && !baseIds.has(id) && !(o as any)._deleted)
      .map(([id, o]) => ({ id, ...o }));
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const raw = await agentHubFetch<{ agents: unknown[]; pagination: unknown }>(
      `/agents?limit=${limit}&offset=${offset}`,
    );
    const agents = raw.agents ?? raw;
    const merged = applyOverridesToList(agents as any[]);
    const baseIds = new Set(merged.map((a: any) => a.id));
    return NextResponse.json({ success: true, data: [...merged, ...getLocalAgents(baseIds)] });
  } catch {
    console.log("[API] Agent Hub unreachable, serving cached agents");
    const merged = applyOverridesToList(cachedAgents as any[]);
    const baseIds = new Set(merged.map((a: any) => a.id));
    return NextResponse.json({ success: true, data: [...merged, ...getLocalAgents(baseIds)], cached: true });
  }
}

// POST /api/agent-hub/agents — create agent
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Try Hub first
  try {
    const data = await agentHubFetch("/agents", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch {
    // Hub offline — save locally
    const id = crypto.randomBytes(12).toString("hex");
    const agent = {
      id,
      ...body,
      _local: true,
      createdAt: new Date().toISOString(),
    };
    const overrides = await loadOverrides();
    overrides[id] = agent;
    await saveOverrides(overrides);
    return NextResponse.json({ success: true, data: agent });
  }
}
