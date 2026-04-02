import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedTeams } from "@/lib/agent-hub-cache";
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

function applyOverrides(team: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  return { ...team, ...override };
}

// GET /api/agent-hub/teams/[teamId]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const overrides = await loadOverrides();

  if (overrides[teamId]?._deleted) {
    return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
  }

  try {
    const data = await agentHubFetch(`/teams/${teamId}`);
    const merged = overrides[teamId] ? applyOverrides(data as Record<string, unknown>, overrides[teamId]) : data;
    return NextResponse.json({ success: true, data: merged });
  } catch {
    // Check local-only teams
    if (overrides[teamId] && (overrides[teamId] as any)._local) {
      return NextResponse.json({ success: true, data: { id: teamId, ...overrides[teamId] } });
    }
    const cached = cachedTeams.find((t) => t.id === teamId);
    if (cached) {
      const merged = overrides[teamId] ? applyOverrides(cached as Record<string, unknown>, overrides[teamId]) : cached;
      return NextResponse.json({ success: true, data: merged, cached: true });
    }
    return NextResponse.json({ success: false, error: "Team not found" }, { status: 404 });
  }
}

// PATCH /api/agent-hub/teams/[teamId] — update team (persists locally)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;
  const body = await request.json();

  // Always save overrides locally (MC is source of truth)
  const overrides = await loadOverrides();
  overrides[teamId] = { ...(overrides[teamId] || {}), ...body };
  await saveOverrides(overrides);

  // Try to also update Agent Hub (best-effort)
  try {
    await agentHubFetch(`/teams/${teamId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  } catch {
    // Hub offline — local save is sufficient
  }

  // Return merged team
  const cached = cachedTeams.find((t) => t.id === teamId);
  const merged = cached ? applyOverrides(cached as Record<string, unknown>, overrides[teamId]) : { id: teamId, ...overrides[teamId] };
  return NextResponse.json({ success: true, data: merged });
}

// DELETE /api/agent-hub/teams/[teamId] — delete team (persists locally)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { teamId } = await params;

  // Always mark as deleted locally
  const overrides = await loadOverrides();
  overrides[teamId] = { ...(overrides[teamId] || {}), _deleted: true };
  await saveOverrides(overrides);

  // Try to also delete on Hub (best-effort)
  try {
    await agentHubFetch(`/teams/${teamId}`, { method: "DELETE" });
  } catch {
    // Hub offline — local delete marker is sufficient
  }

  return NextResponse.json({ success: true, data: { id: teamId, deleted: true } });
}
