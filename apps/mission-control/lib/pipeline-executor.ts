import type { WorkflowStep, PipelineExecution, QualityScore, ContractValidation } from "@/types";
import { postLog } from "@/lib/hooks/use-logs";
import { evaluateStepOutput, evaluateStepOutputK, buildRetryPrompt } from "@/lib/quality-evaluator";
import { PIPELINE, AGENT_CONFIG, TOOL_OUTPUT_LIMITS } from "@/lib/config";
import { runCyberRedesignLoop } from "@/lib/pipeline-runner-cyber";
import { runQAFeedbackLoop } from "@/lib/pipeline-runner-qa";
import { isTruncationFailure, continueOutput } from "@/lib/output-continuation";
import { getContractPromptBlock, validateStageOutput, fetchKBEntriesForContracts } from "@/lib/stage-contracts";
import { validateStageOutputSchema, validateContextInjection } from "@/lib/stage-output-schema";
import { buildAgentKBContext } from "@/lib/kb-agent-context";
import { logActivity } from "@/lib/stores/activity-store";
// loadProjectContext removed — uses fs, loaded via API fetch instead
import { investigateFailure } from "@/lib/failure-investigator";
import { validateDesignCompliance } from "@/lib/design-validator";
import { parseConfidence, getEarlyTerminationAction, CONFIDENCE_INSTRUCTION } from "@/lib/confidence-gate";
import { checkBudget, calculateCost, suggestDowngrade } from "@/lib/budget-manager";
// Execution logger — fire-and-forget via API to avoid fs import in client bundle
function startExecutionLog(id: string, name: string, input: string, project?: string | null) {
  fetch("/api/pipeline/replay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "start", executionId: id, workflowName: name, input, projectId: project }),
  }).catch(() => {});
}
function logStage(_stage: unknown) { /* logged via finalizeExecutionLog */ }
function finalizeExecutionLog(execution: PipelineExecution) {
  return fetch("/api/pipeline/replay", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "finalize", execution }),
  }).catch(() => {});
}
import type { RoutingDecisionData } from "@/types";
// Analytics storage accessed via API (can't import fs in client-side code)

const { MAX_RETRIES, STEP_TIMEOUT_MS } = PIPELINE;

function generateId() {
  return crypto.randomUUID();
}

/**
 * Model escalation tiers — cheapest to most capable.
 * Used for cost-aware dynamic escalation on retry failures.
 */
const MODEL_ESCALATION_CHAIN = ["haiku-4-5", "sonnet-4-6", "opus-4-6"] as const;

function getEscalatedModel(currentModel: string): string | null {
  const idx = MODEL_ESCALATION_CHAIN.indexOf(currentModel as typeof MODEL_ESCALATION_CHAIN[number]);
  if (idx === -1 || idx >= MODEL_ESCALATION_CHAIN.length - 1) return null;
  return MODEL_ESCALATION_CHAIN[idx + 1];
}

/**
 * Smart model selection — cheaper models for simple stages, premium for complex.
 * Saves 30-40% on token costs without quality loss.
 *
 * When retryCount > 0 and score was low, escalates to next model tier.
 */
