/**
 * S0.2 Strategy Architect — Iterative Replanning Engine
 *
 * Analyzes simulation bottlenecks, generates replan actions from KB + analytics,
 * applies them to pipeline steps, re-simulates, and loops until convergence.
 *
 * No LLM calls — pure deterministic logic based on data.
 * This makes it fast, predictable, and debuggable.
 */

import type { WorkflowStep, KBEntry, ReplanAction, ReplanIteration, ReplanReport } from "@/types";
import type { SimulationReport, StageSimulation } from "@/lib/preflight-simulation";
import { runPreflightSimulation } from "@/lib/preflight-simulation";

const THRESHOLD = 70;
const MIN_DELTA = 1; // Stop if lift < 1% between iterations (let it grind)

// ═══════════════════════════════════════════════════════════════
// ACTION GENERATORS — each analyzes a bottleneck and proposes fixes
// ═══════════════════════════════════════════════════════════════

function generateActions(
  simulation: SimulationReport,
  steps: WorkflowStep[],
  kbEntries: KBEntry[],
  appliedActionIds: Set<string>,
): ReplanAction[] {
  const actions: ReplanAction[] = [];
  const stepsById = new Map(steps.map((s) => [s.id, s]));

  for (const stage of simulation.stages) {
    if (stage.successProbability >= THRESHOLD) continue; // Skip healthy stages

    const step = stepsById.get(stage.stageId);
    if (!step) continue;

    // ── Strategy 1: Split high-token stages ──
    if (
      stage.historicalStats &&
      stage.historicalStats.avgTokens > 40000 &&
      stage.successProbability < 40
    ) {
      const actionId = `split-${stage.stageId}`;
      if (!appliedActionIds.has(actionId)) {
        actions.push({
          id: actionId,
          type: "split_stage",
          stageId: stage.stageId,
          description: `Split ${stage.stageName} into smaller chunks (avg ${Math.round(stage.historicalStats.avgTokens / 1000)}K tokens)`,
          target: "Reduce truncation risk by chunking output",
          expectedLift: 12,
        });
      }
    }

    // ── Strategy 2: Inject KB context for stages with failure patterns ──
    if (stage.activeFailurePatterns.length > 0) {
      const uninjectedPatterns = stage.activeFailurePatterns.filter(
        (p) => !appliedActionIds.has(`kb-inject-${stage.stageId}-${p.id}`),
      );
      if (uninjectedPatterns.length > 0) {
        const actionId = `kb-inject-${stage.stageId}-${uninjectedPatterns[0].id}`;
        if (!appliedActionIds.has(actionId)) {
          actions.push({
            id: actionId,
            type: "inject_kb_context",
            stageId: stage.stageId,
            description: `Inject ${uninjectedPatterns.length} KB failure patterns into ${stage.stageName} prompt`,
            target: `Address: ${uninjectedPatterns[0].title}`,
            expectedLift: 5 * uninjectedPatterns.length,
            kbEntryId: uninjectedPatterns[0].id,
          });
        }
      }
    }

    // ── Strategy 3: Add guard stage after risky implementation stages ──
    const implStages = ["s5-backend", "s6-designer", "s7-frontend"];
    if (implStages.includes(stage.stageId) && stage.successProbability < 35) {
      const guardId = `guard-after-${stage.stageId}`;
      if (!appliedActionIds.has(guardId)) {
        actions.push({
          id: guardId,
          type: "add_guard",
          stageId: stage.stageId,
          description: `Add validation checkpoint after ${stage.stageName}`,
          target: "Catch failures before downstream stages consume broken output",
          expectedLift: 8,
        });
      }
    }

    // ── Strategy 4: Boost priority — move critical outputs to Chunk A ──
    if (
      stage.historicalStats &&
      stage.historicalStats.failRate > 50 &&
      stage.dynamicConstraintCount > 0
    ) {
      const boostId = `boost-${stage.stageId}`;
      if (!appliedActionIds.has(boostId)) {
        actions.push({
          id: boostId,
          type: "boost_priority",
          stageId: stage.stageId,
          description: `Boost critical outputs to Chunk A in ${stage.stageName}`,
          target: "Ensure most important files generated first before token limit",
          expectedLift: 7,
        });
      }
    }

    // ── Strategy 5: Add constraint from KB patterns ──
    const criticalKBEntries = kbEntries.filter(
      (e) =>
        e.severity === "critical" &&
        (e.agentId === step.agentId ||
          e.source === stage.stageId ||
          e.tags.some((t) => t === step.agentId.replace("-agent", ""))),
    );
    for (const entry of criticalKBEntries) {
      const constraintId = `constraint-${stage.stageId}-${entry.id}`;
      if (!appliedActionIds.has(constraintId)) {
        actions.push({
          id: constraintId,
          type: "add_constraint",
          stageId: stage.stageId,
          description: `Add blocking constraint: "${entry.title}"`,
          target: entry.content.match(/Fix:\s*(.+?)(?:\.|$)/i)?.[1] || entry.title,
          expectedLift: 4,
          kbEntryId: entry.id,
        });
      }
    }

    // ── Strategy 6: Add pre-validation for context-dependent stages ──
    if (
      stage.historicalStats &&
      stage.historicalStats.successRate < 40 &&
      step.dependsOn.length > 2
    ) {
      const preValId = `preval-${stage.stageId}`;
      if (!appliedActionIds.has(preValId)) {
        actions.push({
          id: preValId,
          type: "add_pre_validation",
          stageId: stage.stageId,
          description: `Add input validation before ${stage.stageName} (depends on ${step.dependsOn.length} upstream stages)`,
          target: "Verify upstream outputs are complete before this stage starts",
          expectedLift: 6,
        });
      }
    }

    // ── Strategy 7: Skip non-essential stages in critical risk ──
    const optionalStages = ["s0-research", "s6-designer"];
    if (
      optionalStages.includes(stage.stageId) &&
      simulation.overallProbability < 30
    ) {
      const skipId = `skip-${stage.stageId}`;
      if (!appliedActionIds.has(skipId)) {
        actions.push({
          id: skipId,
          type: "skip_stage",
          stageId: stage.stageId,
          description: `Skip ${stage.stageName} to reduce pipeline complexity`,
          target: "Focus resources on critical path stages",
          expectedLift: 3,
        });
      }
    }
  }

  // Sort by expected lift (highest first)
  actions.sort((a, b) => b.expectedLift - a.expectedLift);

  return actions;
}

