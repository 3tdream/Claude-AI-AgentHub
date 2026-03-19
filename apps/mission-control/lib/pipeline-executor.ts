import type { WorkflowStep, PipelineExecution, QualityScore } from "@/types";
import { postLog } from "@/lib/hooks/use-logs";
import { evaluateStepOutput, buildRetryPrompt } from "@/lib/quality-evaluator";
import { PIPELINE, AGENT_CONFIG, TOOL_OUTPUT_LIMITS } from "@/lib/config";
import type { RoutingDecisionData } from "@/types";
// Analytics storage accessed via API (can't import fs in client-side code)

const { MAX_RETRIES, STEP_TIMEOUT_MS } = PIPELINE;

function generateId() {
  return crypto.randomUUID();
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
  isPauseRequested?: () => boolean;
  isStopRequested?: () => boolean;
}

export async function executePipeline(
  steps: WorkflowStep[],
  input: string,
  workflowId: string,
  workflowName: string,
  callbacks: ExecutorCallbacks,
  routingDecision?: RoutingDecisionData,
  selectedProject?: string | null,
  previousExecution?: PipelineExecution | null,
): Promise<PipelineExecution> {
  if (!steps.length) throw new Error("Pipeline must have at least one step");
  if (!input.trim()) throw new Error("Pipeline input cannot be empty");

  for (const step of steps) {
    if (!step.agentId) throw new Error(`Step "${step.id}" is missing agentId`);
    if (!step.promptTemplate) throw new Error(`Step "${step.id}" is missing promptTemplate`);
  }

  // --- Smart Context Loader: fetch project-specific context ---
  let projectContext: { architecture: string; rules: string; knowledgeBase: Array<{ name: string; content: string }>; fallbackUsed: boolean } | null = null;
  if (selectedProject) {
    try {
      const ctxRes = await fetch(`/api/projects/context?projectId=${encodeURIComponent(selectedProject)}`);
      if (ctxRes.ok) {
        projectContext = await ctxRes.json();
        postLog({
          type: "system",
          content: `Project context loaded: "${selectedProject}"${projectContext?.fallbackUsed ? " (fallback)" : ""} — arch: ${(projectContext?.architecture?.length || 0)} chars, rules: ${(projectContext?.rules?.length || 0)} chars, KB: ${projectContext?.knowledgeBase?.length || 0} files`,
        }).catch(() => {});
      }
    } catch {
      postLog({
        type: "system",
        content: `Warning: Failed to load project context for "${selectedProject}" — agents will run without project context`,
      }).catch(() => {});
    }
  }

  const execution: PipelineExecution = {
    id: previousExecution?.id || generateId(),
    workflowId,
    workflowName,
    status: "running",
    input,
    stepResults: previousExecution?.stepResults || {},
    startedAt: previousExecution?.startedAt || new Date().toISOString(),
    qualityScores: previousExecution?.qualityScores || {},
    escalatedSteps: previousExecution?.escalatedSteps || [],
    routingDecision: routingDecision || undefined,
  };

  // Initialize pending steps (skip already completed from resume)
  steps.forEach((s) => {
    if (!execution.stepResults[s.id] || execution.stepResults[s.id].status === "failed" || execution.stepResults[s.id].status === "pending") {
      execution.stepResults[s.id] = { stepId: s.id, status: "pending" };
    }
  });
  callbacks.onUpdate({ ...execution });

  postLog({
    type: "system",
    content: `Pipeline "${workflowName}" started [mode: ${routingDecision?.mode ?? "full"}] with ${steps.length} steps. Input: ${input.slice(0, 200)}`,
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

  // QA-gated success capture: implementation agent wins are held until QA confirms
  const pendingSuccessCaptures: Array<{
    agent: string; score: number; tokens: number;
    toolCalls: number; duration: number; model: string; task: string;
  }> = [];

  // Resume: populate completed set and context from previous results
  if (previousExecution) {
    for (const [stepId, result] of Object.entries(previousExecution.stepResults)) {
      if (result.status === "completed" && result.output) {
        completed.add(stepId);
        context[`step_${stepId}_output`] = result.output;
        // Mark as resumed
        execution.stepResults[stepId] = { ...result, source: "resumed" as any };
      }
    }
    postLog({
      type: "system",
      content: `Pipeline RESUMED — ${completed.size} stages reused from previous run ${previousExecution.id.slice(0, 8)}`,
    }).catch(() => {});
  }

  async function executeStep(step: WorkflowStep): Promise<boolean> {
    // --- Task cache check: reuse output from past successful runs ---
    if (!step.metadata?.isCheckpoint) {
      try {
        const cacheRes = await fetch(`/api/pipeline/cache?input=${encodeURIComponent(input)}&stepId=${step.id}&minScore=${step.metadata?.qualityThreshold || 7.5}`);
        const cacheData = await cacheRes.json();
        if (cacheData.cached && cacheData.output) {
          context[`step_${step.id}_output`] = cacheData.output;
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "completed",
            output: cacheData.output,
            completedAt: new Date().toISOString(),
            source: "cached" as any,
            cachedFromRun: cacheData.runId,
          };
          if (execution.qualityScores) {
            execution.qualityScores[step.id] = {
              completeness: cacheData.score, specificity: cacheData.score,
              actionability: cacheData.score, overall: cacheData.score,
            };
          }
          callbacks.onUpdate({ ...execution });
          postLog({ type: "system", content: `Stage ${step.id} CACHED from run ${cacheData.runId} (score: ${cacheData.score})` }).catch(() => {});
          completed.add(step.id);
          return true;
        }
      } catch { /* cache miss — run normally */ }
    }

    // --- Smart Skip: skip implementation agents if Architect determined no work for them ---
    const skipCandidates: Record<string, RegExp> = {
      "frontend-agent": /no\s*(frontend|ui|client|component)\s*(change|work|needed|required)/i,
      "backend-agent": /no\s*(backend|api|server|endpoint)\s*(change|work|needed|required)/i,
      "designer-agent": /no\s*(design|css|styling|token)\s*(change|work|needed|required)/i,
    };
    if (skipCandidates[step.agentId]) {
      const architectOutput = context["step_s3-architect_output"] || "";
      const orchestratorOutput = context["step_s1-orchestrator_output"] || "";
      const combinedUpstream = architectOutput + "\n" + orchestratorOutput;
      if (skipCandidates[step.agentId].test(combinedUpstream)) {
        execution.stepResults[step.id] = {
          stepId: step.id,
          status: "completed",
          output: "Smart Skip: Architect determined no work required for this agent.",
          completedAt: new Date().toISOString(),
          source: "skipped" as any,
        };
        if (execution.qualityScores) {
          execution.qualityScores[step.id] = { completeness: 10, specificity: 10, actionability: 10, overall: 10 };
        }
        callbacks.onUpdate({ ...execution });
        postLog({ type: "system", agentId: step.agentId, agentName: step.agentName, content: `Smart Skip: ${step.agentName} — no work determined by Architect` }).catch(() => {});
        completed.add(step.id);
        return true;
      }
    }

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
    let lastScore = 0; // Track previous score for smart retry (not from execution which gets overwritten)
    let currentPrompt = buildPrompt(step, input, context, projectContext, routingDecision?.mode);
    const model = step.metadata?.model || "unknown";

    // Inject agent learning context (past performance stats + recent runs)
    try {
      // Analytics stores short IDs (architect, backend) not full (architect-agent)
      const shortAgentId = step.agentId.replace(/-agent$/, "");
      const analyticsRes = await fetch(`/api/pipeline/analytics?agentId=${shortAgentId}&task=${encodeURIComponent(input.slice(0, 150))}`);
      if (analyticsRes.ok) {
        const { context: learningCtx } = await analyticsRes.json();
        if (learningCtx) currentPrompt += learningCtx;
      }
    } catch { /* non-blocking */ }

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
        const controller = STEP_TIMEOUT_MS > 0 ? new AbortController() : undefined;
        const timer = controller ? setTimeout(() => controller.abort(), STEP_TIMEOUT_MS) : undefined;

        // Determine tool access level from AGENT_CONFIG
        const agentCfg = AGENT_CONFIG[step.agentId];
        const implementationAgents = ["backend-agent", "frontend-agent"];
        const qaAgent = step.agentId === "qa-agent";
        const hasTools = !!agentCfg && step.agentId !== "research-agent" && step.agentId !== "designer-agent";
        const useTools = hasTools;
        const toolMode = qaAgent ? "qa" : implementationAgents.includes(step.agentId) ? "readwrite" : "readonly";
        const maxToolSteps = agentCfg?.maxTurns || 5;

        const res = await fetch("/api/ai/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: step.agentId,
            model: step.metadata?.model || "sonnet-4-6",
            userInput: currentPrompt,
            useTools,
            toolMode,
            maxToolSteps,
            readBudget: agentCfg?.readBudget || 10,
          }),
          signal: controller?.signal,
        });

        if (timer) clearTimeout(timer);

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
        }

        const data = await res.json();

        if (!data.success || !data.content) {
          throw new Error(data.error || `Execution failed (success=${data.success}, contentLen=${data.content?.length || 0})`);
        }

        const agentOutput = data.content;
        context[`step_${step.id}_output`] = agentOutput;

        // Analytics: capture token usage per step
        const stepAnalytics = {
          inputTokens: data.tokensUsed?.input || 0,
          outputTokens: data.tokensUsed?.output || 0,
          outputChars: agentOutput.length,
          provider: data.provider || "unknown",
          model: data.model || model,
          toolCalls: data.toolCalls || undefined,
          toolCallCount: data.toolCallCount || 0,
        };

        // Hard enforcement: implementation agents MUST have called edit_file or create_file
        const implAgents = ["backend-agent", "frontend-agent", "devops-agent"];
        if (implAgents.includes(step.agentId)) {
          const madeEdit = data.toolCalls?.some((tc: any) => tc.name === "edit_file" || tc.name === "create_file");
          if (!madeEdit) {
            execution.stepResults[step.id] = {
              stepId: step.id, status: "failed",
              output: agentOutput.substring(0, 20000),
              error: `Implementation agent did not call edit_file or create_file. TaskCompletion = 0. Escalated.`,
              completedAt: new Date().toISOString(),
              retryCount, escalated: true, ...stepAnalytics,
            };
            execution.escalatedSteps = [...(execution.escalatedSteps || []), step.id];
            callbacks.onUpdate({ ...execution });
            postLog({ type: "system", agentId: step.agentId, agentName: step.agentName,
              content: `ESCALATION: ${step.agentName} did not make any edits after ${data.toolCallCount || 0} tool calls — stuck in read loop`,
            }).catch(() => {});
            completed.add(step.id);
            return false;
          }
        }

        const skipEvaluation = step.agentId === "orchestrator" || threshold === 0;

        if (skipEvaluation) {
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "completed",
            output: agentOutput.substring(0, 20000),
            duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
            completedAt: new Date().toISOString(),
            retryCount,
            ...stepAnalytics,
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
          threshold,
          step.agentId,
          data.toolCalls || undefined,
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
            output: agentOutput.substring(0, 20000),
            duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
            completedAt: new Date().toISOString(),
            retryCount,
            evaluationFeedback: evaluation.feedback,
            ...stepAnalytics,
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

          // Auto-capture success pattern: first-attempt 9+ scores
          // Implementation agents (backend/frontend/devops) are deferred until QA confirms VERDICT: PASS
          // This prevents "hallucinated success" — Orchestrator scoring 9+ on code that doesn't actually work
          if (retryCount === 0 && evaluation.score.overall >= 9) {
            const successEntry = {
              agent: step.agentId.replace(/-agent$/, ""),
              score: evaluation.score.overall,
              tokens: stepAnalytics.inputTokens + stepAnalytics.outputTokens,
              toolCalls: stepAnalytics.toolCallCount,
              duration: execution.stepResults[step.id].duration || 0,
              model,
              task: input.slice(0, 150),
            };
            const implAgentIds = ["backend-agent", "frontend-agent", "devops-agent"];
            if (implAgentIds.includes(step.agentId)) {
              // Defer — will flush when QA passes
              pendingSuccessCaptures.push(successEntry);
            } else if (step.agentId === "qa-agent" && agentOutput.includes("VERDICT: PASS")) {
              // QA passed — flush all pending implementation successes + save QA's own
              for (const entry of pendingSuccessCaptures) {
                fetch("/api/knowledge/success", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(entry),
                }).catch(() => {});
              }
              pendingSuccessCaptures.length = 0;
              fetch("/api/knowledge/success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(successEntry),
              }).catch(() => {});
            } else {
              // Non-implementation, non-QA agents — save immediately
              fetch("/api/knowledge/success", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(successEntry),
              }).catch(() => {});
            }
          }

          completed.add(step.id);
          return true;
        }

        lastFeedback = evaluation.feedback;

        // Smart retry: stop early if score isn't improving
        const scoreImproved = evaluation.score.overall > lastScore + 0.5;
        const scoreDegraded = evaluation.score.overall < lastScore - 0.3;
        const worthRetrying = (retryCount < 1) || (scoreImproved && !scoreDegraded); // First retry always, then only if improving
        lastScore = evaluation.score.overall;

        if (retryCount < MAX_RETRIES && worthRetrying) {
          postLog({
            type: "system",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `Step scored ${evaluation.score.overall}/10 (below ${threshold}) — retrying (attempt ${retryCount + 2}/${MAX_RETRIES + 1}). Feedback: ${evaluation.feedback.slice(0, 200)}`,
          }).catch(() => {});

          currentPrompt = buildRetryPrompt(
            step.agentName,
            buildPrompt(step, input, context, projectContext, routingDecision?.mode),
            agentOutput,
            evaluation.feedback,
            evaluation.score.overall,
          );

          retryCount++;
          continue;
        }

        // Max retries exhausted
        const escalationThreshold = agentCfg?.escalationThreshold || PIPELINE.ESCALATION_THRESHOLD;
        if (evaluation.score.overall < escalationThreshold) {
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "failed",
            output: agentOutput.substring(0, 20000),
            error: `Escalated: score ${evaluation.score.overall}/10 after ${MAX_RETRIES + 1} attempts. ${evaluation.feedback}`,
            completedAt: new Date().toISOString(),
            retryCount,
            evaluationFeedback: evaluation.feedback,
            escalated: true,
            ...stepAnalytics,
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
          output: agentOutput.substring(0, 20000),
          duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
          completedAt: new Date().toISOString(),
          retryCount,
          evaluationFeedback: `Accepted with warning (${evaluation.score.overall}/10 after ${MAX_RETRIES + 1} attempts): ${evaluation.feedback}`,
          ...stepAnalytics,
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
    // Check pause/stop flags (read from callbacks)
    if (callbacks.isPauseRequested?.()) {
      execution.status = "paused";
      callbacks.onUpdate({ ...execution });
      postLog({ type: "system", content: `Pipeline PAUSED by user after ${completed.size} stages` }).catch(() => {});
      break;
    }
    if (callbacks.isStopRequested?.()) {
      execution.status = "stopped";
      callbacks.onUpdate({ ...execution });
      postLog({ type: "system", content: `Pipeline STOPPED by user after ${completed.size} stages` }).catch(() => {});
      break;
    }

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

  // Save to pipeline analytics (learning database) — via API
  fetch("/api/pipeline/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(execution),
  }).catch(() => {});

  return execution;
}

