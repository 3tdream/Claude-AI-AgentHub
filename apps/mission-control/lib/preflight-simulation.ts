/**
 * Preflight Simulation Engine — S0.1
 *
 * Predicts pipeline outcome BEFORE execution by cross-referencing:
 * - Pipeline analytics (historical success rates per agent)
 * - KB failure-patterns (known failure modes)
 * - KB success-patterns (what works)
 * - Stage contracts (constraint count = complexity proxy)
 * - Input complexity analysis (word count, entity count, endpoint hints)
 *
 * Output: structured prediction with per-stage risk, overall probability,
 * and actionable recommendations.
 */

import { promises as fs } from "fs";
import path from "path";
import type { KBEntry, KBFile, StageContract, WorkflowStep } from "@/types";
import { STAGE_CONTRACTS, enrichContractWithKB } from "@/lib/stage-contracts";

// ── Types ────────────────────────────────────────────────

export interface AgentHistoricalStats {
  runs: number;
  avgScore: number;
  avgTokens: number;
  avgDuration: number;
  successRate: number;
  failRate: number;
}

interface PipelineAnalytics {
  totalRuns: number;
  byStatus: Record<string, number>;
  agentStats: Record<string, AgentHistoricalStats>;
  lastUpdated: string;
}

export interface StageSimulation {
  stageId: string;
  stageName: string;
  agentId: string;
  /** Predicted success probability 0-100 */
  successProbability: number;
  /** Risk level derived from probability + KB */
  riskLevel: "low" | "medium" | "high" | "critical";
  /** Historical stats if available */
  historicalStats: AgentHistoricalStats | null;
  /** KB failure patterns that apply to this stage */
  activeFailurePatterns: { id: string; title: string; severity: string }[];
  /** KB success patterns that apply */
  activeSuccessPatterns: { id: string; title: string }[];
  /** Dynamic constraints injected from KB */
  dynamicConstraintCount: number;
  /** Total blocking constraints (static + dynamic) */
  blockingConstraintCount: number;
  /** Specific recommendations for this stage */
  recommendations: string[];
  /** Estimated token cost (based on historical avg) */
  estimatedTokens: number;
  /** Estimated duration in ms */
  estimatedDuration: number;
}

export interface SimulationReport {
  /** Overall success probability 0-100 */
  overallProbability: number;
  /** Overall risk assessment */
  overallRisk: "low" | "medium" | "high" | "critical";
  /** Per-stage predictions */
  stages: StageSimulation[];
  /** Bottleneck stages (lowest probability) */
  bottlenecks: { stageId: string; probability: number; reason: string }[];
  /** Top recommendations (max 5) */
  recommendations: string[];
  /** Input complexity analysis */
  inputAnalysis: {
    wordCount: number;
    estimatedEndpoints: number;
    estimatedEntities: number;
    complexityScore: "simple" | "moderate" | "complex" | "very_complex";
    complexityFactors: string[];
  };
  /** Aggregate estimates */
  estimates: {
    totalTokens: number;
    totalDuration: string;
    estimatedCost: string;
  };
  /** Data sources used */
  dataSources: {
    pipelineRuns: number;
    kbFailurePatterns: number;
    kbSuccessPatterns: number;
    stageContracts: number;
  };
  /** ISO timestamp */
  simulatedAt: string;
}

// ── Data Loaders ─────────────────────────────────────────

const DATA_DIR = path.join(process.cwd(), "data");
const KB_DIR = path.join(DATA_DIR, "knowledge-base");

async function loadAnalytics(): Promise<PipelineAnalytics | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "pipeline-analytics.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function loadKBCategory(category: string): Promise<KBEntry[]> {
  try {
    const raw = await fs.readFile(path.join(KB_DIR, `${category}.json`), "utf-8");
    const file: KBFile = JSON.parse(raw);
    return file.entries;
  } catch {
    return [];
  }
}

