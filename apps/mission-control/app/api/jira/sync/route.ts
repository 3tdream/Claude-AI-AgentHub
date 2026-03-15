import { NextResponse } from "next/server";
import * as jiraSync from "@/lib/jira-sync-service";
import type { PipelineExecution, QualityScore } from "@/types";

/**
 * POST /api/jira/sync
 *
 * Dispatches Jira lifecycle actions from the pipeline executor.
 * Body: { action: string, ...params }
 *
 * All actions are non-blocking from the executor's perspective.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "check-enabled": {
        const enabled = await jiraSync.isJiraSyncEnabled();
        return NextResponse.json({ enabled });
      }

      case "create-epic": {
        const result = await jiraSync.createPipelineEpic(body.execution as PipelineExecution);
        return NextResponse.json({ result });
      }

      case "stage-start": {
        await jiraSync.onStageStart(body.jiraKey, body.stageId, body.agentName, body.model);
        return NextResponse.json({ ok: true });
      }

      case "stage-pass": {
        await jiraSync.onStagePass(
          body.jiraKey, body.stageId, body.agentName, body.model,
          body.duration, body.qualityScore as QualityScore | undefined, body.retryCount,
        );
        return NextResponse.json({ ok: true });
      }

      case "stage-escalation": {
        await jiraSync.onStageEscalation(
          body.jiraKey, body.stageId, body.agentName, body.score, body.feedback,
        );
        return NextResponse.json({ ok: true });
      }

      case "checkpoint-reached": {
        await jiraSync.onCheckpointReached(body.jiraKey);
        return NextResponse.json({ ok: true });
      }

      case "checkpoint-decision": {
        await jiraSync.onCheckpointDecision(body.jiraKey, body.approved, body.reason);
        return NextResponse.json({ ok: true });
      }

      case "finalize": {
        await jiraSync.finalizePipeline(body.jiraKey, body.execution as PipelineExecution);
        return NextResponse.json({ ok: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Jira sync failed" },
      { status: 500 },
    );
  }
}
