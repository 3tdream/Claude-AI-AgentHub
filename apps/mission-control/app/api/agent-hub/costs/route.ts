import { NextRequest, NextResponse } from "next/server";
import { agentHubFetch } from "@/lib/agent-hub-client";
import { cachedCostSummary } from "@/lib/agent-hub-cache";

// GET /api/agent-hub/costs — get cost summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";
    const provider = searchParams.get("provider") || "";

    let url = "/costs/summary";
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (provider) params.set("provider", provider);
    const qs = params.toString();
    if (qs) url += `?${qs}`;

    const raw = await agentHubFetch<{ success: boolean; summary: unknown }>(url);
    return NextResponse.json({ success: true, data: raw.summary ?? raw });
  } catch {
    // Fallback to cached data when Agent Hub backend is unreachable
    console.log("[API] Agent Hub unreachable, serving cached cost summary");
    return NextResponse.json({ success: true, data: cachedCostSummary, cached: true });
  }
}