// ── Input Complexity Analysis ────────────────────────────

function analyzeInputComplexity(input: string, steps: WorkflowStep[]): SimulationReport["inputAnalysis"] {
  const wordCount = input.split(/\s+/).filter(Boolean).length;
  const factors: string[] = [];

  // Estimate endpoints from keywords
  const endpointHints = (input.match(/endpoint|api|route|crud|get|post|patch|delete|webhook/gi) || []).length;
  const entityHints = (input.match(/entity|table|model|schema|user|order|product|transaction|client|tier|reward|referral|config|notification/gi) || []).length;
  const estimatedEndpoints = Math.max(endpointHints * 3, entityHints * 4, 10); // minimum 10
  const estimatedEntities = Math.max(entityHints, Math.ceil(estimatedEndpoints / 3));

  // Complexity factors
  if (wordCount > 200) factors.push("Long input (>200 words) — more requirements to satisfy");
  if (estimatedEndpoints > 25) factors.push(`High endpoint count (~${estimatedEndpoints}) — Backend truncation risk`);
  if (estimatedEntities > 10) factors.push(`Many entities (~${estimatedEntities}) — complex ERD`);
  if (/auth|jwt|oauth|session|rbac|role/i.test(input)) factors.push("Auth complexity — security-sensitive");
  if (/payment|billing|stripe|transaction/i.test(input)) factors.push("Payment integration — high-stakes logic");
  if (/realtime|websocket|sse|push/i.test(input)) factors.push("Realtime features — architectural complexity");
  if (/multi.?tenant|organization/i.test(input)) factors.push("Multi-tenancy — schema complexity");
  if (/gdpr|compliance|privacy|erasure/i.test(input)) factors.push("Compliance requirements — legal constraints");
  if (/queue|worker|async|event/i.test(input)) factors.push("Async processing — SQS/worker complexity");
  if (steps.length > 15) factors.push(`Long pipeline (${steps.length} stages) — higher cumulative failure risk`);

  let complexityScore: SimulationReport["inputAnalysis"]["complexityScore"];
  if (factors.length <= 1) complexityScore = "simple";
  else if (factors.length <= 3) complexityScore = "moderate";
  else if (factors.length <= 5) complexityScore = "complex";
  else complexityScore = "very_complex";

  return { wordCount, estimatedEndpoints, estimatedEntities, complexityScore, complexityFactors: factors };
}

// ── Stage Simulation ─────────────────────────────────────

