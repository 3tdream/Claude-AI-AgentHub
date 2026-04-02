import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

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

// GET /api/agent-hub/sessions — list sessions (merged with local)
export async function GET(request: NextRequest) {
  const local = await loadSessions();
  const localList = Object.values(local).filter((s) => !s._deleted);

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";
    const agentId = searchParams.get("agentId") || "";
    const status = searchParams.get("status") || "";

    let url = `/sessions?limit=${limit}&offset=${offset}`;
    if (agentId) url += `&agentId=${agentId}`;
    if (status) url += `&status=${status}`;

    const data = await agentHubFetch(url);
    const hubSessions = Array.isArray(data) ? data : (data as any).sessions ?? [];
    const hubIds = new Set(hubSessions.map((s: any) => s.id));
    const extras = localList.filter((s) => !hubIds.has(s.id));

    return NextResponse.json({ success: true, data: [...hubSessions, ...extras] });
  } catch {
    // Fallback: return local sessions
    return NextResponse.json({ success: true, data: localList, cached: true });
  }
}

// POST /api/agent-hub/sessions — create session
export async function POST(request: NextRequest) {
  const body = await request.json();

  // Try Hub first
  try {
    const data = await agentHubFetch("/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch {
    // Hub offline — save locally
    const id = crypto.randomBytes(12).toString("hex");
    const session: LocalSession = {
      id,
      agentId: body.agentId || "",
      status: "active",
      messages: [],
      createdAt: new Date().toISOString(),
      _local: true,
      ...body,
    };
    const sessions = await loadSessions();
    sessions[id] = session;
    await saveSessions(sessions);
    return NextResponse.json({ success: true, data: session });
  }
}
