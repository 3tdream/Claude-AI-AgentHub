import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedDailyCosts } from "@/lib/agent-hub-cache";

interface DailyResponse {
  success: boolean;
  summary: unknown;
  dailyCosts: unknown[];
}

// GET /api/agent-hub/costs/daily — get daily cost breakdown
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = searchParams.get("days") || "30";
    const provider = searchParams.get("provider") || "";

    let url = `/costs/daily?days=${days}`;
    if (provider) url += `&provider=${provider}`;

    const raw = await agentHubFetch<DailyResponse>(url);
    return NextResponse.json({
      success: true,
      data: raw.dailyCosts ?? [],
      summary: raw.summary ?? null,
    });
  } catch {
    // Fallback to cached data when Agent Hub backend is unreachable
    console.log("[API] Agent Hub unreachable, serving cached daily costs");
    return NextResponse.json({ success: true, data: cachedDailyCosts, cached: true });
  }
}
