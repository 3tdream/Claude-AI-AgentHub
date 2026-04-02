import { NextResponse } from "next/server";
import {
  evolveFromPipelineRun,
  applyAgingDecayAll,
  getConfidenceReport,
} from "@/lib/kb-evolution";
import { addLog } from "@/lib/logs-storage";

/**
 * POST /api/knowledge/evolve
 * Two modes:
 *   { action: "pipeline", stepResults: [...], pipelineRunId: "..." }
 *   { action: "aging" }
 *
 * GET /api/knowledge/evolve
 *   Returns confidence distribution report
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.action === "pipeline") {
      if (!body.stepResults || !body.pipelineRunId) {
        return NextResponse.json(
          { error: "Missing stepResults or pipelineRunId" },
          { status: 400 },
        );
      }

      const result = await evolveFromPipelineRun(body.stepResults, body.pipelineRunId);

      await addLog({
        type: "system",
        content: `KB evolution: ${result.boosted.length} patterns boosted, ${result.decayed.length} decayed from pipeline ${body.pipelineRunId}`,
      });

      return NextResponse.json({ success: true, data: result });
    }

    if (body.action === "aging") {
      const result = await applyAgingDecayAll();

      if (result.totalAged > 0) {
        await addLog({
          type: "system",
          content: `KB aging: ${result.totalAged} entries decayed, ${result.totalStaled} marked stale`,
        });
      }

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { error: "Unknown action. Use 'pipeline' or 'aging'" },
      { status: 400 },
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Evolution failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const report = await getConfidenceReport();
    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Report failed" },
      { status: 500 },
    );
  }
}