function simulateStage(
  step: WorkflowStep,
  analytics: PipelineAnalytics | null,
  failurePatterns: KBEntry[],
  successPatterns: KBEntry[],
  inputComplexity: SimulationReport["inputAnalysis"],
): StageSimulation {
  const contract = STAGE_CONTRACTS[step.id];
  const agentShort = step.agentId.replace("-agent", "");

  // Historical stats
  const stats = analytics?.agentStats[agentShort] || analytics?.agentStats[step.agentId] || null;

  // KB matching
  const matchingFailures = failurePatterns.filter((e) =>
    e.source === step.id ||
    e.agentId === step.agentId ||
    e.tags.some((t) => t === agentShort),
  );
  const matchingSuccesses = successPatterns.filter((e) =>
    e.source === step.id ||
    e.agentId === step.agentId ||
    e.tags.some((t) => t === agentShort),
  );

  // Dynamic contract enrichment
  let dynamicConstraintCount = 0;
  let blockingConstraintCount = 0;
  if (contract) {
    const enriched = enrichContractWithKB(contract, failurePatterns);
    dynamicConstraintCount = enriched.constraints.length - contract.constraints.length;
    blockingConstraintCount = enriched.constraints.filter((c) => c.severity === "blocking").length;
  }

  // ── Calculate success probability ──

  let probability = 75; // Base probability for unknown agents

  // Factor 1: Historical success rate (strongest signal)
  if (stats && stats.runs >= 3) {
    probability = stats.successRate;
  }

  // Factor 2: KB failure pattern penalty
  const criticalFailures = matchingFailures.filter((f) => f.severity === "critical").length;
  const highFailures = matchingFailures.filter((f) => f.severity === "high").length;
  probability -= criticalFailures * 8; // Each critical pattern = -8%
  probability -= highFailures * 4;     // Each high pattern = -4%

  // Factor 3: KB success pattern bonus
  probability += matchingSuccesses.length * 3; // Each success pattern = +3%

  // Factor 4: Complexity penalty
  if (inputComplexity.complexityScore === "complex") probability -= 5;
  if (inputComplexity.complexityScore === "very_complex") probability -= 12;

  // Factor 5: Dynamic constraints bonus (KB-driven guardrails = higher safety)
  probability += dynamicConstraintCount * 2; // Each KB constraint = +2% (protection)

  // Factor 6: Low run count = uncertainty penalty
  if (stats && stats.runs < 5) probability -= 10;

  // Factor 7: Replan bonus (from S0.2 Strategy Architect)
  const replanBonus = (step.metadata as unknown as Record<string, unknown> | undefined)?.replanBonus;
  if (typeof replanBonus === "number") {
    probability += replanBonus;
  }

  // Clamp
  probability = Math.round(Math.max(5, Math.min(98, probability)));

  // Risk level
  let riskLevel: StageSimulation["riskLevel"];
  if (probability >= 80) riskLevel = "low";
  else if (probability >= 60) riskLevel = "medium";
  else if (probability >= 40) riskLevel = "high";
  else riskLevel = "critical";

  // Recommendations
  const recommendations: string[] = [];
  if (probability < 50) {
    recommendations.push(`Consider splitting ${step.agentName} work into smaller chunks`);
  }
  if (criticalFailures > 0) {
    recommendations.push(`${criticalFailures} critical KB patterns active — review before run`);
  }
  if (stats && stats.avgTokens > 50000) {
    recommendations.push(`High token usage (avg ${Math.round(stats.avgTokens / 1000)}K) — truncation risk`);
  }
  if (stats && stats.failRate > 50) {
    recommendations.push(`Historical fail rate ${Math.round(stats.failRate)}% — consider prompt tuning`);
  }
  if (dynamicConstraintCount > 0) {
    recommendations.push(`${dynamicConstraintCount} KB-derived constraints active — past failures are guarded`);
  }

  return {
    stageId: step.id,
    stageName: contract?.stageName || step.agentName,
    agentId: step.agentId,
    successProbability: probability,
    riskLevel,
    historicalStats: stats,
    activeFailurePatterns: matchingFailures.map((f) => ({ id: f.id, title: f.title, severity: f.severity })),
    activeSuccessPatterns: matchingSuccesses.map((s) => ({ id: s.id, title: s.title })),
    dynamicConstraintCount,
    blockingConstraintCount,
    recommendations,
    estimatedTokens: stats?.avgTokens || 15000,
    estimatedDuration: stats?.avgDuration || 30000,
  };
}

// ── Main Simulation ──────────────────────────────────────

