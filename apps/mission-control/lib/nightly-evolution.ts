/**
 * Nightly Evolution Engine
 *
 * Automated self-improvement cycle:
 * 1. Scan recent pipeline runs for new patterns
 * 2. Extract failure/success patterns → write to KB
 * 3. Calibrate simulation accuracy (predicted vs actual)
 * 4. Detect agent degradation trends
 * 5. Generate evolution report
 *
 * Can be triggered manually or via cron.
 */

import { promises as fs } from "fs";
import path from "path";
import { addEntry, readKBFile, searchKB } from "@/lib/kb-storage";
import { runHealthCheck } from "@/lib/monitoring";
import type { KBEntry } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const RUNS_DIR = path.join(DATA_DIR, "pipeline-runs");

// ── Types ────────────────────────────────────────────

interface PipelineRun {
  id: string;
  workflowName: string;
  input: string;
  mode: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalDuration?: number;
  totalTokens?: { input: number; output: number };
  agents?: {
    agentId: string;
    agentName: string;
    stepId: string;
    status: string;
    score?: number;
    tokens?: { input: number; output: number };
    duration?: number;
    error?: string;
  }[];
}

interface EvolutionFinding {
  category: "failure-patterns" | "success-patterns";
  title: string;
  content: string;
  source: string;
  agentId?: string;
  severity: "critical" | "high" | "medium" | "low";
  tags: string[];
  pipelineRunId: string;
}

interface SimulationCalibration {
  runsAnalyzed: number;
  avgPredictedSuccess: number;
  actualSuccessRate: number;
  calibrationError: number; // abs(predicted - actual)
  recommendation: string;
}

interface DegradationAlert {
  agentId: string;
  metric: string;
  trend: "declining" | "stable" | "improving";
  recentValue: number;
  historicalValue: number;
  delta: number;
}

export interface EvolutionReport {
  /** When this evolution ran */
  runAt: string;
  /** Pipeline runs analyzed */
  runsAnalyzed: number;
  /** Time window (hours) */
  windowHours: number;
  /** New KB entries created */
  newEntries: { category: string; title: string; id: string }[];
  /** Duplicate findings (already in KB) */
  duplicatesSkipped: number;
  /** Simulation calibration */
  calibration: SimulationCalibration;
  /** Agent degradation alerts */
  degradationAlerts: DegradationAlert[];
  /** Health snapshot at time of evolution */
  healthScore: number;
  /** Summary for human review */
  summary: string;
}

// ── Run Loader ───────────────────────────────────────

async function loadRecentRuns(hours: number): Promise<PipelineRun[]> {
  const cutoff = Date.now() - hours * 60 * 60 * 1000;
  const runs: PipelineRun[] = [];

  try {
    const files = await fs.readdir(RUNS_DIR);
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      try {
        const raw = await fs.readFile(path.join(RUNS_DIR, file), "utf-8");
        const run = JSON.parse(raw) as PipelineRun;
        if (new Date(run.startedAt).getTime() > cutoff) {
          runs.push(run);
        }
      } catch { /* skip corrupt */ }
    }
  } catch { /* dir missing */ }

  return runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
}

async function loadAllRuns(): Promise<PipelineRun[]> {
  const runs: PipelineRun[] = [];
  try {
    const files = await fs.readdir(RUNS_DIR);
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      try {
        const raw = await fs.readFile(path.join(RUNS_DIR, file), "utf-8");
        runs.push(JSON.parse(raw) as PipelineRun);
      } catch { /* skip */ }
    }
  } catch { /* dir missing */ }
  return runs;
}

// ── Pattern Extraction ───────────────────────────────

