import { NextResponse } from "next/server";
import { recordBaseline, getBaseline, getAllBaselines } from "@/lib/eval-baselines";

/**
 * GET /api/pipeline/baselines?template=CRM%20Pipeline
 * Returns baseline history for a template, or all baselines if no template specified.
 *
 * POST /api/pipeline/baselines
 * Records a new pipeline execution as a baseline snapshot.
 * Body: PipelineExecution
 * Returns: RunComparison with delta, regressions, improvements
 */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const template = searchParams.get("template");

    if (template) {
      const baseline = await getBaseline(template);
      if (!baseline) {
        return NextResponse.json({ data: null, message: "No baselines for this template" });
      }
      return NextResponse.json({ data: baseline });
    }

    const all = await getAllBaselines();
    return NextResponse.json({ data: all });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to get baselines" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const execution = await request.json();

    if (!execution.id || !execution.stepResults) {
      return NextResponse.json(
        { error: "Invalid pipeline execution data" },
        { status: 400 },
      );
    }

    const comparison = await recordBaseline(execution);
    return NextResponse.json({ success: true, data: comparison });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to record baseline" },
      { status: 500 },
    );
  }
}