export async function runPreflightSimulation(
  input: string,
  steps: WorkflowStep[],
): Promise<SimulationReport> {
  // Load all data sources in parallel
  const [analytics, failurePatterns, successPatterns] = await Promise.all([
    loadAnalytics(),
    loadKBCategory("failure-patterns"),
    loadKBCategory("success-patterns"),
  ]);

  const inputAnalysis = analyzeInputComplexity(input, steps);

  // Simulate each stage
  const stages = steps.map((step) =>
    simulateStage(step, analytics, failurePatterns, successPatterns, inputAnalysis),
  );

  // Overall probability: weighted approach
  // - Weighted average of per-stage probabilities (65%)
  // - Bottom-3 average as floor anchor (20%) — more stable than single min
  // - Critical/high penalty (15%)
  const criticalStages = stages.filter((s) => s.riskLevel === "critical");
  const highRiskStages = stages.filter((s) => s.riskLevel === "high");
  const avgProbability = stages.reduce((sum, s) => sum + s.successProbability, 0) / stages.length;
  const sorted = [...stages].sort((a, b) => a.successProbability - b.successProbability);
  const bottom3Avg = sorted.slice(0, 3).reduce((sum, s) => sum + s.successProbability, 0) / 3;

  let overallProbability = Math.round(
    avgProbability * 0.65 +
    bottom3Avg * 0.20 +
    (100 - criticalStages.length * 10 - highRiskStages.length * 3) * 0.15,
  );
  // Soft cap: many critical stages limit ceiling, but doesn't hard-block progress
  if (criticalStages.length >= 5) overallProbability = Math.min(overallProbability, 45);
  else if (criticalStages.length >= 3) overallProbability = Math.min(overallProbability, 55);
  overallProbability = Math.max(5, Math.min(95, overallProbability));

  // Overall risk
  let overallRisk: SimulationReport["overallRisk"];
  if (overallProbability >= 70) overallRisk = "low";
  else if (overallProbability >= 45) overallRisk = "medium";
  else if (overallProbability >= 25) overallRisk = "high";
  else overallRisk = "critical";

  // Bottlenecks: lowest 3 probabilities
  const bottlenecks = [...stages]
    .sort((a, b) => a.successProbability - b.successProbability)
    .slice(0, 3)
    .filter((s) => s.successProbability < 80)
    .map((s) => ({
      stageId: s.stageId,
      probability: s.successProbability,
      reason: s.activeFailurePatterns.length > 0
        ? `${s.activeFailurePatterns.length} KB failure patterns + ${Math.round(s.historicalStats?.failRate || 0)}% historical fail rate`
        : s.historicalStats && s.historicalStats.failRate > 30
          ? `${Math.round(s.historicalStats.failRate)}% historical fail rate across ${s.historicalStats.runs} runs`
          : `${s.blockingConstraintCount} blocking constraints, complexity: ${inputAnalysis.complexityScore}`,
    }));

  // Top recommendations
  const allRecs = stages.flatMap((s) => s.recommendations);
  const uniqueRecs = [...new Set(allRecs)].slice(0, 5);
  if (inputAnalysis.complexityScore === "very_complex" && uniqueRecs.length < 5) {
    uniqueRecs.push("Consider running in 'full' mode with all quality gates enabled");
  }
  if (criticalStages.length > 0 && uniqueRecs.length < 5) {
    uniqueRecs.push(`${criticalStages.length} stage(s) at critical risk — review KB failure patterns first`);
  }

  // Estimates
  const totalTokens = Math.round(stages.reduce((sum, s) => sum + s.estimatedTokens, 0));
  const totalDurationMs = stages.reduce((sum, s) => sum + s.estimatedDuration, 0);
  const COST_PER_1M_TOKENS = 3.0; // avg across models
  const estimatedCost = (totalTokens / 1_000_000) * COST_PER_1M_TOKENS;

  return {
    overallProbability,
    overallRisk,
    stages,
    bottlenecks,
    recommendations: uniqueRecs,
    inputAnalysis,
    estimates: {
      totalTokens,
      totalDuration: totalDurationMs > 60000
        ? `${(totalDurationMs / 60000).toFixed(1)}m`
        : `${(totalDurationMs / 1000).toFixed(0)}s`,
      estimatedCost: `$${estimatedCost < 0.01 ? estimatedCost.toFixed(4) : estimatedCost.toFixed(2)}`,
    },
    dataSources: {
      pipelineRuns: analytics?.totalRuns || 0,
      kbFailurePatterns: failurePatterns.length,
      kbSuccessPatterns: successPatterns.length,
      stageContracts: Object.keys(STAGE_CONTRACTS).length,
    },
    simulatedAt: new Date().toISOString(),
  };
}