function extractFailurePatterns(runs: PipelineRun[]): EvolutionFinding[] {
  const findings: EvolutionFinding[] = [];
  const failedRuns = runs.filter((r) => r.status === "failed");

  // Pattern: agent-specific failures
  const agentFailCounts: Record<string, { count: number; errors: string[]; runIds: string[] }> = {};

  for (const run of failedRuns) {
    if (!run.agents) continue;
    for (const agent of run.agents) {
      if (agent.status === "failed") {
        if (!agentFailCounts[agent.agentId]) {
          agentFailCounts[agent.agentId] = { count: 0, errors: [], runIds: [] };
        }
        agentFailCounts[agent.agentId].count++;
        if (agent.error) agentFailCounts[agent.agentId].errors.push(agent.error.slice(0, 100));
        agentFailCounts[agent.agentId].runIds.push(run.id);
      }
    }
  }

  // Generate findings for agents that failed 2+ times
  for (const [agentId, data] of Object.entries(agentFailCounts)) {
    if (data.count < 2) continue;
    const uniqueErrors = [...new Set(data.errors)];
    findings.push({
      category: "failure-patterns",
      title: `${agentId} failed ${data.count}x in recent runs`,
      content: `Agent ${agentId} failed in ${data.count} recent pipeline runs. ${uniqueErrors.length > 0 ? `Common errors: ${uniqueErrors.slice(0, 3).join("; ")}` : "No error details captured."}. Run IDs: ${data.runIds.slice(0, 3).join(", ")}`,
      source: "nightly-evolution",
      agentId,
      severity: data.count >= 5 ? "critical" : data.count >= 3 ? "high" : "medium",
      tags: ["auto-detected", "recurring-failure", agentId.replace("-agent", "")],
      pipelineRunId: data.runIds[0],
    });
  }

  // Pattern: high pause rate (possible checkpoint bottleneck)
  const pausedRuns = runs.filter((r) => r.status === "paused");
  if (pausedRuns.length > runs.length * 0.4 && runs.length >= 5) {
    findings.push({
      category: "failure-patterns",
      title: `High pause rate: ${pausedRuns.length}/${runs.length} runs paused`,
      content: `${Math.round(pausedRuns.length / runs.length * 100)}% of recent runs are in paused state. This may indicate checkpoint bottleneck or missing user approval. Consider auto-approve for low-risk stages.`,
      source: "nightly-evolution",
      severity: "medium",
      tags: ["auto-detected", "pause-rate", "checkpoint"],
      pipelineRunId: pausedRuns[0]?.id || "",
    });
  }

  return findings;
}

function extractSuccessPatterns(runs: PipelineRun[]): EvolutionFinding[] {
  const findings: EvolutionFinding[] = [];
  const completedRuns = runs.filter((r) => r.status === "completed");

  // Pattern: agents that consistently score 9+
  const agentHighScores: Record<string, { scores: number[]; runIds: string[] }> = {};

  for (const run of completedRuns) {
    if (!run.agents) continue;
    for (const agent of run.agents) {
      if (agent.score && agent.score >= 9) {
        if (!agentHighScores[agent.agentId]) {
          agentHighScores[agent.agentId] = { scores: [], runIds: [] };
        }
        agentHighScores[agent.agentId].scores.push(agent.score);
        agentHighScores[agent.agentId].runIds.push(run.id);
      }
    }
  }

  for (const [agentId, data] of Object.entries(agentHighScores)) {
    if (data.scores.length < 2) continue;
    const avg = data.scores.reduce((s, v) => s + v, 0) / data.scores.length;
    findings.push({
      category: "success-patterns",
      title: `${agentId} consistently scores ${avg.toFixed(1)}/10`,
      content: `Agent ${agentId} scored 9+ in ${data.scores.length} recent completed runs. Average: ${avg.toFixed(1)}. This agent's prompt and configuration are working well.`,
      source: "nightly-evolution",
      agentId,
      severity: "medium",
      tags: ["auto-detected", "consistent-success", agentId.replace("-agent", "")],
      pipelineRunId: data.runIds[0],
    });
  }

  // Pattern: fast completions (under 60s)
  const fastRuns = completedRuns.filter((r) => r.totalDuration && r.totalDuration < 60000);
  if (fastRuns.length >= 3) {
    findings.push({
      category: "success-patterns",
      title: `${fastRuns.length} runs completed in under 60s`,
      content: `Quick mode or cached runs completing efficiently. Average duration: ${Math.round(fastRuns.reduce((s, r) => s + (r.totalDuration || 0), 0) / fastRuns.length / 1000)}s. These represent optimal pipeline execution patterns.`,
      source: "nightly-evolution",
      severity: "low",
      tags: ["auto-detected", "fast-execution", "efficiency"],
      pipelineRunId: fastRuns[0].id,
    });
  }

  return findings;
}

