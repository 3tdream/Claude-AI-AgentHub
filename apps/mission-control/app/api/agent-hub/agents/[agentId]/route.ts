import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedAgents } from "@/lib/agent-hub-cache";
import { promises as fs } from "fs";
import path from "path";

type RouteParams = { params: Promise<{ agentId: string }> };

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

function applyOverrides(agent: Record<string, unknown>, overrides: Record<string, unknown>): Record<string, unknown> {
  return { ...agent, ...overrides };
}

// GET /api/agent-hub/agents/[agentId] — get agent info (with local overrides)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  const { agentId } = await params;
  const overrides = await loadOverrides();

  try {
    const data = await agentHubFetch(`/agents/${agentId}`);
    const merged = overrides[agentId] ? applyOverrides(data as Record<string, unknown>, overrides[agentId]) : data;
    return NextResponse.json({ success: true, data: merged });
  } catch {
    const cached = cachedAgents.find((a) => a.id === agentId);
    if (cached) {
      const merged = overrides[agentId] ? applyOverrides(cached as Record<string, unknown>, overrides[agentId]) : cached;
      return NextResponse.json({ success: true, data: merged, cached: true });
    }
    return NextResponse.json({ success: false, error: "Agent not found" }, { status: 404 });
  }
}

// PATCH /api/agent-hub/agents/[agentId] — update agent (persists locally)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { agentId } = await params;
  const body = await request.json();

  // Always save overrides locally (MC is source of truth)
  const overrides = await loadOverrides();
  overrides[agentId] = { ...(overrides[agentId] || {}), ...body };
  await saveOverrides(overrides);

  // Try to also update Agent Hub (best-effort)
  try {
    await agentHubFetch(`/agents/${agentId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  } catch {
    // Hub offline — local save is sufficient
  }

  // Return merged agent
  const cached = cachedAgents.find((a) => a.id === agentId);
  const merged = cached ? applyOverrides(cached as Record<string, unknown>, overrides[agentId]) : { id: agentId, ...body };
  return NextResponse.json({ success: true, data: merged });
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