// ═══════════════════════════════════════════════════════════════
// ACTION APPLIER — modifies pipeline steps based on actions
// ═══════════════════════════════════════════════════════════════

function addReplanBonus(step: WorkflowStep, bonus: number) {
  const meta = (step.metadata || {}) as Record<string, unknown>;
  meta.replanBonus = ((meta.replanBonus as number) || 0) + bonus;
  step.metadata = meta as unknown as WorkflowStep["metadata"];
}

function applyActions(
  steps: WorkflowStep[],
  actions: ReplanAction[],
): { steps: WorkflowStep[]; modified: string[] } {
  let modifiedSteps = [...steps.map((s) => ({ ...s }))];
  const modified: string[] = [];

  for (const action of actions) {
    const idx = modifiedSteps.findIndex((s) => s.id === action.stageId);
    if (idx === -1) continue;

    switch (action.type) {
      case "split_stage": {
        const step = modifiedSteps[idx];
        step.promptTemplate += `\n\n[REPLAN: This stage was flagged for high truncation risk. SPLIT your output into clearly labeled chunks. Complete each chunk fully before starting the next. If running out of tokens, finish current chunk and list remaining chunks.]`;
        addReplanBonus(step, action.expectedLift);
        modified.push(step.id);
        break;
      }

      case "inject_kb_context": {
        const step = modifiedSteps[idx];
        step.promptTemplate += `\n\n[REPLAN: KB failure pattern detected for this stage. Pay special attention to: ${action.target}. This has caused failures in past runs.]`;
        addReplanBonus(step, action.expectedLift);
        modified.push(step.id);
        break;
      }

      case "add_guard": {
        const step = modifiedSteps[idx];
        const guardStep: WorkflowStep = {
          id: `${step.id}-guard`,
          agentId: "orchestrator",
          agentName: "Orchestrator",
          promptTemplate: `QUICK VALIDATION: Check the output from ${step.agentName} (${step.id}).
Verify: (1) Output is not truncated mid-file, (2) All required sections present, (3) No placeholder code.
If valid: respond "GUARD: PASS". If issues found: list them briefly.`,
          dependsOn: [step.id],
          outputKey: `${step.outputKey}_guard`,
          metadata: {
            stageNumber: `${step.metadata?.stageNumber || "?"}.G`,
            qualityThreshold: 0,
            leadAgent: "orchestrator",
            model: "sonnet-4-6",
          },
        };
        modifiedSteps.splice(idx + 1, 0, guardStep);
        for (const s of modifiedSteps) {
          if (s.dependsOn.includes(step.id) && s.id !== guardStep.id) {
            s.dependsOn = s.dependsOn.map((d) => (d === step.id ? guardStep.id : d));
          }
        }
        addReplanBonus(step, action.expectedLift);
        modified.push(step.id, guardStep.id);
        break;
      }

      case "boost_priority": {
        const step = modifiedSteps[idx];
        step.promptTemplate += `\n\n[REPLAN: PRIORITY BOOST — Your most critical outputs (auth, migrations, shared types) MUST be in the first 40% of your response. Historical data shows this stage truncates frequently. Front-load the essentials.]`;
        addReplanBonus(step, action.expectedLift);
        modified.push(step.id);
        break;
      }

      case "add_constraint": {
        const step = modifiedSteps[idx];
        step.promptTemplate += `\n\n[REPLAN CONSTRAINT: ${action.target}. Violation of this constraint has caused pipeline failures in past runs. This is a BLOCKING requirement.]`;
        addReplanBonus(step, action.expectedLift);
        modified.push(step.id);
        break;
      }

      case "add_pre_validation": {
        const step = modifiedSteps[idx];
        step.promptTemplate = `[PRE-VALIDATION: Before starting your main task, verify that your inputs are complete. Check that upstream outputs contain the data you need. If any input is truncated or missing critical sections, note it explicitly at the top of your output.]\n\n${step.promptTemplate}`;
        addReplanBonus(step, action.expectedLift);
        modified.push(step.id);
        break;
      }

      case "skip_stage": {
        // Remove stage and update dependencies
        const step = modifiedSteps[idx];
        const stepDeps = step.dependsOn;
        // Point downstream stages to this stage's dependencies instead
        for (const s of modifiedSteps) {
          s.dependsOn = s.dependsOn.map((d) => (d === step.id ? stepDeps[0] || "" : d)).filter(Boolean);
        }
        modifiedSteps.splice(idx, 1);
        modified.push(step.id);
        break;
      }
    }
  }

  return { steps: modifiedSteps, modified: [...new Set(modified)] };
}

