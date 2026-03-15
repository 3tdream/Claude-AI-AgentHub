/**
 * Client-safe pipeline mode utilities.
 * No Node.js dependencies (fs, path, etc.)
 */

import { CRM_PIPELINE_STAGES } from "@/lib/pipeline-templates";
import { MODE_CONFIG } from "@/lib/config";
import type { ExecutionMode } from "@/types";

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
): T {
  if (mode === "full") {
    return {
      ...currentDecision,
      mode: "full",
      selectedAgents: [...new Set(CRM_PIPELINE_STAGES.map((s) => s.agentId))],
      selectedStepIds: CRM_PIPELINE_STAGES.map((s) => s.id),
      skippedStepIds: [],
      includeCheckpoint: MODE_CONFIG.full.includeCheckpoint,
      includeQualityEval: true,
      reasoning: "Manual override: full pipeline",
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
