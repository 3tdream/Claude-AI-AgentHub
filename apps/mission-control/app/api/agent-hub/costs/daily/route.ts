import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { aggregateDailyCostsFromRuns } from "@/lib/pipeline-daily-costs";

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
    const projectId = searchParams.get("projectId") || "";

    let url = `/costs/daily?days=${days}`;
    if (provider) url += `&provider=${provider}`;
    if (projectId) url += `&projectId=${projectId}`;

    const raw = await agentHubFetch<DailyResponse>(url);
    return NextResponse.json({
      success: true,
      data: raw.dailyCosts ?? [],
      summary: raw.summary ?? null,
    });
  } catch {
    // Fallback: aggregate daily costs from local pipeline-runs
    console.log("[API] Agent Hub unreachable, aggregating costs from pipeline-runs");
    const days = Number(new URL(request.url).searchParams.get("days") || "90");
    const localCosts = await aggregateDailyCostsFromRuns(days);
    return NextResponse.json({ success: true, data: localCosts, cached: true, source: "pipeline-runs" });
  }
}
