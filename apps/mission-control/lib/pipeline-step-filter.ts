/**
 * Filters pipeline steps based on a routing decision.
 * Applies per-mode quality thresholds:
 *   - Quick: threshold=0 on all (skip eval)
 *   - Medium: threshold=0 on all except last step (which gets 7)
 *   - Full: threshold=8.5 on all steps
 * Client-safe — no Node.js dependencies (fs, path, etc.)
 */

import type { WorkflowStep, RoutingDecisionData } from "@/types";

export function filterStepsForRouting(
  allSteps: WorkflowStep[],
  decision: RoutingDecisionData,
): WorkflowStep[] {
  // Full mode: all steps with strict threshold
  if (decision.mode === "full") {
    return allSteps.map((step) => ({
      ...step,
      metadata: step.metadata
        ? { ...step.metadata, qualityThreshold: 8.5 }
        : step.metadata,
    }));
  }

  const selectedSet = new Set(decision.selectedStepIds);
  const filteredSteps = allSteps.filter((s) => selectedSet.has(s.id));

  // Quick mode: all thresholds = 0 (skip eval entirely)
  if (decision.mode === "quick") {
    return filteredSteps.map((step) => ({
      ...step,
      dependsOn: step.dependsOn.filter((d) => selectedSet.has(d)),
      metadata: step.metadata
        ? { ...step.metadata, qualityThreshold: 0 }
        : step.metadata,
    }));
  }

  // Medium mode: threshold=0 on all steps except the last one (which gets 7)
  const lastStepId =
    filteredSteps.length > 0
      ? filteredSteps[filteredSteps.length - 1].id
      : null;

  return filteredSteps.map((step) => ({
    ...step,
    dependsOn: step.dependsOn.filter((d) => selectedSet.has(d)),
    metadata: step.metadata
      ? {
          ...step.metadata,
          qualityThreshold: step.id === lastStepId ? 7 : 0,
        }
      : step.metadata,
  }));
}
