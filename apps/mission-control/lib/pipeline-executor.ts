import type { WorkflowStep, PipelineExecution, QualityScore } from "@/types";
import { postLog } from "@/lib/hooks/use-logs";
import { evaluateStepOutput, buildRetryPrompt } from "@/lib/quality-evaluator";
import { PIPELINE } from "@/lib/config";
import type { RoutingDecisionData } from "@/types";

const { MAX_RETRIES, ESCALATION_THRESHOLD, STEP_TIMEOUT_MS } = PIPELINE;

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
}

export async function executePipeline(
  steps: WorkflowStep[],
  input: string,
  workflowId: string,
  workflowName: string,
  callbacks: ExecutorCallbacks,
  routingDecision?: RoutingDecisionData,
  selectedProject?: string | null,
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
    id: generateId(),
    workflowId,
    workflowName,
    status: "running",
    input,
    stepResults: {},
    startedAt: new Date().toISOString(),
    qualityScores: {},
    escalatedSteps: [],
    routingDecision: routingDecision || undefined,
  };

  steps.forEach((s) => {
    execution.stepResults[s.id] = { stepId: s.id, status: "pending" };
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
    let currentPrompt = buildPrompt(step, input, context, projectContext, routingDecision?.mode);
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
        const controller = STEP_TIMEOUT_MS > 0 ? new AbortController() : undefined;
        const timer = controller ? setTimeout(() => controller.abort(), STEP_TIMEOUT_MS) : undefined;

        // Determine tool access level
        const implementationAgents = ["backend-agent", "frontend-agent"];
        const readOnlyAgents = ["architect-agent", "qa-agent", "cyber-agent", "devops-agent"];
        const useTools = implementationAgents.includes(step.agentId) || readOnlyAgents.includes(step.agentId);
        const toolMode = implementationAgents.includes(step.agentId) ? "readwrite" : "readonly";

        const res = await fetch("/api/ai/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentId: step.agentId,
            model: step.metadata?.model || "sonnet-4-6",
            userInput: currentPrompt,
            useTools,
            toolMode,
          }),
          signal: controller?.signal,
        });

        if (timer) clearTimeout(timer);
        const data = await res.json();

        if (!data.success || !data.content) {
          throw new Error(data.error || "Execution failed");
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
        };

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
            buildPrompt(step, input, context, projectContext, routingDecision?.mode),
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
  for (const [key, val] of Object.entries(context)) {
    prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
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
  if (projectCtx && (projectCtx.architecture || projectCtx.rules)) {
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
  }

  // --- Tool-use instructions for agents with file access ---
  const implementationAgents = ["backend-agent", "frontend-agent"];
  const readOnlyAgents = ["architect-agent", "qa-agent", "cyber-agent", "devops-agent"];

  if (implementationAgents.includes(step.agentId)) {
    const autoApprove = routingMode && routingMode !== "full"
      ? `\n### AUTO-APPROVED ARCHITECTURAL PLAN\nThe architectural plan is approved. Proceed with implementation immediately.\n`
      : "";

    prompt += `\n\n---${autoApprove}\n### TOOL ACCESS\nYou have access to the project file system via tools:\n- **list_files**: Browse directories to find the right files\n- **read_file**: Read existing code to understand context, imports, and style\n- **edit_file**: Make surgical edits to existing files (old_string → new_string). ALWAYS read the file first.\n- **create_file**: Create new files only when needed\n- **run_command**: Run \`npx tsc --noEmit\` to verify your changes compile\n\n**WORKFLOW**: list_files → read_file → understand → edit_file (minimal changes) → run_command to verify.\nDo NOT rewrite entire files. Make the MINIMUM change needed. After all edits, provide a brief summary of what you changed.`;
  } else if (readOnlyAgents.includes(step.agentId)) {
    prompt += `\n\n---\n### TOOL ACCESS (READ-ONLY)\nYou have read-only access to the project file system:\n- **list_files**: Browse directories\n- **read_file**: Read file contents\n\nUse these tools to verify your analysis against the actual codebase. Do NOT guess file structures — read them.`;
  }

  return prompt;
}
