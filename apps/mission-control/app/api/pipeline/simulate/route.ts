import { NextRequest, NextResponse } from "next/server";
import { runPreflightSimulation } from "@/lib/preflight-simulation";
import { CRM_PIPELINE_STAGES } from "@/lib/pipeline-templates";
import type { WorkflowStep } from "@/types";

/**
 * POST /api/pipeline/simulate
 *
 * Pre-flight simulation — predicts pipeline outcome before execution.
 *
 * Body: { input: string, steps?: WorkflowStep[] }
 * If steps not provided, uses CRM_PIPELINE_STAGES.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { input, steps, projectId } = body;

    if (!input || typeof input !== "string") {
      return NextResponse.json({ error: "input is required (string)" }, { status: 400 });
    }

    const pipelineSteps: WorkflowStep[] = steps || CRM_PIPELINE_STAGES;
    const report = await runPreflightSimulation(input, pipelineSteps, projectId);

    return NextResponse.json({ data: report });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
