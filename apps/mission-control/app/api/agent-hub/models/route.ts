import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";

// GET /api/agent-hub/models — list available LLM models
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const provider = searchParams.get("provider") || "";

    let url = "/models";
    if (provider) url += `?provider=${provider}`;

    const data = await agentHubFetch(url);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
