import { NextRequest, NextResponse } from "next/server";
import { savePipelineRun, getAgentLearningContext, getRecentAgentRuns } from "@/lib/pipeline-analytics-storage";

/**
 * POST /api/pipeline/analytics — Save pipeline execution to learning database
 * GET /api/pipeline/analytics?agentId=xxx — Get learning context for an agent
 */
export async function POST(request: NextRequest) {
  try {
    const execution = await request.json();
    const record = await savePipelineRun(execution);
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
