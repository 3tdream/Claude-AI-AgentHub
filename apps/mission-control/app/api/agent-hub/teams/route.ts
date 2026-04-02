import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedTeams } from "@/lib/agent-hub-cache";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

const OVERRIDES_FILE = path.join(process.cwd(), "data", "team-overrides.json");

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

// GET /api/agent-hub/teams — list all teams (with local overrides applied)
export async function GET(request: NextRequest) {
  const overrides = await loadOverrides();

  function applyOverridesToList(teams: any[]): any[] {
    return teams
      .map((t) => overrides[t.id] ? { ...t, ...overrides[t.id] } : t)
      .filter((t) => !t._deleted);
  }

  function getLocalTeams(baseIds: Set<string>): any[] {
    return Object.entries(overrides)
      .filter(([id, o]) => (o as any)._local && !baseIds.has(id) && !(o as any)._deleted)
      .map(([id, o]) => ({ id, ...o }));
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const raw = await agentHubFetch<{ teams: unknown[]; pagination: unknown }>(
      `/teams?limit=${limit}&offset=${offset}`,
    );
    const teams = raw.teams ?? raw;
    const merged = applyOverridesToList(teams as any[]);
    const baseIds = new Set(merged.map((t: any) => t.id));
    return NextResponse.json({ success: true, data: [...merged, ...getLocalTeams(baseIds)] });
  } catch {
    console.log("[API] Agent Hub unreachable, serving cached teams");
    const merged = applyOverridesToList(cachedTeams as any[]);
    const baseIds = new Set(merged.map((t: any) => t.id));
    return NextResponse.json({ success: true, data: [...merged, ...getLocalTeams(baseIds)], cached: true });
  }
}

// POST /api/agent-hub/teams — create team
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Try Hub first
  try {
    const data = await agentHubFetch("/teams", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch {
    // Hub offline — save locally
    const id = crypto.randomBytes(12).toString("hex");
    const team = {
      id,
      ...body,
      _local: true,
      agents: [],
      createdAt: new Date().toISOString(),
    };
    const overrides = await loadOverrides();
    overrides[id] = team;
    await saveOverrides(overrides);
    return NextResponse.json({ success: true, data: team });
  }
}
