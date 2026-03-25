/**
 * Client-safe pipeline mode utilities.
 * No Node.js dependencies (fs, path, etc.)
 */

import { CRM_PIPELINE_STAGES } from "@/lib/pipeline-templates";
import { MODE_CONFIG } from "@/lib/config";
import type { ExecutionMode } from "@/types";

/** Classify task as technical, product, research, or mixed */
function classifyTaskType(input: string): "technical" | "product" | "research" | "mixed" {
  const t = input.toLowerCase();
  const tech = /\b(endpoint|api|route|component|page|fix|bug|refactor|migrate|update|add.*to|create.*file|implement|deploy|dockerfile|config)\b/i.test(t);
  const research = /\b(research|market|competitor|analyze|explore|discover|survey|benchmark)\b/i.test(t);
  const product = /\b(feature|user story|prd|requirements|design|ux|workflow|system.*from scratch|build.*module|new.*product)\b/i.test(t);
  if (research && !tech) return "research";
  if (product && !tech) return "product";
  if (tech && !product && !research) return "technical";
  return "mixed";
}

/** Determine which stages to skip based on task content */
function getSkipSet(input: string): Set<string> {
  const t = input.toLowerCase();
  const taskType = classifyTaskType(input);
  const skip = new Set<string>();

  // Research only for brand new products — never for tasks inside existing projects
  if (taskType === "technical" || taskType === "mixed") skip.add("s0-research");
  if (/\b(app\/|lib\/|components\/|api\/|page\.|route\.|\.tsx|\.ts|existing|current|our|this project)\b/i.test(t)) skip.add("s0-research");
  if (!/\b(ui|design|css|theme|style|component|page|dashboard|layout|mockup|token)\b/i.test(t)) skip.add("s6-designer");
  if (!/\b(deploy|docker|ci|cd|infra|terraform|env|devops|nginx|pm2|build)\b/i.test(t)) skip.add("s12a-devops");
  if (!/\b(database|db|schema|migration|table|entity|model|postgres|sql|erd)\b/i.test(t)) skip.add("s3.3-erd");
  if (!/\b(auth|security|jwt|token|password|encrypt|permission|role|rbac|payment|pii|gdpr|compliance|secret)\b/i.test(t)) {
    skip.add("s4-cyber");
    skip.add("s10-cyber-audit");
  }
  if (taskType === "technical") {
    skip.add("s9-business-qa");
    skip.add("s12b-consolidation");
  }
  return skip;
}

interface RoutingDecisionLike {
  mode: ExecutionMode;
  selectedAgents: string[];
  selectedStepIds: string[];
  skippedStepIds: string[];
  reasoning: string;
  complexity: number;
  estimatedDuration: string;
  includeCheckpoint: boolean;
  includeQualityEval: boolean;
  routedAt: string;
  routerModel: string;
}

/**
 * Recalculate a routing decision for a different mode.
 * Client-safe — no fs/path imports.
 */
export function recalculateForMode<T extends RoutingDecisionLike>(
  currentDecision: T,
  mode: ExecutionMode,
  taskInput?: string,
): T {
  if (mode === "full") {
    const skipSet = taskInput ? getSkipSet(taskInput) : new Set<string>();
    const allSteps = CRM_PIPELINE_STAGES.filter((s) => !skipSet.has(s.id));
    const skippedSteps = CRM_PIPELINE_STAGES.filter((s) => skipSet.has(s.id));
    return {
      ...currentDecision,
      mode: "full",
      selectedAgents: [...new Set(allSteps.map((s) => s.agentId))],
      selectedStepIds: allSteps.map((s) => s.id),
      skippedStepIds: skippedSteps.map((s) => s.id),
      includeCheckpoint: MODE_CONFIG.full.includeCheckpoint,
      includeQualityEval: true,
      reasoning: `Full pipeline${skipSet.size > 0 ? ` (${skipSet.size} irrelevant stages skipped)` : ""}`,
    };
  }

  const modeConf = MODE_CONFIG[mode];
  const agentSet = new Set(currentDecision.selectedAgents);
  const selectedSet = new Set<string>();
  const stepsById = new Map(CRM_PIPELINE_STAGES.map((s) => [s.id, s]));

  // First pass: mark directly selected steps (skip checkpoints)
  for (const step of CRM_PIPELINE_STAGES) {
    if (!step.metadata?.isCheckpoint && agentSet.has(step.agentId)) {
      selectedSet.add(step.id);
    }
  }

  // Second pass: dependency resolution based on mode
  if (modeConf.resolveDeps === "architect-only") {
    const architectStep = CRM_PIPELINE_STAGES.find(
      (s) => s.agentId === "architect-agent",
    );
    if (architectStep) {
      selectedSet.add(architectStep.id);
      for (const depId of architectStep.dependsOn) {
        const dep = stepsById.get(depId);
        if (dep && !dep.metadata?.isCheckpoint) {
          selectedSet.add(depId);
        }
      }
    }
    const skipSet = new Set(modeConf.skipAgents);
    for (const stepId of [...selectedSet]) {
      const step = stepsById.get(stepId);
      if (step && skipSet.has(step.agentId)) {
        selectedSet.delete(stepId);
      }
    }
  }

  const selectedStepIds: string[] = [];
  const skippedStepIds: string[] = [];
  for (const step of CRM_PIPELINE_STAGES) {
    if (selectedSet.has(step.id)) {
      selectedStepIds.push(step.id);
    } else {
      skippedStepIds.push(step.id);
    }
  }

  return {
    ...currentDecision,
    mode,
    selectedStepIds,
    skippedStepIds,
    includeCheckpoint: modeConf.includeCheckpoint,
    includeQualityEval: modeConf.evalScope !== "none",
    reasoning: `Manual override: ${mode} mode`,
  };
}