// ═══════════════════════════════════════════════════════════════
// MAIN REPLAN LOOP
// ═══════════════════════════════════════════════════════════════

export async function runStrategyArchitect(
  input: string,
  steps: WorkflowStep[],
  initialSimulation: SimulationReport,
  kbEntries: KBEntry[],
): Promise<ReplanReport> {
  const startTime = Date.now();
  const iterations: ReplanIteration[] = [];
  const appliedActionIds = new Set<string>();
  const allAppliedActions: ReplanAction[] = [];

  let currentSteps = steps.map((s) => ({ ...s, promptTemplate: s.promptTemplate }));
  let currentScore = initialSimulation.overallProbability;
  let currentSimulation = initialSimulation;
  const initialScore = currentScore;

  let stopReason: ReplanReport["stopReason"] = "converged";

  for (let i = 0; ; i++) {
    const iterStart = Date.now();

    // Generate candidate actions for this iteration
    const candidateActions = generateActions(currentSimulation, currentSteps, kbEntries, appliedActionIds);

    if (candidateActions.length === 0) {
      stopReason = "no_actions_available";
      break;
    }

    // Pick top actions — scale with iteration (more aggressive each round)
    const maxActions = Math.min(3 + i * 2, candidateActions.length);
    const selectedActions = candidateActions.slice(0, maxActions);

    // Apply actions to pipeline steps
    const { steps: newSteps, modified } = applyActions(currentSteps, selectedActions);
    currentSteps = newSteps;

    // Mark actions as applied
    for (const action of selectedActions) {
      appliedActionIds.add(action.id);
      allAppliedActions.push(action);
    }

    // Re-simulate with modified steps
    const newSimulation = await runPreflightSimulation(input, currentSteps);
    const newScore = newSimulation.overallProbability;
    const lift = newScore - currentScore;

    iterations.push({
      iteration: i + 1,
      actions: selectedActions,
      simulationBefore: currentScore,
      simulationAfter: newScore,
      lift,
      stepsModified: modified,
      tokensUsed: 0, // Simulation is computation, not LLM call
      durationMs: Date.now() - iterStart,
    });

    currentScore = newScore;
    currentSimulation = newSimulation;

    // Check stop conditions
    if (currentScore >= THRESHOLD) {
      stopReason = "threshold_reached";
      break;
    }

    if (lift < MIN_DELTA) {
      stopReason = "converged";
      break;
    }
  }

  const totalLift = currentScore - initialScore;

  return {
    initialScore,
    finalScore: currentScore,
    totalLift,
    liftRate: initialScore > 0 ? totalLift / initialScore : 0,
    iterations,
    stopReason,
    totalDurationMs: Date.now() - startTime,
    modifiedStepIds: [...new Set(iterations.flatMap((it) => it.stepsModified))],
    appliedActions: allAppliedActions,
    replannedAt: new Date().toISOString(),
  };
}
