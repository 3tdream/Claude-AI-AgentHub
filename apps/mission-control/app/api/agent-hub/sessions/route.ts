import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";

// GET /api/agent-hub/sessions — list sessions
export async function GET(request: NextRequest) {
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
    return NextResponse.json({ success: true, data });
  } catch {
    // Fallback: return empty sessions list
    return NextResponse.json({ success: true, data: [], cached: true });
  }
}

// POST /api/agent-hub/sessions — create session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = await agentHubFetch("/sessions", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