// ── Deduplication ────────────────────────────────────

async function isDuplicate(finding: EvolutionFinding): Promise<boolean> {
  // Search KB for similar entries
  const keywords = finding.title.split(/\s+/).slice(0, 3).join(" ");
  const existing = await searchKB(keywords, [finding.category]);
  // Check if any existing entry has same agent + similar title
  return existing.some(
    (e) => e.agentId === finding.agentId && e.title.includes(finding.agentId || "___no_match___"),
  );
}

// ── Degradation Detection ────────────────────────────

function detectDegradation(allRuns: PipelineRun[]): DegradationAlert[] {
  const alerts: DegradationAlert[] = [];

  // Split runs into recent (last 20) and historical (before that)
  const sorted = [...allRuns].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  const recent = sorted.slice(0, 20);
  const historical = sorted.slice(20);

  if (historical.length < 10) return alerts; // Not enough data

  // Compare per-agent success rates
  const agentRecent: Record<string, { passed: number; total: number }> = {};
  const agentHistorical: Record<string, { passed: number; total: number }> = {};

  for (const run of recent) {
    for (const agent of run.agents || []) {
      if (!agentRecent[agent.agentId]) agentRecent[agent.agentId] = { passed: 0, total: 0 };
      agentRecent[agent.agentId].total++;
      if (agent.status === "completed") agentRecent[agent.agentId].passed++;
    }
  }

  for (const run of historical) {
    for (const agent of run.agents || []) {
      if (!agentHistorical[agent.agentId]) agentHistorical[agent.agentId] = { passed: 0, total: 0 };
      agentHistorical[agent.agentId].total++;
      if (agent.status === "completed") agentHistorical[agent.agentId].passed++;
    }
  }

  for (const agentId of Object.keys(agentRecent)) {
    const r = agentRecent[agentId];
    const h = agentHistorical[agentId];
    if (!h || h.total < 5 || r.total < 3) continue;

    const recentRate = (r.passed / r.total) * 100;
    const historicalRate = (h.passed / h.total) * 100;
    const delta = recentRate - historicalRate;

    if (Math.abs(delta) > 10) {
      alerts.push({
        agentId,
        metric: "successRate",
        trend: delta < -10 ? "declining" : delta > 10 ? "improving" : "stable",
        recentValue: Math.round(recentRate),
        historicalValue: Math.round(historicalRate),
        delta: Math.round(delta),
      });
    }
  }

  return alerts;
}

// ── Simulation Calibration ───────────────────────────

function calibrateSimulation(runs: PipelineRun[]): SimulationCalibration {
  const completed = runs.filter((r) => r.status === "completed").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const total = completed + failed;

  const actualSuccessRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Calculate predicted from agent stats (same formula as simulation)
  const agentSuccessRates = Object.values(
    runs.reduce((acc, r) => {
      for (const a of r.agents || []) {
        if (!acc[a.agentId]) acc[a.agentId] = { pass: 0, total: 0 };
        acc[a.agentId].total++;
        if (a.status === "completed") acc[a.agentId].pass++;
      }
      return acc;
    }, {} as Record<string, { pass: number; total: number }>),
  );

  const avgAgentSuccess = agentSuccessRates.length > 0
    ? Math.round(agentSuccessRates.reduce((s, a) => s + (a.total > 0 ? a.pass / a.total * 100 : 50), 0) / agentSuccessRates.length)
    : 50;

  const avgPredicted = avgAgentSuccess;
  const error = Math.abs(avgPredicted - actualSuccessRate);

  let recommendation: string;
  if (error < 10) recommendation = "Simulation accuracy is good (within 10%). No calibration needed.";
  else if (error < 20) recommendation = `Simulation off by ${error}%. Consider adjusting historical weight factor.`;
  else recommendation = `Simulation significantly off by ${error}%. KB entries may need review — stale patterns could be skewing predictions.`;

  return {
    runsAnalyzed: total,
    avgPredictedSuccess: avgPredicted,
    actualSuccessRate,
    calibrationError: error,
    recommendation,
  };
}

// ── Main Evolution ───────────────────────────────────

