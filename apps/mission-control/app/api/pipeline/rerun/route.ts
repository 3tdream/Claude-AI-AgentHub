/**
 * POST /api/pipeline/rerun — Prepare a pipeline execution for rerun from failure point.
 *
 * Loads the previous run, identifies the first failed step (or uses fromStage),
 * clears failed/pending steps, and returns a PipelineExecution ready for
 * the client-side executePipeline(steps, input, callbacks, ..., previousExecution).
 *
 * Body: { runId: string (UUID or MC-NNN), fromStage?: string }
 * Returns: { execution, resumeFromStage, stepsSkipped, stepsToRerun }
 */
import { NextRequest, NextResponse } from "next/server";
import { loadRun, findRunByShortId } from "@/lib/pipeline-run-storage";
import { RerunRequest, RerunResponse, PipelineExecution, StepResult } from "@/types/workflow";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHORT_ID_RE = /^MC-\d{3,}$/i;

export async function POST(request: NextRequest) {
  let body: RerunRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body", detail: "Invalid JSON" }, { status: 400 });
  }

  const { runId, fromStage } = body;
  if (!runId) {
    return NextResponse.json({ error: "invalid_body", detail: "runId is required" }, { status: 400 });
  }

  // Load previous run (by UUID or MC-NNN short ID)
  let prevRun: PipelineExecution | null = null;
  if (UUID_RE.test(runId)) {
    prevRun = await loadRun(runId);
  } else if (SHORT_ID_RE.test(runId)) {
    prevRun = await findRunByShortId(runId);
  } else {
    return NextResponse.json({ error: "invalid_body", detail: "runId must be UUID or MC-NNN" }, { status: 400 });
  }

  if (!prevRun) {
    return NextResponse.json({ error: "not_found", detail: `Run ${runId} not found` }, { status: 404 });
  }

  // Only allow rerun of failed/stopped/paused/interrupted runs
  const rerunnable: string[] = ["failed", "stopped", "paused", "interrupted", "escalated"];
  if (!rerunnable.includes(prevRun.status)) {
    return NextResponse.json({
      error: "invalid_state",
      detail: `Run status is "${prevRun.status}" — can only rerun ${rerunnable.join(", ")}`,
    }, { status: 409 });
  }

  // Determine resume point
  const stepEntries = Object.entries(prevRun.stepResults || {});
  let resumeFromStage: string;

  if (fromStage) {
    // Validate that fromStage exists in the run
    if (!prevRun.stepResults?.[fromStage]) {
      return NextResponse.json({
        error: "invalid_stage",
        detail: `Stage "${fromStage}" not found in run. Available: ${stepEntries.map(([k]) => k).join(", ")}`,
      }, { status: 400 });
    }
    resumeFromStage = fromStage;
  } else {
    // Auto-detect: first failed/escalated step
    const failedEntry = stepEntries.find(
      ([, r]) => r.status === "failed" || (r.status as string) === "escalated" || r.status === "retrying"
    );
    if (failedEntry) {
      resumeFromStage = failedEntry[0];
    } else {
      // No failed step found — find first non-completed step
      const pendingEntry = stepEntries.find(([, r]) => r.status !== "completed" && r.status !== "skipped");
      if (pendingEntry) {
        resumeFromStage = pendingEntry[0];
      } else {
        return NextResponse.json({
          error: "no_failure",
          detail: "All steps completed — nothing to rerun",
        }, { status: 409 });
      }
    }
  }

  // Build rerun execution: keep ALL completed steps (regardless of position), reset the rest
  const stepsSkipped: string[] = [];
  const stepsToRerun: string[] = [];
  const newStepResults: Record<string, StepResult> = {};

  for (const [stepId, result] of stepEntries) {
    if (result.status === "completed") {
      // Keep completed step — will be used as context
      newStepResults[stepId] = { ...result, source: "resumed" };
      stepsSkipped.push(stepId);
    } else {
      // Reset failed/pending/retrying steps to pending
      newStepResults[stepId] = {
        stepId,
        status: "pending",
      };
      stepsToRerun.push(stepId);
    }
  }

  // Build the rerun execution object
  const rerunExecution: PipelineExecution = {
    ...prevRun,
    // Keep original ID so executePipeline can resume with context
    stepResults: newStepResults,
    status: "pending",
    completedAt: undefined,
    totalDuration: undefined,
    rerunFromId: prevRun.id,
    rerunFromStage: resumeFromStage,
  };

  const response: RerunResponse = {
    execution: rerunExecution,
    resumeFromStage,
    stepsSkipped,
    stepsToRerun,
  };

  return NextResponse.json({ success: true, ...response });
}
