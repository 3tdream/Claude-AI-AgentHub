/** S0.2 Strategy Architect — iterative replanning types */

export interface ReplanAction {
  id: string;
  type:
    | "split_stage"        // Break one stage into sub-stages
    | "inject_kb_context"  // Force specific KB entries into stage prompt
    | "add_guard"          // Insert QA/Cyber check after a risky stage
    | "reorder"            // Move stage earlier/later
    | "boost_priority"     // Move critical outputs to chunk A
    | "add_constraint"     // Add explicit constraint to stage contract
    | "skip_stage"         // Remove non-essential stage from pipeline
    | "add_pre_validation"; // Add input validation before stage
  stageId: string;
  description: string;
  /** What this action targets */
  target: string;
  /** Expected lift in probability (estimated) */
  expectedLift: number;
  /** KB entry that motivated this action (if any) */
  kbEntryId?: string;
}

export interface ReplanIteration {
  iteration: number;
  actions: ReplanAction[];
  simulationBefore: number;
  simulationAfter: number;
  lift: number;
  /** Steps modified in this iteration */
  stepsModified: string[];
  /** Tokens used for this iteration's simulation */
  tokensUsed: number;
  durationMs: number;
}

export interface ReplanReport {
  /** Starting simulation score */
  initialScore: number;
  /** Final simulation score after all iterations */
  finalScore: number;
  /** Total lift achieved */
  totalLift: number;
  /** Lift rate: totalLift / initialScore */
  liftRate: number;
  /** All iterations */
  iterations: ReplanIteration[];
  /** Why replan stopped */
  stopReason: "threshold_reached" | "converged" | "no_actions_available";
  /** Total duration of all iterations */
  totalDurationMs: number;
  /** Final recommended pipeline steps (modified) */
  modifiedStepIds: string[];
  /** Actions that were applied */
  appliedActions: ReplanAction[];
  /** Timestamp */
  replannedAt: string;
}