export async function runNightlyEvolution(windowHours: number = 168): Promise<EvolutionReport> {
  const recentRuns = await loadRecentRuns(windowHours);
  const allRuns = await loadAllRuns();

  // Extract patterns
  const failureFindings = extractFailurePatterns(recentRuns);
  const successFindings = extractSuccessPatterns(recentRuns);
  const allFindings = [...failureFindings, ...successFindings];

  // Deduplicate and write to KB
  const newEntries: EvolutionReport["newEntries"] = [];
  let duplicatesSkipped = 0;

  for (const finding of allFindings) {
    const isDup = await isDuplicate(finding);
    if (isDup) {
      duplicatesSkipped++;
      continue;
    }

    try {
      const entry = await addEntry(finding.category, {
        title: finding.title,
        content: finding.content,
        source: finding.source,
        agentId: finding.agentId,
        severity: finding.severity,
        tags: finding.tags,
        pipelineRunId: finding.pipelineRunId,
      });
      newEntries.push({ category: finding.category, title: finding.title, id: entry.id });
    } catch { /* skip write errors */ }
  }

  // KB Confidence Decay — reduce weight of unconfirmed patterns
  let decayedCount = 0;
  try {
    const { getAllCategories, readKBFile, writeKBFile } = await import("@/lib/kb-storage");
    const categories = await getAllCategories();
    const now = Date.now();
    const DECAY_THRESHOLD_DAYS = 30; // Start decaying after 30 days unconfirmed
    const DECAY_RATE = 0.05; // -5% per evolution cycle
    const MIN_CONFIDENCE = 0.2; // Don't decay below 20%

    for (const cat of categories) {
      const file = await readKBFile(cat);
      if (!file) continue;
      let modified = false;

      for (const entry of file.entries) {
        // Initialize confidence if missing
        if (entry.confidence === undefined) {
          entry.confidence = 1.0;
          entry.confirmCount = entry.confirmCount || 0;
          modified = true;
        }

        // Decay if not confirmed recently
        const lastConfirmed = entry.lastConfirmedAt ? new Date(entry.lastConfirmedAt).getTime() : new Date(entry.createdAt).getTime();
        const daysSinceConfirm = (now - lastConfirmed) / (1000 * 60 * 60 * 24);

        if (daysSinceConfirm > DECAY_THRESHOLD_DAYS && entry.confidence > MIN_CONFIDENCE) {
          entry.confidence = Math.max(MIN_CONFIDENCE, entry.confidence - DECAY_RATE);
          decayedCount++;
          modified = true;
        }
      }

      if (modified) {
        await writeKBFile(cat, file.description, file.entries);
      }
    }
  } catch { /* KB decay non-blocking */ }

  // Calibrate simulation
  const calibration = calibrateSimulation(recentRuns);

  // Detect degradation
  const degradationAlerts = detectDegradation(allRuns);

  // Health snapshot
  let healthScore = 0;
  try {
    const health = await runHealthCheck();
    healthScore = health.overallScore;
  } catch { /* non-blocking */ }

  // Generate summary
  const summaryParts: string[] = [];
  summaryParts.push(`Analyzed ${recentRuns.length} runs (${windowHours}h window).`);
  if (newEntries.length > 0) summaryParts.push(`Added ${newEntries.length} new KB entries.`);
  if (duplicatesSkipped > 0) summaryParts.push(`Skipped ${duplicatesSkipped} duplicates.`);
  if (degradationAlerts.filter((a) => a.trend === "declining").length > 0) {
    summaryParts.push(`${degradationAlerts.filter((a) => a.trend === "declining").length} agents degrading.`);
  }
  if (degradationAlerts.filter((a) => a.trend === "improving").length > 0) {
    summaryParts.push(`${degradationAlerts.filter((a) => a.trend === "improving").length} agents improving.`);
  }
  if (decayedCount > 0) summaryParts.push(`${decayedCount} KB entries decayed.`);
  summaryParts.push(`Simulation calibration error: ${calibration.calibrationError}%.`);
  summaryParts.push(`System health: ${healthScore}/100.`);

  return {
    runAt: new Date().toISOString(),
    runsAnalyzed: recentRuns.length,
    windowHours,
    newEntries,
    duplicatesSkipped,
    calibration,
    degradationAlerts,
    healthScore,
    summary: summaryParts.join(" "),
  };
}
