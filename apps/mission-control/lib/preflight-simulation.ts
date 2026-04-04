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

async function loadKBCategory(category: string, projectId?: string | null): Promise<KBEntry[]> {
  const entries: KBEntry[] = [];

  // Load global entries
  try {
    const raw = await fs.readFile(path.join(KB_DIR, `${category}.json`), "utf-8");
    const file: KBFile = JSON.parse(raw);
    entries.push(...file.entries);
  } catch { /* no global file */ }

  // Load project-specific entries if projectId provided
  if (projectId) {
    try {
      const projectPath = path.join(process.cwd(), "projects", projectId, "knowledge-base", `${category}.json`);
      const raw = await fs.readFile(projectPath, "utf-8");
      const file: KBFile = JSON.parse(raw);
      // Project entries first (dedup by id)
      const globalIds = new Set(entries.map((e) => e.id));
      entries.unshift(...file.entries.filter((e) => !globalIds.has(e.id)));
    } catch { /* no project KB file */ }
  }

  return entries;
}

// ── Input Complexity Analysis ────────────────────────────

function analyzeInputComplexity(input: string, steps: WorkflowStep[], projectId?: string | null): SimulationReport["inputAnalysis"] {
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

  // Cross-project detection
  if (projectId && projectId !== "mission-control") {
    factors.push(`Cross-project: targeting ${projectId}`);
  }

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
  projectId?: string | null,
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

  let probability = 62; // Base probability for unknown agents
  //   Anchored to observed pipeline completion rate (30/110 = 27.3% full-pipeline)
  //   but individual stages complete more often than full pipelines, so 62 is the
  //   cross-agent mean of calibrated effective rates (see Factor 1 below).

  // Factor 1: Historical success rate — calibrated (strongest signal)
  // Raw successRate excludes "stopped" runs from both numerator and denominator,
  // causing systematic undercount. We treat stopped runs as 40% partial credit
  // (they represent work done but pipeline cancelled, not agent failure).
  // Formula: effectiveRate = (successes + 0.4 * stopped) / totalRuns * 100
  // Derived from analytics: successRate = successes/completedRuns*100, so we
  // back-calculate: successes = successRate/100 * runs, failures = failRate/100 * runs,
  // stopped = runs - successes - failures.
  if (stats && stats.runs >= 3) {
    const successes = (stats.successRate / 100) * stats.runs;
    const failures  = (stats.failRate  / 100) * stats.runs;
    const stopped   = Math.max(0, stats.runs - successes - failures);
    const effectiveRate = ((successes + stopped * 0.4) / stats.runs) * 100;
    // Blend 80% calibrated historical rate + 20% base to avoid cold-start extremes
    probability = effectiveRate * 0.80 + 62 * 0.20;
  }

  // Factor 2: KB failure pattern penalty (weighted by confidence)
  for (const f of matchingFailures) {
    const confidence = f.confidence ?? 1.0;
    const penalty = f.severity === "critical" ? 5 : f.severity === "high" ? 3 : 1;
    probability -= penalty * confidence;
  }

  // Factor 3: KB success pattern bonus (weighted by confidence)
  for (const s of matchingSuccesses) {
    const confidence = s.confidence ?? 1.0;
    probability += 5 * confidence;
  }

  // Factor 4: Complexity penalty
  if (inputComplexity.complexityScore === "complex") probability -= 5;
  if (inputComplexity.complexityScore === "very_complex") probability -= 12;

  // Factor 5: Dynamic constraints bonus (KB-driven guardrails = higher safety)
  probability += dynamicConstraintCount * 2; // Each KB constraint = +2% (protection)

  // Factor 6: Low run count = uncertainty penalty
  if (stats && stats.runs < 5) probability -= 8;

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
  const criticalFailureCount = matchingFailures.filter((f) => f.severity === "critical").length;
  if (criticalFailureCount > 0) {
    recommendations.push(`${criticalFailureCount} critical KB patterns active — review before run`);
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

  // Cross-project: warn implementation stages about directory targeting
  const isImplementationStage = ["s5-backend", "s6-designer", "s7-frontend"].includes(step.id);
  if (isImplementationStage && projectId && projectId !== "mission-control") {
    recommendations.push(`Verify project context is loaded for ${projectId}`);

    // Boost probability if project context was injected (replanBonus or [PROJECT CONTEXT] in prompt)
    const hasProjectContext =
      typeof replanBonus === "number" ||
      (typeof step.promptTemplate === "string" && step.promptTemplate.includes("[PROJECT CONTEXT]"));
    if (hasProjectContext) {
      probability = Math.round(Math.max(5, Math.min(98, probability + 5)));
      // Recalculate risk level after boost
      if (probability >= 80) riskLevel = "low";
      else if (probability >= 60) riskLevel = "medium";
      else if (probability >= 40) riskLevel = "high";
      else riskLevel = "critical";
    }
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
  projectId?: string | null,
): Promise<SimulationReport> {
  // Load all data sources in parallel
  const [analytics, failurePatterns, successPatterns] = await Promise.all([
    loadAnalytics(),
    loadKBCategory("failure-patterns", projectId),
    loadKBCategory("success-patterns", projectId),
  ]);

  const inputAnalysis = analyzeInputComplexity(input, steps, projectId);

  // Simulate each stage
  const stages = steps.map((step) =>
    simulateStage(step, analytics, failurePatterns, successPatterns, inputAnalysis, projectId),
  );

  // Overall probability: calibrated weighted approach
  // Weights derived from real pipeline analytics (110 runs, 30 completed = 27.3% full-pipeline rate).
  // Individual stage rates are higher than full-pipeline rate because pipelines fail when ANY
  // stage fails — so overall must be pulled toward the weakest links, not the average.
  //
  // - Weighted average of per-stage probabilities (45%) — general health signal
  // - Bottom-3 average as floor anchor (40%) — pipeline fails at its weakest point;
  //   heavier weight here is the primary correction for the previous 21% overestimate
  // - Risk-adjusted penalty (15%) — discounts for confirmed critical/high-risk stages
  const criticalStages = stages.filter((s) => s.riskLevel === "critical");
  const highRiskStages = stages.filter((s) => s.riskLevel === "high");
  const avgProbability = stages.reduce((sum, s) => sum + s.successProbability, 0) / stages.length;
  const sorted = [...stages].sort((a, b) => a.successProbability - b.successProbability);
  const bottom3Count = Math.min(3, stages.length);
  const bottom3Avg = sorted.slice(0, bottom3Count).reduce((sum, s) => sum + s.successProbability, 0) / bottom3Count;
  // Penalty term: starts at 100, deduct 12 per critical stage and 5 per high-risk stage
  // (previously 10/3 — too lenient; raised to match observed failure impact)
  const riskPenaltyTerm = Math.max(0, 100 - criticalStages.length * 12 - highRiskStages.length * 5);

  let overallProbability = Math.round(
    avgProbability * 0.45 +
    bottom3Avg    * 0.40 +
    riskPenaltyTerm * 0.15,
  );
  // Soft cap: many critical stages limit ceiling
  if (criticalStages.length >= 5) overallProbability = Math.min(overallProbability, 40);
  else if (criticalStages.length >= 3) overallProbability = Math.min(overallProbability, 50);
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