function selectModelForStage(step: WorkflowStep, mode?: string, retryCount?: number, lastScore?: number): string {
  let baseModel: string;

  // If step has explicit model → use it as base
  if (step.metadata?.model) {
    baseModel = step.metadata.model;
  } else if (mode === "quick") {
    baseModel = "haiku-4-5";
  } else {
    // Gate/orchestrator stages → fast model (they evaluate, don't generate)
    const gateStages = ["s2.5-prd-gate", "s4.5-arch-gate", "s8.5-tech-review", "s11-final-verdict", "s12b-consolidation"];
    if (gateStages.includes(step.id) || step.agentId === "orchestrator") {
      baseModel = "haiku-4-5";
    } else if (step.agentId === "research-agent") {
      baseModel = "haiku-4-5";
    } else {
      const premiumAgents = ["backend-agent", "frontend-agent", "architect-agent", "cyber-agent"];
      baseModel = premiumAgents.includes(step.agentId) ? "sonnet-4-6" : "sonnet-4-6";
    }
  }

  // Dynamic escalation: if retry with low score, try stronger model
  if (retryCount && retryCount > 0 && lastScore !== undefined && lastScore < 6) {
    const escalated = getEscalatedModel(baseModel);
    if (escalated) return escalated;
  }

  return baseModel;
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

  // --- Load cross-project context (when pipeline targets another project) ---
  let crossProjectContext: { promptBlock: string; projectPath: string } | null = null;
  if (selectedProject && selectedProject !== "mission-control") {
    try {
      const ctx = await (await fetch(`/api/projects/context/load?projectId=${encodeURIComponent(selectedProject)}`)).json();
      if (ctx?.data) {
        crossProjectContext = ctx.data;
        postLog({
          type: "system",
          content: `Cross-project context loaded: ${selectedProject} (${ctx.data.framework}, ${ctx.data.stack?.join(", ")})`,
        }).catch(() => {});
        logActivity("system", `Project context: ${selectedProject}`, ctx.data.framework);
      }
    } catch {
      // Fallback: build path manually
      crossProjectContext = {
        promptBlock: `\n═══ PROJECT CONTEXT ═══\nPROJECT: ${selectedProject}\nAll file operations execute in this project's directory.\n═══ END ═══`,
        projectPath: ``,
      };
    }
  }

  // --- Fetch KB entries for dynamic contract adaptation ---
  const kbEntries = await fetchKBEntriesForContracts(selectedProject);
  if (kbEntries.length > 0) {
    postLog({
      type: "system",
      content: `KB loaded for contracts: ${kbEntries.length} entries (failure-patterns + security-playbook)`,
    }).catch(() => {});
    logActivity("kb_read", `KB loaded: ${kbEntries.length} entries`, "failure-patterns + security-playbook for contracts");
  } else {
    postLog({
      type: "system",
      content: "KB empty — no entries loaded for contracts",
    }).catch(() => {});
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
    tokenUsage: previousExecution?.tokenUsage || {},
    budgetUsage: previousExecution?.budgetUsage || {},
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

  // Start execution log for replay mode
  startExecutionLog(execution.id, workflowName, input, selectedProject);

  postLog({
    type: "system",
    content: `Execution log started for replay: ${execution.id.slice(0, 8)}`,
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
  let cyberRedesignCycles = 0;

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

    // --- Conditional Stage: skip if condition not met (e.g. S8.6 only runs if S8.5 FAIL) ---
    if (step.metadata?.conditional) {
      const condMatch = step.metadata.conditional.match(/^step_(\S+)_output contains (.+)$/);
      if (condMatch) {
        const [, depOutput, keyword] = condMatch;
        const depContent = context[`step_${depOutput}_output`] || "";
        if (!depContent.includes(keyword)) {
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "completed",
            output: `Conditional skip: ${depOutput} did not contain "${keyword}"`,
            completedAt: new Date().toISOString(),
            source: "skipped" as any,
          };
          if (execution.qualityScores) {
            execution.qualityScores[step.id] = { completeness: 10, specificity: 10, actionability: 10, overall: 10 };
          }
          callbacks.onUpdate({ ...execution });
          postLog({ type: "system", agentId: step.agentId, agentName: step.agentName, content: `Conditional skip: ${step.agentName} — condition not met (${step.metadata.conditional})` }).catch(() => {});
          completed.add(step.id);
          return true;
        }
      }
    }

    // --- Smart Skip: skip implementation agents if Architect determined no work for them ---
    const skipCandidates: Record<string, RegExp> = {
      "frontend-agent": /no\s*(frontend|ui|client|component)\s*(change|work|needed|required)/i,
      "backend-agent": /no\s*(backend|api|server|endpoint)\s*(change|work|needed|required)/i,
      "designer-agent": /no\s*(design|css|styling|token)\s*(change|work|needed|required)/i,
    };
    if (skipCandidates[step.agentId]) {
      const architectOutput = context["step_s3.2-api_output"] || "";
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
    let currentPrompt = buildPrompt(step, input, context, projectContext, routingDecision?.mode, kbEntries);
    const model = step.metadata?.model || "unknown";

    // Inject cross-project context (when targeting another project)
    if (crossProjectContext?.promptBlock) {
      currentPrompt = crossProjectContext.promptBlock + "\n\n" + currentPrompt;
    }

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

    // ── KB Self-Awareness: agent reads its own failure/success history ──
    if (kbEntries.length > 0) {
      const kbContext = buildAgentKBContext(step, kbEntries);
      if (kbContext.entryCount > 0) {
        currentPrompt += kbContext.promptBlock;
        postLog({
          type: "system",
          agentId: step.agentId,
          agentName: step.agentName,
          content: `KB injected: ${kbContext.entryCount} entries [${kbContext.categories.join(", ")}]`,
        }).catch(() => {});
        logActivity("kb_read", `${step.agentName}: ${kbContext.entryCount} KB entries`, kbContext.categories.join(", "));
      } else {
        postLog({
          type: "system",
          agentId: step.agentId,
          agentName: step.agentName,
          content: "No matching KB entries for this agent",
        }).catch(() => {});
      }
    }

    // ── Context Injection Validation: check upstream deps before execution ──
    const contextCheck = validateContextInjection(step, context);
    if (!contextCheck.valid) {
      const missingList = contextCheck.missing.join(", ");
      postLog({
        type: "system",
        agentId: step.agentId,
        agentName: step.agentName,
        content: `Agent ${step.agentName} missing context from: ${missingList}`,
      }).catch(() => {});
      logActivity("system", `${step.agentName}: missing deps`, missingList);

      // Append warning to prompt so agent can work with partial context
      currentPrompt += `\n\n---\nWARNING: You are missing data from stages: ${missingList}. Work with what you have.`;
    }

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
        // All agents get tools — implementers get readwrite, QA gets qa tools, everyone else gets readonly
        const agentCfg = AGENT_CONFIG[step.agentId];
        const implementationAgents = ["backend-agent", "frontend-agent"];
        const qaAgent = step.agentId === "qa-agent";
        const useTools = !!agentCfg;
        const designerAgent = step.agentId === "designer-agent";
        const toolMode = qaAgent ? "qa" : designerAgent ? "designer" : implementationAgents.includes(step.agentId) ? "readwrite" : "readonly";
        const maxToolSteps = agentCfg?.maxTurns || 5;

        // Smart model selection: cheaper models for simple stages, escalate on retry
        const smartModel = selectModelForStage(step, routingDecision?.mode, retryCount, lastScore);

        const res = await fetch("/api/ai/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: step.agentId,
            model: smartModel,
            userInput: currentPrompt,
            useTools,
            toolMode,
            maxToolSteps,
            readBudget: agentCfg?.readBudget || 10,
            // Cross-project: when pipeline targets another project, tools work in that project's directory
            projectPath: selectedProject && selectedProject !== "mission-control"
              ? selectedProject
              : undefined,
          }),
          signal: controller?.signal,
        });

        if (timer) clearTimeout(timer);

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          throw new Error(`API ${res.status}: ${errText.slice(0, 200)}`);
        }

        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || `Execution failed (success=false)`);
        }

        // Empty content with success=true — retry via loop (transient Agent Hub issue)
        if (!data.content) {
          if (retryCount < MAX_RETRIES) {
            retryCount++;
            continue;
          }
          throw new Error(data.error || `Agent returned empty response after ${retryCount + 1} attempts`);
        }

        const agentOutput = data.content;
        context[`step_${step.id}_output`] = agentOutput;

        // ── Contract Validation (static + KB-dynamic constraints) ──
        const contractResult = validateStageOutput(step.id, agentOutput, kbEntries);
        if (contractResult.score > 0) {
          (execution.stepResults[step.id] as unknown as Record<string, unknown>).contractValidation = contractResult;

          if (!contractResult.valid) {
            postLog({
              type: "system",
              agentId: step.agentId,
              agentName: step.agentName,
              content: `CONTRACT VIOLATION [${step.id}]: missing=${contractResult.missingRequired.join(", ")} | score=${contractResult.score}/100 | warnings=${contractResult.warnings.length}`,
            }).catch(() => {});
            logActivity("contract_validate", `${step.id}: VIOLATION ${contractResult.score}/100`, contractResult.missingRequired.join(", "));
          } else {
            logActivity("contract_validate", `${step.id}: PASS ${contractResult.score}/100`);
          }
        }

        // ── Stage Output Schema Validation (JSON structure) ──
        const schemaResult = validateStageOutputSchema(step.id, agentOutput);
        if (!schemaResult.valid) {
          postLog({
            type: "system",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `SCHEMA WARNING [${step.id}]: ${schemaResult.errors.join("; ")}`,
          }).catch(() => {});
          logActivity("schema_validate", `${step.id}: INVALID`, schemaResult.errors.join("; "));

          // Add schema errors to investigation context for downstream stages
          context[`step_${step.id}_schema_errors`] = schemaResult.errors.join("\n");
        } else if (schemaResult.parsed) {
          // Store parsed structured data for downstream consumption
          (execution.stepResults[step.id] as unknown as Record<string, unknown>).parsedOutput = schemaResult.parsed;
          logActivity("schema_validate", `${step.id}: PASS (parsed JSON stored)`);
        }

        // ── Design-to-Code Validation: after frontend (S7), check compliance with designer output ──
        if (step.agentId === "frontend-agent") {
          const designerOutputKey = Object.keys(context).find(
            (k) => k.includes("designer") || k.includes("s6"),
          );
          const designerOutput = designerOutputKey ? context[designerOutputKey] : "";
          if (designerOutput) {
            const designCompliance = validateDesignCompliance(designerOutput, agentOutput);
            (execution.stepResults[step.id] as unknown as Record<string, unknown>).designCompliance = designCompliance;

            if (!designCompliance.compliant) {
              postLog({
                type: "system",
                agentId: step.agentId,
                agentName: step.agentName,
                content: `DESIGN COMPLIANCE: ${designCompliance.score}/100 — ${designCompliance.violations.length} violation(s): ${designCompliance.violations.slice(0, 2).join("; ")}`,
              }).catch(() => {});
              logActivity("design_validate", `${step.id}: ${designCompliance.score}/100`, designCompliance.violations.slice(0, 2).join("; "));

              // Add violations to context so QA (S8) can include them in evaluation
              context[`step_${step.id}_design_violations`] = designCompliance.violations.join("\n");
            } else {
              logActivity("design_validate", `${step.id}: PASS ${designCompliance.score}/100`);
            }
          }
        }

        // Analytics: capture token usage per step
        const stepStartTime = execution.stepResults[step.id]?.startedAt;
        const stepDurationMs = stepStartTime ? Date.now() - new Date(stepStartTime).getTime() : 0;
        const stepAnalytics = {
          inputTokens: data.tokensUsed?.input || 0,
          outputTokens: data.tokensUsed?.output || 0,
          outputChars: agentOutput.length,
          provider: data.provider || "unknown",
          model: data.model || smartModel,
          toolCalls: data.toolCalls || undefined,
          toolCallCount: data.toolCallCount || 0,
        };

        // Per-stage cost tracking (accumulates across retries)
        const prevUsage = execution.tokenUsage?.[step.id];
        if (execution.tokenUsage) {
          execution.tokenUsage[step.id] = {
            provider: stepAnalytics.provider,
            model: stepAnalytics.model,
            input: (prevUsage?.input || 0) + stepAnalytics.inputTokens,
            output: (prevUsage?.output || 0) + stepAnalytics.outputTokens,
            durationMs: (prevUsage?.durationMs || 0) + stepDurationMs,
          };
        }

        // ── Confidence Scoring: parse agent self-reported confidence ──
        const agentConfidence = parseConfidence(agentOutput);
        if (agentConfidence !== null) {
          (execution.stepResults[step.id] as unknown as Record<string, unknown>).confidence = agentConfidence;
          postLog({
            type: "decision",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `Confidence: ${agentConfidence.toFixed(2)} for stage ${step.id}`,
          }).catch(() => {});

          // ── Early Termination Logic ──
          const terminationAction = getEarlyTerminationAction(
            step.id,
            agentConfidence,
            stepAnalytics.model || smartModel,
            retryCount > 0, // already escalated if we retried
          );

          if (terminationAction.action === "escalate_model") {
            postLog({
              type: "system",
              agentId: step.agentId,
              agentName: step.agentName,
              content: `CONFIDENCE ESCALATION: ${terminationAction.reason}`,
            }).catch(() => {});
            logActivity("confidence_gate", `${step.id}: escalate model`, terminationAction.reason);
            // Force retry with model escalation by setting lastScore very low
            if (retryCount < MAX_RETRIES) {
              lastScore = 0;
              lastFeedback = `Low confidence (${agentConfidence.toFixed(2)}) — model escalation triggered`;
              retryCount++;
              continue;
            }
          } else if (terminationAction.action === "pause") {
            postLog({
              type: "system",
              agentId: step.agentId,
              agentName: step.agentName,
              content: `EARLY TERMINATION: ${terminationAction.reason}`,
            }).catch(() => {});
            logActivity("confidence_gate", `${step.id}: paused`, terminationAction.reason);

            execution.stepResults[step.id] = {
              stepId: step.id,
              status: "failed",
              output: agentOutput.substring(0, 20000),
              error: terminationAction.reason,
              completedAt: new Date().toISOString(),
              retryCount,
              confidence: agentConfidence,
              ...stepAnalytics,
            };
            execution.status = "paused";
            callbacks.onUpdate({ ...execution });
            completed.add(step.id);
            return false;
          }
        }

        // ── Budget Check: enforce per-stage spending caps ──
        const prevBudget = execution.budgetUsage?.[step.id];
        const budgetResult = checkBudget(
          step.id,
          stepAnalytics.model || smartModel,
          { input: stepAnalytics.inputTokens, output: stepAnalytics.outputTokens },
          prevBudget?.spent || 0,
        );
        if (execution.budgetUsage) {
          execution.budgetUsage[step.id] = { spent: budgetResult.spent, limit: budgetResult.limit };
        }

        if (budgetResult.action === "warn") {
          postLog({
            type: "system",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `BUDGET WARNING [${step.id}]: $${budgetResult.spent.toFixed(4)} / $${budgetResult.limit.toFixed(2)} (${budgetResult.percentUsed.toFixed(0)}%)`,
          }).catch(() => {});
          logActivity("budget_warn", `${step.id}: ${budgetResult.percentUsed.toFixed(0)}% budget used`, `$${budgetResult.spent.toFixed(4)}`);
        } else if (budgetResult.action === "pause") {
          postLog({
            type: "system",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `BUDGET EXCEEDED [${step.id}]: $${budgetResult.spent.toFixed(4)} / $${budgetResult.limit.toFixed(2)} — pipeline paused for confirmation`,
          }).catch(() => {});
          logActivity("budget_pause", `${step.id}: budget exceeded`, `$${budgetResult.spent.toFixed(4)} / $${budgetResult.limit.toFixed(2)}`);

          execution.status = "paused";
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "failed",
            output: agentOutput.substring(0, 20000),
            error: `Budget exceeded: $${budgetResult.spent.toFixed(4)} > $${budgetResult.limit.toFixed(2)} cap`,
            completedAt: new Date().toISOString(),
            retryCount,
            ...stepAnalytics,
          };
          callbacks.onUpdate({ ...execution });
          completed.add(step.id);
          return false;
        }

        // Hard enforcement: implementation agents MUST have called edit_file or create_file
        const implAgents = ["backend-agent", "frontend-agent", "devops-agent"];
        if (implAgents.includes(step.agentId)) {
          const madeEdit = data.toolCalls?.some((tc: any) => tc.name === "edit_file" || tc.name === "create_file");
          if (!madeEdit) {
            // ── Failure Investigation: analyze WHY before deciding to retry or escalate ──
            const investigation = investigateFailure(
              step.id, step.agentId,
              { status: "failed", output: agentOutput, error: "no edits", toolCalls: data.toolCalls, toolCallCount: data.toolCallCount },
              undefined,
              crossProjectContext?.projectPath || selectedProject || undefined,
              kbEntries,
            );

            logActivity("system", `Investigation: ${step.id} — ${investigation.category}`, investigation.diagnosis.substring(0, 80));
            postLog({ type: "system", agentId: step.agentId, agentName: step.agentName,
              content: `INVESTIGATION [${step.id}]: ${investigation.category} — ${investigation.diagnosis}`,
            }).catch(() => {});

            // If fixable and retries left → retry with corrective instructions
            if (investigation.shouldRetry && retryCount < MAX_RETRIES) {
              postLog({ type: "system", agentId: step.agentId, agentName: step.agentName,
                content: `RETRY after investigation: ${investigation.correction.substring(0, 100)}`,
              }).catch(() => {});
              currentPrompt = investigation.correction + "\n\n" + currentPrompt;
              retryCount++;
              lastFeedback = investigation.diagnosis;
              continue;
            }

            // Not fixable or max retries → escalate
            execution.stepResults[step.id] = {
              stepId: step.id, status: "failed",
              output: agentOutput.substring(0, 20000),
              error: `Investigation: ${investigation.diagnosis}. Category: ${investigation.category}. Escalated after ${retryCount} retries.`,
              completedAt: new Date().toISOString(),
              retryCount, escalated: true, ...stepAnalytics,
              investigation: {
                diagnosis: investigation.diagnosis,
                category: investigation.category,
                severity: investigation.severity,
                correction: investigation.correction,
                shouldRetry: investigation.shouldRetry,
                matchedKBPatterns: investigation.matchedKBPatterns,
              },
            };
            execution.escalatedSteps = [...(execution.escalatedSteps || []), step.id];
            callbacks.onUpdate({ ...execution });
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

        // Reviewer ≠ Author: use evaluatorOverride if set (gates evaluated by different agent)
        const evaluatorAgent = step.metadata?.evaluatorOverride || step.agentId;
        const evaluatorName = step.metadata?.evaluatorOverride
          ? `Independent-Reviewer (${step.metadata.evaluatorOverride})`
          : step.agentName;

        // pass@k: gate stages use k=3 for statistical confidence, others use k=1
        const isGateStage = step.id.includes("-gate") || step.id.includes("-review") || step.id === "s11-final-verdict";
        const usePassAtK = isGateStage && routingDecision?.mode !== "quick";

        let evaluation;
        if (usePassAtK) {
          const passKResult = await evaluateStepOutputK(
            evaluatorName,
            step.metadata?.stageNumber || "?",
            input,
            agentOutput,
            threshold,
            evaluatorAgent,
            data.toolCalls || undefined,
            3, // k=3 for gates
          );
          evaluation = {
            score: passKResult.avgScore,
            passed: passKResult.passAtK && passKResult.confidence >= 0.67, // 2/3 must pass
            feedback: passKResult.combinedFeedback,
          };
          postLog({
            type: "decision",
            agentId: "orchestrator",
            agentName: "Orchestrator",
            content: `pass@3 for ${step.agentName}: ${passKResult.passCount}/3 passed (${Math.round(passKResult.confidence * 100)}% confidence), avg ${passKResult.avgScore.overall}/10`,
          }).catch(() => {});
        } else {
          evaluation = await evaluateStepOutput(
            evaluatorName,
            step.metadata?.stageNumber || "?",
            input,
            agentOutput,
            threshold,
            evaluatorAgent,
            data.toolCalls || undefined,
          );
        }

        // Apply schema validation penalty: reduce score if JSON output is invalid
        if (!schemaResult.valid && schemaResult.errors.length > 0) {
          const penalty = Math.min(2, schemaResult.errors.length * 0.5);
          evaluation.score = {
            ...evaluation.score,
            completeness: Math.max(1, evaluation.score.completeness - penalty),
            overall: Math.max(1, evaluation.score.overall - penalty),
          };
          evaluation.feedback += ` [Schema penalty: -${penalty} for ${schemaResult.errors.length} JSON structure error(s)]`;
          evaluation.passed = evaluation.score.overall >= threshold;
        }

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

        // --- Output continuation: if truncated, try cheap append instead of full retry ---
        if (isTruncationFailure(evaluation.feedback) && retryCount < MAX_RETRIES) {
          postLog({
            type: "system",
            agentId: step.agentId,
            content: `Truncation detected — attempting cheap continuation instead of full retry`,
          }).catch(() => {});

          const contResult = await continueOutput(
            step.agentId,
            step.metadata?.model || "sonnet-4-6",
            "", // system prompt not needed for continuation
            agentOutput,
            evaluation.feedback,
          );

          if (contResult.success) {
            // Re-evaluate with merged output
            const mergedOutput = contResult.mergedOutput;
            context[`step_${step.id}_output`] = mergedOutput;

            const reEval = await evaluateStepOutput(
              step.agentName,
              step.metadata?.stageNumber || "?",
              input,
              mergedOutput,
              threshold,
              step.agentId,
              data.toolCalls || undefined,
            );

            if (execution.qualityScores) {
              execution.qualityScores[step.id] = reEval.score;
            }

            postLog({
              type: "decision",
              agentId: "orchestrator",
              content: `Continuation re-eval for ${step.agentName}: ${reEval.score.overall}/10 → ${reEval.passed ? "PASS" : "FAIL"} (+${contResult.continuationTokens} tokens)`,
            }).catch(() => {});

            if (reEval.passed) {
              execution.stepResults[step.id] = {
                stepId: step.id,
                status: "completed",
                output: mergedOutput.substring(0, 20000),
                duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
                completedAt: new Date().toISOString(),
                retryCount,
                evaluationFeedback: `Passed after continuation (+${contResult.continuationTokens} tokens)`,
                ...stepAnalytics,
              };
              callbacks.onUpdate({ ...execution });
              completed.add(step.id);
              return true;
            }
            // Continuation didn't fix it — fall through to regular retry
            lastFeedback = reEval.feedback;
          }
        }

        // If score meets threshold despite evaluator saying FAIL — accept with warning
        if (evaluation.score.overall >= threshold) {
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "completed",
            output: agentOutput.substring(0, 20000),
            duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
            completedAt: new Date().toISOString(),
            retryCount,
            evaluationFeedback: `Accepted (${evaluation.score.overall}/10 ≥ ${threshold} threshold): ${evaluation.feedback}`,
            ...stepAnalytics,
          };
          if (execution.qualityScores) {
            execution.qualityScores[step.id] = evaluation.score;
          }
          callbacks.onUpdate({ ...execution });
          completed.add(step.id);
          return true;
        }

        // Always retry up to MAX_RETRIES — no smart retry degradation stopping
        lastScore = evaluation.score.overall;

        if (retryCount < MAX_RETRIES) {
          // Check if model will escalate on next retry
          const nextModel = selectModelForStage(step, routingDecision?.mode, retryCount + 1, evaluation.score.overall);
          const currentModel = selectModelForStage(step, routingDecision?.mode, retryCount, lastScore);
          const modelEscalated = nextModel !== currentModel;

          postLog({
            type: "system",
            agentId: step.agentId,
            agentName: step.agentName,
            content: `Step scored ${evaluation.score.overall}/10 (below ${threshold}) — retrying (attempt ${retryCount + 2}/${MAX_RETRIES + 1})${modelEscalated ? ` [MODEL ESCALATION: ${currentModel} → ${nextModel}]` : ""}. Feedback: ${evaluation.feedback.slice(0, 200)}`,
          }).catch(() => {});

          // Run investigation for quality failures too — gives retry agent context
          const qualityInvestigation = investigateFailure(
            step.id, step.agentId,
            { status: "failed", output: agentOutput, error: evaluation.feedback, toolCalls: data.toolCalls, toolCallCount: data.toolCallCount },
            evaluation.feedback,
            crossProjectContext?.projectPath || selectedProject || undefined,
            kbEntries,
          );

          currentPrompt = buildRetryPrompt(
            step.agentName,
            buildPrompt(step, input, context, projectContext, routingDecision?.mode, kbEntries),
            agentOutput,
            evaluation.feedback,
            evaluation.score.overall,
            { diagnosis: qualityInvestigation.diagnosis, category: qualityInvestigation.category, matchedKBPatterns: qualityInvestigation.matchedKBPatterns },
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
  // Exclude steps already completed from a resumed run
  const remaining = steps.filter((s) => !completed.has(s.id));

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

    // ── DAG Parallel Execution: auto-detect independent ready stages ──
    // If multiple stages are ready (all deps met) and none depend on each other,
    // run them in parallel. This handles both explicit groups and auto-detected parallelism.
    const parallelGroup = ready.filter((s) => s.metadata?.isParallel && s.metadata?.group);
    const groupName = parallelGroup[0]?.metadata?.group;

    // Explicit parallel group (legacy)
    const useExplicitGroup = parallelGroup.length > 1 && groupName && parallelGroup.every((s) => s.metadata?.group === groupName);

    // Auto-detect: multiple ready stages with no cross-dependencies = safe to parallelize
    // Exclude checkpoints and gates from auto-parallel (they need sequential attention)
    const autoParallelCandidates = ready.filter((s) =>
      !s.metadata?.isCheckpoint &&
      !s.id.includes("-gate") &&
      !s.id.includes("-review") &&
      !s.id.includes("-verdict"),
    );
    // Auto-parallel disabled — sequential execution is more predictable and debuggable.
    // Only explicit parallel groups (metadata.isParallel + group) are allowed.
    const canAutoParallel = false;

    if (useExplicitGroup || canAutoParallel) {
      const group = useExplicitGroup ? parallelGroup : autoParallelCandidates;

      postLog({
        type: "system",
        content: `DAG parallel: running ${group.length} stages simultaneously [${group.map((s) => s.id).join(", ")}]`,
      }).catch(() => {});

      const results = await Promise.all(group.map(executeStep));
      const anyFailed = results.some((r) => !r);

      group.forEach((r) => {
        const idx = remaining.findIndex((s) => s.id === r.id);
        if (idx >= 0) remaining.splice(idx, 1);
      });

      if (anyFailed) {
        // Check if it's an escalation or hard failure
        const failedSteps = group.filter((_, i) => !results[i]);
        const anyEscalated = failedSteps.some((s) => execution.stepResults[s.id]?.escalated);
        execution.status = anyEscalated ? "paused" : "failed";
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

      // --- Cyber-Gated Redesign ---
      if (step.agentId === "cyber-agent" && success) {
        const cyberResult = await runCyberRedesignLoop({
          stepId: step.id, execution, context, cyberRedesignCycles,
          onUpdate: (e) => callbacks.onUpdate(e),
        });
        cyberRedesignCycles = cyberResult.cyberRedesignCycles;
        if (cyberResult.shouldBreak) break;
      }

      // --- QA Feedback Loop ---
      if (step.agentId === "qa-agent" && success) {
        const qaResult = await runQAFeedbackLoop({
          stepId: step.id, steps, execution, context,
          onUpdate: (e) => callbacks.onUpdate(e),
        });
        if (qaResult.shouldBreak) break;
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

  // Finalize execution log for replay
  finalizeExecutionLog(execution).catch(() => {});

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

    // KB Evolution: boost/decay confidence based on step outcomes
    const evolveSteps = Object.entries(execution.stepResults)
      .filter(([, r]) => r.status === "completed" || r.status === "failed")
      .map(([stepId, r]) => ({
        stepId,
        agentId: steps.find((s) => s.id === stepId)?.agentId || "",
        status: r.status as "completed" | "failed",
        qualityScore: execution.qualityScores?.[stepId]?.overall,
      }));

    if (evolveSteps.length > 0) {
      fetch("/api/knowledge/evolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pipeline",
          stepResults: evolveSteps,
          pipelineRunId: execution.id,
        }),
      }).catch(() => {});
    }

    // KB Aging: apply time-based confidence decay
    fetch("/api/knowledge/evolve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "aging" }),
    }).catch(() => {});
  }

  // Save to pipeline analytics (learning database) — via API
  fetch("/api/pipeline/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(execution),
  }).catch(() => {});

  // Record eval baseline (quality tracking over time)
  fetch("/api/pipeline/baselines", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(execution),
  }).then(async (res) => {
    if (res.ok) {
      const { data } = await res.json();
      if (data?.regressions?.length > 0) {
        postLog({
          type: "system",
          content: `QUALITY REGRESSION: ${data.regressions.map((r: { stageId: string; delta: number }) => `${r.stageId} (${r.delta > 0 ? "+" : ""}${r.delta})`).join(", ")}`,
        }).catch(() => {});
      }
      if (data?.isNewBest) {
        postLog({
          type: "system",
          content: `NEW BEST SCORE: ${data.currentRun.overallScore}/10 (previous best: ${data.previousRun?.overallScore || "n/a"})`,
        }).catch(() => {});
      }
    }
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
  kbEntriesForContracts?: import("@/types").KBEntry[],
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
  const toolEnabledAgents = ["backend-agent", "frontend-agent", "qa-agent", "cyber-agent", "devops-agent"];
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
        contextBlock += `\n#### ${kb.name}\n\`\`\`json\n${kb.content}\n\`\`\`\n`;
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
    // Architect is a Planner — NO tool instructions, no FILES_TO_EDIT format
    // Pipeline prompt in pipeline-templates.ts defines the output format (ADR + API contracts + ERD + file plan)
    prompt += `\n\n---\nYou do NOT have tool access. Do NOT try to read files or call any tools.\nProduce your architecture output as plain text following the format in the task above.\nFocus on completing ALL sections — especially API CONTRACTS (every endpoint must have method, path, request, response, auth).`;
  } else if (step.agentId === "pm-agent") {
    prompt += `\n\n---\n### TOOL ACCESS (READ-ONLY)\nYou have: list_files, read_file. Max 2 tool calls.\n\nBefore writing stories, check the REAL project structure:\n1. list_files on the relevant directory (app/(shell)/, app/api/, lib/stores/, types/)\n2. read_file on types or store if you need exact field names\n\nThis prevents writing stories about files/APIs that don't exist.\nDo NOT guess paths — verify them.\n\n### TOKEN BUDGET\n- Max 2 tool calls. Quick look, then write.\n- Keep output under 3000 words.`;
  } else if (readOnlyAgents.includes(step.agentId)) {
    prompt += `\n\n---\n### TOOL ACCESS (READ-ONLY)\nYou have: list_files, read_file, save_failure_pattern. Max 3 tool calls.\n- Use **save_failure_pattern** if you find architectural violations, security risks, or critical issues.\n\n### TOKEN BUDGET\n- Read ONLY files directly relevant to your task.\n- Do NOT explore directories or read ARCHITECTURE.md (already in context).\n- Keep output under 2000 words. Be concise.`;
  }

  // ── Inject Stage Contract (static + KB-dynamic) ──
  const contractBlock = getContractPromptBlock(step.id, kbEntriesForContracts);
  if (contractBlock) {
    prompt += `\n\n${contractBlock}`;
  }

  // ── Confidence self-reporting instruction ──
  prompt += CONFIDENCE_INSTRUCTION;

  return prompt;
}
