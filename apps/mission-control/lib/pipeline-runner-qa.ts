/**
 * QA Feedback Loop Runner
 * Extracted from pipeline-executor.ts for maintainability.
 *
 * Runs after QA step completes with VERDICT: FAIL.
 * 1. Group failures by responsible agent
 * 2. Run targeted fixes
 * 3. Full regression re-validation
 * 4. Max 2 cycles, then escalate
 */

import type { PipelineExecution, WorkflowStep } from "@/types";
import { postLog } from "@/lib/hooks/use-logs";
import { PIPELINE, AGENT_CONFIG } from "@/lib/config";
import {
  parseQAResults,
  groupFailuresByAgent,
  buildFixPrompt,
  buildRevalidationPrompt,
  type QAResults,
} from "@/lib/qa-feedback-loop";

const { MAX_QA_FIX_CYCLES } = PIPELINE;

interface QARunnerParams {
  stepId: string;
  steps: WorkflowStep[];
  execution: PipelineExecution;
  context: Record<string, string>;
  onUpdate: (execution: PipelineExecution) => void;
}

interface QARunnerResult {
  shouldBreak: boolean;
}

export async function runQAFeedbackLoop({
  stepId,
  steps,
  execution,
  context,
  onUpdate,
}: QARunnerParams): Promise<QARunnerResult> {
  const qaOutput = execution.stepResults[stepId]?.output || "";
  const qaResults = parseQAResults(qaOutput);

  if (!qaResults || qaResults.verdict !== "FAIL" || qaResults.summary.fail === 0) {
    return { shouldBreak: false };
  }

  postLog({
    type: "system",
    content: `QA FEEDBACK LOOP: ${qaResults.summary.fail} failures (${qaResults.summary.p0_failures} P0). Starting targeted fix cycle.`,
  }).catch(() => {});

  let currentResults: QAResults = qaResults;
  let fixCycleSuccess = false;

  for (let cycle = 1; cycle <= MAX_QA_FIX_CYCLES; cycle++) {
    const fixTargets = groupFailuresByAgent(currentResults);
    if (fixTargets.length === 0) { fixCycleSuccess = true; break; }

    postLog({
      type: "system",
      content: `Fix cycle ${cycle}/${MAX_QA_FIX_CYCLES}: ${fixTargets.map((t) => `${t.agentId} (${t.failures.length} failures)`).join(", ")}`,
    }).catch(() => {});

    // Run targeted fixes for each responsible agent
    const fixOutputs: Record<string, string> = {};

    for (const target of fixTargets) {
      const originalStepId = steps.find((s) => s.agentId === target.agentId)?.id;
      const originalOutput = originalStepId ? (execution.stepResults[originalStepId]?.output || "") : "";
      const architectOutput = context["step_s3.2-api_output"] || "";
      const fixPrompt = buildFixPrompt(target, originalOutput, cycle, architectOutput);
      const fixStepId = `${originalStepId || target.agentId}-fix-${cycle}`;

      execution.stepResults[fixStepId] = {
        stepId: fixStepId,
        status: "running",
        startedAt: new Date().toISOString(),
      };
      onUpdate({ ...execution });

      try {
        const agentCfg = AGENT_CONFIG[target.agentId];
        const res = await fetch("/api/ai/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: target.agentId,
            model: "sonnet-4-6",
            userInput: fixPrompt,
            useTools: true,
            toolMode: "readwrite",
            maxToolSteps: agentCfg?.maxTurns || 5,
            readBudget: agentCfg?.readBudget || 5,
          }),
        });

        const data = await res.json();
        const fixOutput = data.content || "";
        fixOutputs[target.agentId] = fixOutput;

        if (originalStepId) {
          context[`step_${originalStepId}_output`] = fixOutput;
        }

        execution.stepResults[fixStepId] = {
          stepId: fixStepId,
          status: "completed",
          output: fixOutput.substring(0, 20000),
          duration: Date.now() - new Date(execution.stepResults[fixStepId].startedAt!).getTime(),
          completedAt: new Date().toISOString(),
          inputTokens: data.tokensUsed?.input || 0,
          outputTokens: data.tokensUsed?.output || 0,
          provider: data.provider || "unknown",
          model: data.model || "unknown",
        };
        onUpdate({ ...execution });

        postLog({
          type: "decision",
          agentId: target.agentId,
          content: `Fix cycle ${cycle}: ${target.agentId} fixed ${target.failures.length} failures in ${target.filePaths.join(", ")}`,
        }).catch(() => {});
      } catch (err) {
        execution.stepResults[fixStepId] = {
          stepId: fixStepId,
          status: "failed",
          error: err instanceof Error ? err.message : "Fix failed",
          completedAt: new Date().toISOString(),
        };
        onUpdate({ ...execution });
      }
    }

    // Re-validate: full regression check
    const failedCriteria = currentResults.acceptance_results.filter(
      (r) => r.status === "FAIL" || r.status === "PARTIAL"
    );
    const revalPrompt = buildRevalidationPrompt(
      currentResults.acceptance_results, failedCriteria, fixOutputs
    );
    const revalStepId = `s5-qa-reval-${cycle}`;

    execution.stepResults[revalStepId] = {
      stepId: revalStepId,
      status: "running",
      startedAt: new Date().toISOString(),
    };
    onUpdate({ ...execution });

    try {
      const revalRes = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "qa-agent",
          model: "sonnet-4-6",
          userInput: revalPrompt,
          useTools: true,
          toolMode: "qa",
          maxToolSteps: 5,
          readBudget: 5,
        }),
      });

      const revalData = await revalRes.json();
      const revalOutput = revalData.content || "";
      const revalResults = parseQAResults(revalOutput);

      execution.stepResults[revalStepId] = {
        stepId: revalStepId,
        status: "completed",
        output: revalOutput.substring(0, 20000),
        duration: Date.now() - new Date(execution.stepResults[revalStepId].startedAt!).getTime(),
        completedAt: new Date().toISOString(),
        inputTokens: revalData.tokensUsed?.input || 0,
        outputTokens: revalData.tokensUsed?.output || 0,
      };
      onUpdate({ ...execution });

      if (revalResults && revalResults.verdict === "PASS") {
        postLog({
          type: "system",
          content: `QA FEEDBACK LOOP: All criteria PASS after fix cycle ${cycle}. Continuing pipeline.`,
        }).catch(() => {});
        execution.stepResults[stepId] = {
          ...execution.stepResults[stepId],
          output: revalOutput.substring(0, 20000),
          evaluationFeedback: `Fixed after ${cycle} cycle(s)`,
        };
        context[`step_${stepId}_output`] = revalOutput;
        fixCycleSuccess = true;
        break;
      }

      if (revalResults) {
        currentResults = revalResults;
        postLog({
          type: "system",
          content: `Fix cycle ${cycle} incomplete: ${revalResults.summary.fail} criteria still failing. ${cycle < MAX_QA_FIX_CYCLES ? "Retrying..." : "Escalating to user."}`,
        }).catch(() => {});
      }
    } catch {
      execution.stepResults[revalStepId] = {
        stepId: revalStepId,
        status: "failed",
        error: "Re-validation failed",
        completedAt: new Date().toISOString(),
      };
      onUpdate({ ...execution });
    }
  }

  if (!fixCycleSuccess) {
    postLog({
      type: "system",
      content: `QA FEEDBACK LOOP: ${MAX_QA_FIX_CYCLES} fix cycles exhausted. ${currentResults.summary.p0_failures} P0 failures remain. Escalating to user.`,
    }).catch(() => {});
    execution.status = "paused";
    execution.escalatedSteps = [...(execution.escalatedSteps || []), stepId];
    onUpdate({ ...execution });
    return { shouldBreak: true };
  }

  return { shouldBreak: false };
}
