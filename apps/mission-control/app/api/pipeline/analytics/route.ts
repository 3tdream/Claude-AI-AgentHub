import { NextRequest, NextResponse } from "next/server";
import { savePipelineRun, getAgentLearningContext, getRecentAgentRuns, recalculateAnalytics } from "@/lib/pipeline-analytics-storage";

/**
 * POST /api/pipeline/analytics — Save pipeline execution to learning database
 *   body: { action: "recalculate" } — rebuild analytics from all runs (excludes stopped/paused)
 *   body: { ...execution } — save a new run
 * GET /api/pipeline/analytics?agentId=xxx — Get learning context for an agent
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Recalculate action — rebuild from all saved runs
    if (body.action === "recalculate") {
      const analytics = await recalculateAnalytics();
      return NextResponse.json({ success: true, totalRuns: analytics.totalRuns, agents: Object.keys(analytics.agentStats).length });
    }

    const record = await savePipelineRun(body);
    return NextResponse.json({ success: true, id: record.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const agentId = request.nextUrl.searchParams.get("agentId");
  const taskText = request.nextUrl.searchParams.get("task") || undefined;
  if (!agentId) {
    return NextResponse.json({ error: "agentId required" }, { status: 400 });
  }

  try {
    const [stats, recent] = await Promise.all([
      getAgentLearningContext(agentId, taskText),
      getRecentAgentRuns(agentId, 3),
    ]);
    return NextResponse.json({ context: stats + recent });
  } catch {
    return NextResponse.json({ context: "" });
  }
}
