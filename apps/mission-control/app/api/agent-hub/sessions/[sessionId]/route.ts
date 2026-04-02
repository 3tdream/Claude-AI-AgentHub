import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { promises as fs } from "fs";
import path from "path";

type RouteParams = { params: Promise<{ sessionId: string }> };

const SESSIONS_FILE = path.join(process.cwd(), "data", "sessions-local.json");

interface LocalSession {
  id: string;
  agentId: string;
  status: string;
  messages: any[];
  createdAt: string;
  _local: boolean;
  _deleted?: boolean;
  [key: string]: unknown;
}

async function loadSessions(): Promise<Record<string, LocalSession>> {
  try {
    return JSON.parse(await fs.readFile(SESSIONS_FILE, "utf-8"));
  } catch {
    return {};
  }
}

async function saveSessions(sessions: Record<string, LocalSession>) {
  await fs.mkdir(path.dirname(SESSIONS_FILE), { recursive: true });
  await fs.writeFile(SESSIONS_FILE, JSON.stringify(sessions, null, 2), "utf-8");
}

// GET /api/agent-hub/sessions/[sessionId] — get session messages
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { sessionId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";
    const offset = searchParams.get("offset") || "0";

    const data = await agentHubFetch(
      `/sessions/${sessionId}/messages?limit=${limit}&offset=${offset}`,
    );
    return NextResponse.json({ success: true, data });
  } catch {
    // Hub offline — try local session
    const sessions = await loadSessions();
    const session = sessions[sessionId];
    if (session && !session._deleted) {
      return NextResponse.json({ success: true, data: session.messages, cached: true });
    }
    return NextResponse.json(
      { success: false, error: "Session not found" },
      { status: 404 },
    );
  }
}

// DELETE /api/agent-hub/sessions/[sessionId] — delete session (persists locally)
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { sessionId } = await params;

  // Always mark as deleted locally
  const sessions = await loadSessions();
  if (sessions[sessionId]) {
    sessions[sessionId]._deleted = true;
    await saveSessions(sessions);
  } else {
    // Create a tombstone for Hub sessions
    sessions[sessionId] = {
      id: sessionId,
      agentId: "",
      status: "deleted",
      messages: [],
      createdAt: new Date().toISOString(),
      _local: false,
      _deleted: true,
    };
    await saveSessions(sessions);
  }

  // Try to also delete on Hub (best-effort)
  try {
    await agentHubFetch(`/sessions/${sessionId}`, { method: "DELETE" });
  } catch {
    // Hub offline — local delete marker is sufficient
  }

  return NextResponse.json({ success: true, data: { id: sessionId, deleted: true } });
}
