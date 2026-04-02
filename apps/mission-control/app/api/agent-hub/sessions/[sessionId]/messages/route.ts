import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

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

// POST /api/agent-hub/sessions/[sessionId]/messages — send message
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { sessionId } = await params;
  const body = await request.json();

  if (!body.message) {
    return NextResponse.json(
      { success: false, error: "message is required" },
      { status: 400 },
    );
  }

  // Try Hub first
  try {
    const data = await agentHubFetch(`/sessions/${sessionId}/messages`, {
      method: "POST",
      body: JSON.stringify({
        message: body.message,
        waitForResponse: body.waitForResponse ?? true,
        timeout: body.timeout ?? 60000,
        attachments: body.attachments,
      }),
    });
    return NextResponse.json({ success: true, data });
  } catch {
    // Hub offline — append message locally
    const sessions = await loadSessions();
    if (!sessions[sessionId]) {
      sessions[sessionId] = {
        id: sessionId,
        agentId: "",
        status: "active",
        messages: [],
        createdAt: new Date().toISOString(),
        _local: true,
      };
    }

    const msg = {
      id: crypto.randomBytes(12).toString("hex"),
      sessionId,
      role: "user",
      content: body.message,
      createdAt: new Date().toISOString(),
      _local: true,
    };

    sessions[sessionId].messages.push(msg);
    await saveSessions(sessions);

    return NextResponse.json({ success: true, data: msg });
  }
}
