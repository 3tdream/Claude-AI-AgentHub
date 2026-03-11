import type { WorkflowStep, PipelineExecution, QualityScore } from "@/types";
import { postLog } from "@/lib/hooks/use-logs";
import { evaluateStepOutput, buildRetryPrompt } from "@/lib/quality-evaluator";

const MAX_RETRIES = 2;
const ESCALATION_THRESHOLD = 5;

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// --- Jira sync helper (calls server-side API route, never imports fs) ---

async function jiraSyncAction(action: string, payload: Record<string, unknown>): Promise<unknown> {
  try {
    const res = await fetch("/api/jira/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...payload }),
    });
    return await res.json();
  } catch {
    return null; // Non-blocking — Jira failures never stop the pipeline
  }
}

interface ExecutorCallbacks {
  onUpdate: (execution: PipelineExecution) => void;
  onCheckpointReached: () => Promise<boolean>;
  getCheckpointStatus: () => { approved: boolean; rejected: boolean; reason?: string };
  onEscalation?: (stepId: string, agentName: string, score: number, feedback: string) => void;
}

export async function executePipeline(
  steps: WorkflowStep[],
  input: string,
  workflowId: string,
  workflowName: string,
  callbacks: ExecutorCallbacks,
): Promise<PipelineExecution> {
  const execution: PipelineExecution = {
    id: generateId(),
    workflowId,
    workflowName,
    status: "running",
    input,
    stepResults: {},
    startedAt: new Date().toISOString(),
    qualityScores: {},
    escalatedSteps: [],
  };

  steps.forEach((s) => {
    execution.stepResults[s.id] = { stepId: s.id, status: "pending" };
  });
  callbacks.onUpdate({ ...execution });

  postLog({
    type: "system",
    content: `Pipeline "${workflowName}" started with input: ${input.slice(0, 200)}`,
  }).catch(() => {});

  // --- Jira: Check if enabled + create Epic ---
  let jiraKey: string | null = null;

  const jiraCheck = await jiraSyncAction("check-enabled", {}) as { enabled?: boolean } | null;
  const jiraEnabled = jiraCheck?.enabled === true;

  if (jiraEnabled) {
    const epicResult = await jiraSyncAction("create-epic", { execution }) as {
      result?: { jiraKey: string; jiraUrl: string } | null;
    } | null;
    if (epicResult?.result) {
      jiraKey = epicResult.result.jiraKey;
      execution.jiraKey = epicResult.result.jiraKey;
      execution.jiraUrl = epicResult.result.jiraUrl;
      callbacks.onUpdate({ ...execution });
    }
  }

  const completed = new Set<string>();
  const context: Record<string, string> = {};

  async function executeStep(step: WorkflowStep): Promise<boolean> {
    // --- Checkpoint handling ---
    if (step.metadata?.isCheckpoint) {
      execution.stepResults[step.id] = {
        stepId: step.id,
        status: "awaiting_approval",
        startedAt: new Date().toISOString(),
      };
      execution.checkpointPending = true;
      execution.status = "paused";
      callbacks.onUpdate({ ...execution });

      postLog({
        type: "system",
        content: `Pipeline "${workflowName}" paused at Human Checkpoint — awaiting approval`,
      }).catch(() => {});

      if (jiraKey) jiraSyncAction("checkpoint-reached", { jiraKey });

      const approved = await callbacks.onCheckpointReached();

      if (jiraKey) {
        const checkStatus = callbacks.getCheckpointStatus();
        jiraSyncAction("checkpoint-decision", {
          jiraKey, approved, reason: checkStatus.reason,
        });
      }

      if (approved) {
        execution.stepResults[step.id] = {
          stepId: step.id,
          status: "completed",
          output: "Checkpoint approved by user",
          completedAt: new Date().toISOString(),
          duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
        };
        execution.checkpointPending = false;
        execution.status = "running";
        callbacks.onUpdate({ ...execution });
        completed.add(step.id);
        return true;
      } else {
        const status = callbacks.getCheckpointStatus();
        execution.stepResults[step.id] = {
          stepId: step.id,
          status: "failed",
          error: `Rejected: ${status.reason || "No reason given"}`,
          completedAt: new Date().toISOString(),
        };
        execution.checkpointPending = false;
        execution.status = "failed";
        execution.checkpointRejectionReason = status.reason;
        callbacks.onUpdate({ ...execution });
        return false;
      }
    }

    // --- Normal step execution with quality evaluation + retry loop ---
    const threshold = step.metadata?.qualityThreshold ?? 8;
    let retryCount = 0;
    let lastFeedback = "";
    let currentPrompt = buildPrompt(step, input, context);
    const model = step.metadata?.model || "unknown";

    // Jira: stage start
    if (jiraKey) {
      jiraSyncAction("stage-start", {
        jiraKey, stageId: step.id, agentName: step.agentName, model,
      });
    }

    while (retryCount <= MAX_RETRIES) {
      execution.stepResults[step.id] = {
        stepId: step.id,
        status: retryCount === 0 ? "running" : "retrying",
        startedAt: new Date().toISOString(),
        retryCount,
        evaluationFeedback: retryCount > 0 ? lastFeedback : undefined,
      };
      callbacks.onUpdate({ ...execution });

      try {
        const res = await fetch("/api/agent-hub/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assistantId: step.agentId, userInput: currentPrompt }),
        });
        const data = await res.json();

        if (!data.success || !data.content) {
          throw new Error(data.error || "Execution failed");
        }

        const agentOutput = data.content;
        context[`step_${step.id}_output`] = agentOutput;

        const skipEvaluation = step.agentId === "orchestrator" || threshold === 0;

        if (skipEvaluation) {
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "completed",
            output: agentOutput.substring(0, 500),
            duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
            completedAt: new Date().toISOString(),
            retryCount,
          };
          if (execution.qualityScores) {
            execution.qualityScores[step.id] = {
              completeness: 10, specificity: 10, actionability: 10, overall: 10,
            };
          }
          callbacks.onUpdate({ ...execution });

          postLog({
            type: "decision",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `Step completed (auto-pass) in pipeline "${workflowName}": ${agentOutput.slice(0, 200)}`,
          }).catch(() => {});

          // Jira: stage pass
          if (jiraKey) {
            jiraSyncAction("stage-pass", {
              jiraKey, stageId: step.id, agentName: step.agentName, model,
              duration: execution.stepResults[step.id].duration,
              qualityScore: execution.qualityScores?.[step.id],
              retryCount,
            });
          }

          completed.add(step.id);
          return true;
        }

        const evaluation = await evaluateStepOutput(
          step.agentName,
          step.metadata?.stageNumber || "?",
          input,
          agentOutput,
        );

        if (execution.qualityScores) {
          execution.qualityScores[step.id] = evaluation.score;
        }

        postLog({
          type: "decision",
          agentId: "orchestrator",
          agentName: "Orchestrator",
          content: `Quality eval for ${step.agentName}: ${evaluation.score.overall}/10 → ${evaluation.passed ? "PASS" : "FAIL"}. ${evaluation.feedback.slice(0, 200)}`,
        }).catch(() => {});

        if (evaluation.passed) {
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "completed",
            output: agentOutput.substring(0, 500),
            duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
            completedAt: new Date().toISOString(),
            retryCount,
            evaluationFeedback: evaluation.feedback,
          };
          callbacks.onUpdate({ ...execution });

          postLog({
            type: "decision",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `Step PASSED (${evaluation.score.overall}/10, attempt ${retryCount + 1}) in pipeline "${workflowName}"`,
          }).catch(() => {});

          if (jiraKey) {
            jiraSyncAction("stage-pass", {
              jiraKey, stageId: step.id, agentName: step.agentName, model,
              duration: execution.stepResults[step.id].duration,
              qualityScore: evaluation.score,
              retryCount,
            });
          }

          completed.add(step.id);
          return true;
        }

        lastFeedback = evaluation.feedback;

        if (retryCount < MAX_RETRIES) {
          postLog({
            type: "system",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `Step scored ${evaluation.score.overall}/10 (below ${threshold}) — retrying (attempt ${retryCount + 2}/${MAX_RETRIES + 1}). Feedback: ${evaluation.feedback.slice(0, 200)}`,
          }).catch(() => {});

          currentPrompt = buildRetryPrompt(
            step.agentName,
            buildPrompt(step, input, context),
            agentOutput,
            evaluation.feedback,
          );

          retryCount++;
          continue;
        }

        // Max retries exhausted
        if (evaluation.score.overall < ESCALATION_THRESHOLD) {
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "failed",
            output: agentOutput.substring(0, 500),
            error: `Escalated: score ${evaluation.score.overall}/10 after ${MAX_RETRIES + 1} attempts. ${evaluation.feedback}`,
            completedAt: new Date().toISOString(),
            retryCount,
            evaluationFeedback: evaluation.feedback,
            escalated: true,
          };
          execution.escalatedSteps = [...(execution.escalatedSteps || []), step.id];
          callbacks.onUpdate({ ...execution });

          postLog({
            type: "system",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `ESCALATION: ${step.agentName} scored ${evaluation.score.overall}/10 after ${MAX_RETRIES + 1} attempts — pipeline halted, user intervention required`,
          }).catch(() => {});

          if (jiraKey) {
            jiraSyncAction("stage-escalation", {
              jiraKey, stageId: step.id, agentName: step.agentName,
              score: evaluation.score.overall, feedback: evaluation.feedback,
            });
          }

          callbacks.onEscalation?.(step.id, step.agentName, evaluation.score.overall, evaluation.feedback);

          completed.add(step.id);
          return false;
        }

        // Score >= 5 but < 8 after max retries — accept with warning
        execution.stepResults[step.id] = {
          stepId: step.id,
          status: "completed",
          output: agentOutput.substring(0, 500),
          duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
          completedAt: new Date().toISOString(),
          retryCount,
          evaluationFeedback: `Accepted with warning (${evaluation.score.overall}/10 after ${MAX_RETRIES + 1} attempts): ${evaluation.feedback}`,
        };
        callbacks.onUpdate({ ...execution });

        postLog({
          type: "decision",
          agentId: step.agentId,
          agentName: step.agentName,
          content: `Step accepted with warning (${evaluation.score.overall}/10) after ${MAX_RETRIES + 1} attempts in pipeline "${workflowName}"`,
        }).catch(() => {});

        if (jiraKey) {
          jiraSyncAction("stage-pass", {
            jiraKey, stageId: step.id, agentName: step.agentName, model,
            duration: execution.stepResults[step.id].duration,
            qualityScore: evaluation.score,
            retryCount,
          });
        }

        completed.add(step.id);
        return true;

      } catch (err) {
        execution.stepResults[step.id] = {
          stepId: step.id,
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown error",
          completedAt: new Date().toISOString(),
          retryCount,
        };

        postLog({
          type: "system",
          agentId: step.agentId,
          agentName: step.agentName,
          content: `Step FAILED in pipeline "${workflowName}": ${err instanceof Error ? err.message : "Unknown error"}`,
        }).catch(() => {});

        completed.add(step.id);
        callbacks.onUpdate({ ...execution });
        return false;
      }
    }

    completed.add(step.id);
    return false;
  }

  // --- Topological execution with parallel group support ---
  const remaining = [...steps];

  while (remaining.length > 0) {
    const ready = remaining.filter((s) => s.dependsOn.every((d) => completed.has(d)));
    if (ready.length === 0) break;

    const parallelGroup = ready.filter((s) => s.metadata?.isParallel && s.metadata?.group);
    const groupName = parallelGroup[0]?.metadata?.group;

    if (parallelGroup.length > 1 && groupName && parallelGroup.every((s) => s.metadata?.group === groupName)) {
      const results = await Promise.all(parallelGroup.map(executeStep));
      const anyFailed = results.some((r) => !r);

      parallelGroup.forEach((r) => {
        const idx = remaining.findIndex((s) => s.id === r.id);
        if (idx >= 0) remaining.splice(idx, 1);
      });

      if (anyFailed) {
        execution.status = "failed";
        break;
      }
    } else {
      const step = ready[0];
      const success = await executeStep(step);
      const idx = remaining.findIndex((s) => s.id === step.id);
      if (idx >= 0) remaining.splice(idx, 1);

      if (!success && step.metadata?.isCheckpoint) break;
      if (!success && execution.stepResults[step.id]?.escalated) {
        execution.status = "paused";
        break;
      }
      if (!success) {
        execution.status = "failed";
        break;
      }
    }
  }

  if (execution.status === "running") {
    execution.status = Object.values(execution.stepResults).some((r) => r.status === "failed")
      ? "failed"
      : "completed";
  }
  execution.completedAt = new Date().toISOString();
  execution.totalDuration = Date.now() - new Date(execution.startedAt).getTime();
  callbacks.onUpdate({ ...execution });

  // Jira: Finalize pipeline
  if (jiraKey) {
    jiraSyncAction("finalize", { jiraKey, execution });
  }

  // Auto-enrich knowledge base (fire-and-forget)
  if (execution.status === "completed" || execution.status === "failed") {
    fetch("/api/knowledge/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(execution),
    }).catch(() => {});
  }

  return execution;
}

function buildPrompt(step: WorkflowStep, input: string, context: Record<string, string>): string {
  let prompt = step.promptTemplate.replace(/\{\{input\}\}/g, input);
  for (const [key, val] of Object.entries(context)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
  }
  return prompt;
}
