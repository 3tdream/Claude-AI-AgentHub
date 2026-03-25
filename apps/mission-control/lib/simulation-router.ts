/**
 * Simulation-Aware Router — adjusts routing decisions based on preflight simulation.
 *
 * Takes a routing decision + simulation report and produces an adjusted decision
 * with stage splits, mode upgrades, and guard insertions.
 */

import type { SimulationReport, StageSimulation } from "@/lib/preflight-simulation";
import type { RoutingDecision } from "@/lib/smart-router";
import type { ExecutionMode } from "@/types";

export interface SimulationAdjustment {
  type: "mode_upgrade" | "stage_warning" | "stage_split" | "guard_added";
  stageId?: string;
  description: string;
  reason: string;
}

export interface AdjustedRoutingDecision extends RoutingDecision {
  simulation: {
    overallProbability: number;
    overallRisk: string;
    bottlenecks: SimulationReport["bottlenecks"];
    adjustments: SimulationAdjustment[];
    estimates: SimulationReport["estimates"];
    inputComplexity: string;
  };
}

/**
 * Apply simulation-based adjustments to a routing decision.
 */
export function applySimulationAdjustments(
  decision: RoutingDecision,
  simulation: SimulationReport,
): AdjustedRoutingDecision {
  const adjustments: SimulationAdjustment[] = [];
  let adjustedMode = decision.mode;
  let adjustedReasoning = decision.reasoning;
  const adjustedAgents = [...decision.selectedAgents];
  const adjustedStepIds = [...decision.selectedStepIds];
  const adjustedSkipIds = [...decision.skippedStepIds];

  // ── Rule 1: Mode upgrade if simulation says too risky ──
  if (simulation.overallProbability < 30 && decision.mode === "quick") {
    adjustedMode = "medium";
    adjustments.push({
      type: "mode_upgrade",
      description: "Upgraded from quick → medium",
      reason: `Simulation predicts ${simulation.overallProbability}% success — too risky for quick mode`,
    });
  }
  if (simulation.overallProbability < 20 && decision.mode === "medium") {
    adjustedMode = "full";
    adjustments.push({
      type: "mode_upgrade",
      description: "Upgraded from medium → full",
      reason: `Simulation predicts ${simulation.overallProbability}% success — needs full pipeline with all gates`,
    });
  }

  // ── Rule 2: Force QA if any stage is critical ──
  const criticalStages = simulation.stages.filter(
    (s) => s.riskLevel === "critical" && adjustedStepIds.includes(s.stageId),
  );
  if (criticalStages.length > 0 && !adjustedAgents.includes("qa-agent")) {
    adjustedAgents.push("qa-agent");
    const qaStepId = "s8-technical-qa";
    if (!adjustedStepIds.includes(qaStepId)) {
      adjustedStepIds.push(qaStepId);
      const idx = adjustedSkipIds.indexOf(qaStepId);
      if (idx !== -1) adjustedSkipIds.splice(idx, 1);
    }
    adjustments.push({
      type: "guard_added",
      stageId: qaStepId,
      description: "Added QA-Agent to pipeline",
      reason: `${criticalStages.length} critical stage(s): ${criticalStages.map((s) => s.stageId).join(", ")}`,
    });
  }

  // ── Rule 3: Force Cyber if security-related KB patterns active ──
  const securityRiskyStages = simulation.stages.filter(
    (s) => s.activeFailurePatterns.some((p) => p.severity === "critical") &&
    adjustedStepIds.includes(s.stageId),
  );
  if (securityRiskyStages.length > 0 && !adjustedAgents.includes("cyber-agent")) {
    adjustedAgents.push("cyber-agent");
    const cyberStepId = "s4-cyber";
    if (!adjustedStepIds.includes(cyberStepId)) {
      adjustedStepIds.push(cyberStepId);
      const idx = adjustedSkipIds.indexOf(cyberStepId);
      if (idx !== -1) adjustedSkipIds.splice(idx, 1);
    }
    adjustments.push({
      type: "guard_added",
      stageId: cyberStepId,
      description: "Added Cyber-Agent to pipeline",
      reason: `Critical security patterns active in ${securityRiskyStages.map((s) => s.stageId).join(", ")}`,
    });
  }

  // ── Rule 4: Warn on high-risk stages ──
  for (const stage of simulation.stages) {
    if (!adjustedStepIds.includes(stage.stageId)) continue;

    if (stage.successProbability < 30) {
      adjustments.push({
        type: "stage_warning",
        stageId: stage.stageId,
        description: `${stage.stageName}: ${stage.successProbability}% predicted success`,
        reason: stage.recommendations[0] || `${stage.activeFailurePatterns.length} KB failure patterns active`,
      });
    }

    // High token usage warning
    if (stage.historicalStats && stage.historicalStats.avgTokens > 50000) {
      adjustments.push({
        type: "stage_warning",
        stageId: stage.stageId,
        description: `${stage.stageName}: high token usage (${Math.round(stage.historicalStats.avgTokens / 1000)}K avg)`,
        reason: "Truncation risk — output contract chunking is active",
      });
    }
  }

  // ── Rule 5: Suggest stage split for very complex stages ──
  for (const stage of simulation.stages) {
    if (!adjustedStepIds.includes(stage.stageId)) continue;

    if (
      stage.successProbability < 25 &&
      stage.historicalStats &&
      stage.historicalStats.avgTokens > 40000
    ) {
      adjustments.push({
        type: "stage_split",
        stageId: stage.stageId,
        description: `Consider splitting ${stage.stageName} into smaller chunks`,
        reason: `${stage.successProbability}% success + ${Math.round(stage.historicalStats.avgTokens / 1000)}K avg tokens = high truncation risk`,
      });
    }
  }

  // Update reasoning
  if (adjustments.length > 0) {
    const upgradeAdj = adjustments.find((a) => a.type === "mode_upgrade");
    const guardAdj = adjustments.filter((a) => a.type === "guard_added");
    const warnCount = adjustments.filter((a) => a.type === "stage_warning").length;

    adjustedReasoning = `${decision.reasoning}. Simulation: ${simulation.overallProbability}% predicted success`;
    if (upgradeAdj) adjustedReasoning += ` — ${upgradeAdj.description}`;
    if (guardAdj.length) adjustedReasoning += ` — +${guardAdj.length} guard agent(s)`;
    if (warnCount) adjustedReasoning += ` — ${warnCount} warning(s)`;
  }

  return {
    ...decision,
    mode: adjustedMode as ExecutionMode,
    selectedAgents: [...new Set(adjustedAgents)],
    selectedStepIds: adjustedStepIds,
    skippedStepIds: adjustedSkipIds,
    reasoning: adjustedReasoning,
    includeCheckpoint: adjustedMode === "full" ? true : decision.includeCheckpoint,
    includeQualityEval: adjustedMode !== "quick",
    simulation: {
      overallProbability: simulation.overallProbability,
      overallRisk: simulation.overallRisk,
      bottlenecks: simulation.bottlenecks,
      adjustments,
      estimates: simulation.estimates,
      inputComplexity: simulation.inputAnalysis.complexityScore,
    },
  };
}
