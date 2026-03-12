/**
 * Filters pipeline steps based on a routing decision.
 * Client-safe — no Node.js dependencies (fs, path, etc.)
 */

import type { WorkflowStep, RoutingDecisionData } from "@/types";

export function filterStepsForRouting(
  allSteps: WorkflowStep[],
  decision: RoutingDecisionData,
): WorkflowStep[] {
  if (decision.mode === "full") return allSteps;

  const selectedSet = new Set(decision.selectedStepIds);

  return allSteps
    .filter((s) => selectedSet.has(s.id))
    .map((step) => ({
      ...step,
      // Re-wire dependsOn: remove dependencies on skipped steps
      dependsOn: step.dependsOn.filter((d) => selectedSet.has(d)),
      // Adjust quality threshold for quick mode
      metadata: step.metadata
        ? {
            ...step.metadata,
            qualityThreshold: decision.includeQualityEval
              ? step.metadata.qualityThreshold
              : 0,
          }
        : step.metadata,
    }));
}
