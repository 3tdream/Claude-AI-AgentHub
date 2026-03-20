/**
 * Cyber-Gated Redesign Runner
 * Extracted from pipeline-executor.ts for maintainability.
 *
 * Runs after Cyber step completes. If CRITICAL findings detected:
 * 1. Architect targeted redesign (delta only)
 * 2. Cyber re-evaluation
 * 3. Max 1 cycle, then escalate
 */

import type { PipelineExecution } from "@/types";
import { postLog } from "@/lib/hooks/use-logs";
import { PIPELINE } from "@/lib/config";
import {
  parseCyberOutput,
  shouldTriggerRedesign,
  triageFindings,
  buildRedesignPrompt,
  buildCyberReevalPrompt,
} from "@/lib/cyber-redesign-loop";

const { MAX_CYBER_REDESIGN_CYCLES } = PIPELINE;

interface CyberRunnerParams {
  stepId: string;
  execution: PipelineExecution;
  context: Record<string, string>;
  cyberRedesignCycles: number;
  onUpdate: (execution: PipelineExecution) => void;
}

interface CyberRunnerResult {
  shouldBreak: boolean;
  cyberRedesignCycles: number;
}

export async function runCyberRedesignLoop({
  stepId,
  execution,
  context,
  cyberRedesignCycles,
  onUpdate,
}: CyberRunnerParams): Promise<CyberRunnerResult> {
  const cyberOutput = execution.stepResults[stepId]?.output || "";
  const { riskLevel, findings } = parseCyberOutput(cyberOutput);

  if (shouldTriggerRedesign(riskLevel, findings, cyberRedesignCycles)) {
    const { redesignTargets, backlog } = triageFindings(findings);

    postLog({
      type: "system",
      content: `CYBER-GATED REDESIGN: ${redesignTargets.length} CRITICAL finding(s). Triggering Architect redesign (cycle ${cyberRedesignCycles + 1}/${MAX_CYBER_REDESIGN_CYCLES}).`,
    }).catch(() => {});

    if (backlog.length > 0) {
      postLog({
        type: "decision",
        agentId: "cyber-agent",
        content: `Security backlog (non-blocking): ${backlog.map((f) => `${f.severity}: ${f.title}`).join(", ")}`,
      }).catch(() => {});
    }

    // Step 1: Architect redesign
    const archOutput = context["step_s3-architect_output"] || "";
    const redesignPrompt = buildRedesignPrompt(archOutput, redesignTargets);
    const redesignStepId = `s3-architect-redesign-${cyberRedesignCycles + 1}`;

    execution.stepResults[redesignStepId] = {
      stepId: redesignStepId,
      status: "running",
      startedAt: new Date().toISOString(),
    };
    onUpdate({ ...execution });

    try {
      const res = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "architect-agent",
          model: "opus-4-6",
          userInput: redesignPrompt,
          useTools: true,
          toolMode: "readonly",
          maxToolSteps: 3,
          readBudget: 3,
        }),
      });
      const data = await res.json();
      const redesignOutput = data.content || "";

      context["step_s3-architect_output"] = archOutput + "\n\n--- SECURITY REDESIGN ---\n" + redesignOutput;

      execution.stepResults[redesignStepId] = {
        stepId: redesignStepId,
        status: "completed",
        output: redesignOutput.substring(0, 20000),
        duration: Date.now() - new Date(execution.stepResults[redesignStepId].startedAt!).getTime(),
        completedAt: new Date().toISOString(),
        inputTokens: data.tokensUsed?.input || 0,
        outputTokens: data.tokensUsed?.output || 0,
      };
      onUpdate({ ...execution });

      postLog({
        type: "decision",
        agentId: "architect-agent",
        content: `Architecture redesign completed: ${redesignTargets.map((f) => f.title).join(", ")}`,
      }).catch(() => {});

      // Step 2: Cyber re-evaluation
      const reevalPrompt = buildCyberReevalPrompt(redesignTargets, redesignOutput);
      const reevalStepId = `s3.5-cyber-reeval-${cyberRedesignCycles + 1}`;

      execution.stepResults[reevalStepId] = {
        stepId: reevalStepId,
        status: "running",
        startedAt: new Date().toISOString(),
      };
      onUpdate({ ...execution });

      const reevalRes = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: "cyber-agent",
          model: "opus-4-6",
          userInput: reevalPrompt,
          useTools: false,
          maxToolSteps: 0,
          readBudget: 0,
        }),
      });
      const reevalData = await reevalRes.json();
      const reevalOutput = reevalData.content || "";
      const reevalParsed = parseCyberOutput(reevalOutput);

      execution.stepResults[reevalStepId] = {
        stepId: reevalStepId,
        status: "completed",
        output: reevalOutput.substring(0, 20000),
        duration: Date.now() - new Date(execution.stepResults[reevalStepId].startedAt!).getTime(),
        completedAt: new Date().toISOString(),
        inputTokens: reevalData.tokensUsed?.input || 0,
        outputTokens: reevalData.tokensUsed?.output || 0,
      };
      context[`step_${stepId}_output`] = reevalOutput;
      onUpdate({ ...execution });

      const newCycles = cyberRedesignCycles + 1;

      if (reevalParsed.riskLevel === "Critical" || reevalParsed.findings.some((f) => f.severity === "Critical")) {
        postLog({
          type: "system",
          content: `CYBER-GATED REDESIGN: Critical vulnerability persists after redesign. Escalating to user.`,
        }).catch(() => {});
        execution.status = "paused";
        execution.escalatedSteps = [...(execution.escalatedSteps || []), stepId];
        onUpdate({ ...execution });
        return { shouldBreak: true, cyberRedesignCycles: newCycles };
      }

      postLog({
        type: "system",
        content: `CYBER-GATED REDESIGN: All critical findings resolved. Pipeline continuing with updated architecture.`,
      }).catch(() => {});
      return { shouldBreak: false, cyberRedesignCycles: newCycles };

    } catch (err) {
      execution.stepResults[redesignStepId] = {
        stepId: redesignStepId,
        status: "failed",
        error: err instanceof Error ? err.message : "Redesign failed",
        completedAt: new Date().toISOString(),
      };
      onUpdate({ ...execution });
      postLog({
        type: "system",
        content: `CYBER-GATED REDESIGN: Architect redesign failed. Continuing with original architecture.`,
      }).catch(() => {});
      return { shouldBreak: false, cyberRedesignCycles };
    }
  }

  // Non-critical findings → append as backlog
  if (findings.length > 0) {
    const { backlog } = triageFindings(findings);
    if (backlog.length > 0) {
      const backlogNote = `\n\nSECURITY BACKLOG (non-blocking, fix downstream):\n${backlog.map((f) => `- ${f.severity}: ${f.title} — ${f.fix}`).join("\n")}`;
      context[`step_${stepId}_output`] = (context[`step_${stepId}_output`] || "") + backlogNote;
    }
  }

  return { shouldBreak: false, cyberRedesignCycles };
}