interface ProjectContext {
  architecture: string;
  rules: string;
  knowledgeBase: Array<{ name: string; content: string }>;
  fallbackUsed: boolean;
}

function buildPrompt(
  step: WorkflowStep,
  input: string,
  context: Record<string, string>,
  projectCtx?: ProjectContext | null,
  routingMode?: string,
): string {
  let prompt = step.promptTemplate.replace(/\{\{input\}\}/g, input);
  // Inject upstream outputs — truncate per agent config
  const agentCfg = AGENT_CONFIG[step.agentId];
  const maxContextLen = agentCfg?.maxContextChars || 4000;
  for (const [key, val] of Object.entries(context)) {
    const truncated = val.length > maxContextLen
      ? val.substring(0, maxContextLen) + "\n\n... (truncated — use read_file if you need more details)"
      : val;
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), truncated);
  }
  // Replace unresolved placeholders (from skipped steps in quick/medium mode)
  const hasUnresolved = /\{\{step_[^}]+\}\}/.test(prompt);
  if (hasUnresolved) {
    prompt = prompt.replace(/\{\{step_[^}]+\}\}/g, "(this step was skipped by the router)");

    if (projectCtx && (projectCtx.architecture || projectCtx.rules)) {
      // Project context available — agent must use it, not guess
      prompt += `\n\n---\nIMPORTANT: Some upstream pipeline steps were skipped (quick/medium routing mode). Do NOT refuse to work or ask for missing data. The PROJECT CONTEXT section below contains the real architecture, file paths, types, stores, and conventions — use it as your single source of truth. Do NOT write [ASSUMED] blocks or invent paths/types. If something is not covered by the project context, derive it from the original task description.\n\nOriginal task: ${input}`;
    } else {
      // No project context — agent must self-derive
      prompt += `\n\n---\nIMPORTANT: Some upstream pipeline steps were skipped (quick/medium routing mode). Do NOT refuse to work or ask for missing data. Instead, derive what you need directly from the original task description below and use your professional judgment to fill in architecture, security, and design decisions yourself.\n\nOriginal task: ${input}`;
    }
  }

  // --- Inject project context ---
  // Skip full context injection for tool-enabled agents — they can read_file themselves.
  // This saves ~12K tokens per turn in multi-turn tool loops.
  const toolEnabledAgents = ["backend-agent", "frontend-agent", "architect-agent", "qa-agent", "cyber-agent", "devops-agent"];
  const agentHasTools = toolEnabledAgents.includes(step.agentId);

  if (projectCtx && (projectCtx.architecture || projectCtx.rules) && !agentHasTools) {
    let contextBlock = "\n\n---\n## PROJECT CONTEXT (AUTHORITATIVE — overrides all assumptions)\nThe following is the real project architecture and rules. You MUST use these exact file paths, type definitions, store names, and conventions. Do NOT write [ASSUMED] sections. Do NOT invent your own paths or stack.\n";

    if (projectCtx.architecture) {
      contextBlock += `\n### Architecture\n${projectCtx.architecture}\n`;
    }
    if (projectCtx.rules) {
      contextBlock += `\n### Project Rules\n${projectCtx.rules}\n`;
    }
    if (projectCtx.knowledgeBase.length > 0) {
      contextBlock += `\n### Knowledge Base\n`;
      for (const kb of projectCtx.knowledgeBase) {
        contextBlock += `\n#### ${kb.name}\n\`\`\`json\n${kb.content.slice(0, 5000)}\n\`\`\`\n`;
      }
    }

    prompt = contextBlock + "\n---\n\n" + prompt;
  } else if (agentHasTools && projectCtx) {
    // Minimal hint — agent will use read_file for details
    prompt += `\n\n---\nProject: ${projectCtx.architecture ? "ARCHITECTURE.md and CLAUDE.md are available — use read_file to access them." : "No architecture docs found."} Key files: app/(shell)/, lib/stores/, components/, types/. Use list_files and read_file to explore.`;
  }

  // --- Tool-use instructions for agents with file access ---
  const implementationAgents = ["backend-agent", "frontend-agent"];
  const readOnlyAgents = ["architect-agent", "qa-agent", "cyber-agent", "devops-agent"];

  if (implementationAgents.includes(step.agentId)) {
    const autoApprove = routingMode && routingMode !== "full"
      ? `\n### AUTO-APPROVED ARCHITECTURAL PLAN\nThe architectural plan is approved. Proceed with implementation immediately.\n`
      : "";

    prompt += `\n\n---${autoApprove}\n### TOOLS: edit_file, create_file, read_file (last resort), run_command\n\n### SCORING PENALTY\nYou lose 70% of your score if you do not call edit_file or create_file.\nReading without editing is penalized. Every read_file call without a subsequent edit reduces your score.\n\n### CRITICAL RULE: YOUR FIRST TOOL CALL MUST BE edit_file OR create_file.\nDo NOT start with read_file. The Architect's output above contains everything you need.\n\n### STRATEGY\n1. Read Architect's FILES_TO_EDIT block above — it has the exact file path and what to change.\n2. Call **create_file** if it says "create: ..." OR call **edit_file** if it says "modify: ...".\n3. For edit_file: use old_string from Architect's description. If you're unsure of exact content, THEN read_file ONE time to get the exact string.\n4. After edit/create: provide 2-line summary.\n\n### FORBIDDEN\n- Do NOT call read_file first "to understand the codebase" — Architect already did that.\n- Do NOT make more than 1 read_file call.\n- Do NOT read ARCHITECTURE.md, CLAUDE.md, or any config file.\n- Do NOT read a file "just to be safe".\n\n### IF CREATING A NEW FILE\nCall create_file with the complete file content. Keep it under 80 lines. Include all imports.\n\n### IF EDITING AN EXISTING FILE\nCall edit_file with old_string (exact match) and new_string. Keep diff under 30 lines.\n\n### DEFINITION OF DONE\n1. At least one edit_file or create_file succeeded\n2. 2-line summary: what changed, what remains`;

  } else if (step.agentId === "qa-agent") {
    // QA gets targeted instructions — focus only on changed files
    const changedFiles = Object.entries(context)
      .filter(([k]) => k.startsWith("step_") && k.endsWith("_output"))
      .map(([, v]) => v)
      .join("\n")
      .match(/(?:edit_file|create_file|Edited|Created)\s+(\S+)/g)
      ?.map((m) => m.replace(/^(?:edit_file|create_file|Edited|Created)\s+/, ""))
      || [];

    const fileList = changedFiles.length > 0
      ? `\n\n### CHANGED FILES (focus your review here)\n${changedFiles.map((f) => `- ${f}`).join("\n")}`
      : "";

    prompt += `\n\n---\n### TOOL ACCESS${fileList}\n\nYou have these tools:\n- **list_files**, **read_file** — read project code\n- **run_command** — run \`npx tsc --noEmit\` or \`grep\` to verify\n- **save_failure_pattern** — record critical bugs in knowledge base\n\n### QA WORKFLOW\n1. Read changed files (max 8 read calls)\n2. Run \`npx tsc --noEmit\` to check compilation\n3. Analyze for bugs, security issues, architectural violations\n4. For each CRITICAL finding: call **save_failure_pattern** with category, title, symptoms, root_cause, solution\n5. Output your QA report with all findings\n\n### VERDICT\nEnd your report with one of:\n- **VERDICT: PASS** — no critical issues, safe to deploy\n- **VERDICT: FAIL** — critical issues found, saved to failure patterns\n\n### TOKEN BUDGET (CRITICAL)\n- **MAX 10 tool calls total**. Read only changed files, not the entire project.\n- Do NOT re-read files. Read once, analyze, write.`;
  } else if (step.agentId === "architect-agent") {
    prompt += `\n\n---\n### TOOL ACCESS (READ-ONLY)\nYou have: list_files, read_file. Max 3 tool calls.\n\n### MANDATORY OUTPUT FORMAT\nYour output MUST end with this exact block:\n\n\`\`\`\nFILES_TO_READ:\n- path/to/file.ts (lines X-Y) — reason\n- path/to/other.ts (full) — reason\n\nFILES_TO_EDIT:\n- path/to/file.ts (lines X-Y) — what to change\n- path/to/new-file.ts — create: purpose\n\nCHANGE SUMMARY:\n1. In file.ts: add function X that does Y\n2. In other.ts: modify import to include Z\n\`\`\`\n\nThis block is READ BY Backend/Frontend agents to know exactly where to look.\nWithout it they will waste tokens reading the entire project.\n\n### RULES\n- Max 2000 words. ADR + specs + FILES block.\n- Do NOT output Knowledge Base JSON.\n- Be SPECIFIC: exact file paths, exact line ranges, exact function names.`;
  } else if (step.agentId === "pm-agent") {
    prompt += `\n\n---\n### TOOL ACCESS (READ-ONLY)\nYou have: list_files, read_file. Max 2 tool calls.\n\nBefore writing stories, check the REAL project structure:\n1. list_files on the relevant directory (app/(shell)/, app/api/, lib/stores/, types/)\n2. read_file on types or store if you need exact field names\n\nThis prevents writing stories about files/APIs that don't exist.\nDo NOT guess paths — verify them.\n\n### TOKEN BUDGET\n- Max 2 tool calls. Quick look, then write.\n- Keep output under 3000 words.`;
  } else if (readOnlyAgents.includes(step.agentId)) {
    prompt += `\n\n---\n### TOOL ACCESS (READ-ONLY)\nYou have: list_files, read_file, save_failure_pattern. Max 3 tool calls.\n- Use **save_failure_pattern** if you find architectural violations, security risks, or critical issues.\n\n### TOKEN BUDGET\n- Read ONLY files directly relevant to your task.\n- Do NOT explore directories or read ARCHITECTURE.md (already in context).\n- Keep output under 2000 words. Be concise.`;
  }

  return prompt;
}
