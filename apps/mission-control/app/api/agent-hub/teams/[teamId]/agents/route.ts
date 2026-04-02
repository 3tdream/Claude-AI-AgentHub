import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { promises as fs } from "fs";
import path from "path";

type RouteParams = { params: Promise<{ teamId: string }> };

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

// GET /api/agent-hub/teams/[teamId]/agents — list agents by team
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const overrides = await loadOverrides();

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const data = await agentHubFetch(
      `/teams/${teamId}/agents?limit=${limit}&offset=${offset}`,
    );

    // Merge local agent assignments
    const localAgents = ((overrides[teamId]?.agents as any[]) || []).filter((a: any) => !a._deleted);
    const hubAgents = Array.isArray(data) ? data : (data as any).agents ?? [];
    const hubIds = new Set(hubAgents.map((a: any) => a.id || a.agentId));
    const extras = localAgents.filter((a: any) => !hubIds.has(a.id || a.agentId));

    return NextResponse.json({ success: true, data: [...hubAgents, ...extras] });
  } catch {
    // Hub offline — return local agents for this team
    const localAgents = ((overrides[teamId]?.agents as any[]) || []).filter((a: any) => !a._deleted);
    return NextResponse.json({ success: true, data: localAgents, cached: true });
  }
}

// POST /api/agent-hub/teams/[teamId]/agents — assign agent to team
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const body = await request.json();

  // Try Hub first
  try {
    const data = await agentHubFetch(`/teams/${teamId}/agents`, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch {
    // Hub offline — save locally under team's agents array
    const overrides = await loadOverrides();
    if (!overrides[teamId]) {
      overrides[teamId] = {};
    }
    const agents = (overrides[teamId].agents as any[]) || [];
    const entry = { ...body, _local: true, assignedAt: new Date().toISOString() };
    agents.push(entry);
    overrides[teamId].agents = agents;
    await saveOverrides(overrides);
    return NextResponse.json({ success: true, data: entry });
  }
}
