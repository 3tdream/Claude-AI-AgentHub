import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { agentPrompts } from "@/lib/agent-prompts-cache";
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

type RouteParams = { params: Promise<{ agentId: string }> };

const OVERRIDES_PATH = path.join(process.cwd(), "data", "prompt-overrides.json");

async function getOverrides(): Promise<Record<string, string>> {
  try {
    const raw = await readFile(OVERRIDES_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveOverride(agentId: string, prompt: string) {
  const overrides = await getOverrides();
  overrides[agentId] = prompt;
  await mkdir(path.dirname(OVERRIDES_PATH), { recursive: true });
  await writeFile(OVERRIDES_PATH, JSON.stringify(overrides, null, 2));
}

// GET /api/agent-hub/agents/[agentId]/prompt — get prompt or prompt history
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);

    if (searchParams.get("history") === "true") {
      const limit = searchParams.get("limit") || "10";
      const offset = searchParams.get("offset") || "0";
      const data = await agentHubFetch(
        `/agents/${agentId}/prompt/history?limit=${limit}&offset=${offset}`,
      );
      return NextResponse.json({ success: true, data });
    }

    const data = await agentHubFetch(`/agents/${agentId}/prompt`);
    return NextResponse.json({ success: true, data });
  } catch {
    const { agentId } = await params;
    const { searchParams } = new URL(request.url);

    if (searchParams.get("history") === "true") {
      return NextResponse.json({ success: true, data: [], cached: true });
    }

    // Check local overrides first, then static cache
    const overrides = await getOverrides();
    const prompt = overrides[agentId] ?? agentPrompts[agentId] ?? "";
    return NextResponse.json({ success: true, data: prompt, cached: true });
  }
}

// PUT /api/agent-hub/agents/[agentId]/prompt — update prompt
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { agentId } = await params;
  const body = await request.json();

  try {
    const data = await agentHubFetch(`/agents/${agentId}/prompt`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch {
    // Offline mode: persist to local file
    await saveOverride(agentId, body.prompt || "");
    return NextResponse.json({ success: true, data: body.prompt, cached: true });
  }
}
