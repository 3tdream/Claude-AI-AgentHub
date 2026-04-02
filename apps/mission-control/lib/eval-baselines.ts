/**
 * Eval Baselines — Track pipeline quality over time.
 *
 * Stores per-template baseline scores. Compares run N vs N-1.
 * Detects quality regression or improvement.
 *
 * Storage: data/eval-baselines.json
 */

import { promises as fs } from "fs";
import path from "path";
import type { PipelineExecution, QualityScore } from "@/types";

const BASELINES_FILE = path.join(process.cwd(), "data", "eval-baselines.json");
const MAX_HISTORY = 20; // Keep last 20 runs per template

// ── Types ───────────────────────────────────────────────────

interface RunSnapshot {
  runId: string;
  timestamp: string;
  status: string;
  overallScore: number;
  stageScores: Record<string, number>;
  tokenUsage: { totalInput: number; totalOutput: number };
  duration: number;
  stagesCompleted: number;
  stagesTotal: number;
  modelUsed: Record<string, string>; // stepId → model
}

interface TemplateBaseline {
  templateName: string;
  lastUpdated: string;
  runs: RunSnapshot[];
  bestScore: number;
  bestRunId: string;
  avgScore: number;
  trend: "improving" | "stable" | "regressing";
}

interface BaselineStore {
  templates: Record<string, TemplateBaseline>;
  lastUpdated: string;
}

export interface RunComparison {
  currentRun: RunSnapshot;
  previousRun: RunSnapshot | null;
  delta: {
    overallScore: number;
    tokenUsage: number;
    duration: number;
    stagesCompleted: number;
  };
  regressions: Array<{ stageId: string; prev: number; curr: number; delta: number }>;
  improvements: Array<{ stageId: string; prev: number; curr: number; delta: number }>;
  trend: "improving" | "stable" | "regressing";
  isNewBest: boolean;
}

// ── Helpers ─────────────────────────────────────────────────

async function loadStore(): Promise<BaselineStore> {
  try {
    const raw = await fs.readFile(BASELINES_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { templates: {}, lastUpdated: new Date().toISOString() };
  }
}

async function saveStore(store: BaselineStore): Promise<void> {
  await fs.mkdir(path.dirname(BASELINES_FILE), { recursive: true });
  store.lastUpdated = new Date().toISOString();
  await fs.writeFile(BASELINES_FILE, JSON.stringify(store, null, 2), "utf-8");
}

function computeOverallScore(qualityScores: Record<string, QualityScore>): number {
  const scores = Object.values(qualityScores).map((s) => s.overall);
  if (scores.length === 0) return 0;
  return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
}

function computeTrend(runs: RunSnapshot[]): "improving" | "stable" | "regressing" {
  if (runs.length < 3) return "stable";
  const recent = runs.slice(-3).map((r) => r.overallScore);
  const diffs = recent.slice(1).map((s, i) => s - recent[i]);
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  if (avgDiff > 0.3) return "improving";
  if (avgDiff < -0.3) return "regressing";
  return "stable";
}

// ── Core: Record a pipeline run ─────────────────────────────

export async function recordBaseline(execution: PipelineExecution): Promise<RunComparison> {
  const store = await loadStore();
  const templateName = execution.workflowName || "unknown";

  // Build snapshot
  const stageScores: Record<string, number> = {};
  const modelUsed: Record<string, string> = {};
  let totalInput = 0;
  let totalOutput = 0;
  let stagesCompleted = 0;

  for (const [stepId, result] of Object.entries(execution.stepResults)) {
    if (result.status === "completed") stagesCompleted++;
    if (execution.qualityScores?.[stepId]) {
      stageScores[stepId] = execution.qualityScores[stepId].overall;
    }
    if (execution.tokenUsage?.[stepId]) {
      totalInput += execution.tokenUsage[stepId].input;
      totalOutput += execution.tokenUsage[stepId].output;
      modelUsed[stepId] = execution.tokenUsage[stepId].model;
    }
  }

  const snapshot: RunSnapshot = {
    runId: execution.id,
    timestamp: execution.completedAt || new Date().toISOString(),
    status: execution.status,
    overallScore: computeOverallScore(execution.qualityScores || {}),
    stageScores,
    tokenUsage: { totalInput, totalOutput },
    duration: execution.totalDuration || 0,
    stagesCompleted,
    stagesTotal: Object.keys(execution.stepResults).length,
    modelUsed,
  };

  // Get or create template baseline
  if (!store.templates[templateName]) {
    store.templates[templateName] = {
      templateName,
      lastUpdated: new Date().toISOString(),
      runs: [],
      bestScore: 0,
      bestRunId: "",
      avgScore: 0,
      trend: "stable",
    };
  }

  const baseline = store.templates[templateName];
  const previousRun = baseline.runs.length > 0 ? baseline.runs[baseline.runs.length - 1] : null;

  // Add run and trim history
  baseline.runs.push(snapshot);
  if (baseline.runs.length > MAX_HISTORY) {
    baseline.runs = baseline.runs.slice(-MAX_HISTORY);
  }

  // Update stats
  const isNewBest = snapshot.overallScore > baseline.bestScore;
  if (isNewBest) {
    baseline.bestScore = snapshot.overallScore;
    baseline.bestRunId = snapshot.runId;
  }
  baseline.avgScore = Math.round(
    (baseline.runs.reduce((a, r) => a + r.overallScore, 0) / baseline.runs.length) * 10
  ) / 10;
  baseline.trend = computeTrend(baseline.runs);
  baseline.lastUpdated = new Date().toISOString();

  await saveStore(store);

  // Build comparison
  const regressions: RunComparison["regressions"] = [];
  const improvements: RunComparison["improvements"] = [];

  if (previousRun) {
    for (const [stageId, score] of Object.entries(snapshot.stageScores)) {
      const prevScore = previousRun.stageScores[stageId];
      if (prevScore !== undefined) {
        const delta = score - prevScore;
        if (delta < -1) regressions.push({ stageId, prev: prevScore, curr: score, delta });
        if (delta > 1) improvements.push({ stageId, prev: prevScore, curr: score, delta });
      }
    }
  }

  return {
    currentRun: snapshot,
    previousRun,
    delta: {
      overallScore: previousRun ? snapshot.overallScore - previousRun.overallScore : 0,
      tokenUsage: previousRun
        ? (snapshot.tokenUsage.totalInput + snapshot.tokenUsage.totalOutput) -
          (previousRun.tokenUsage.totalInput + previousRun.tokenUsage.totalOutput)
        : 0,
      duration: previousRun ? snapshot.duration - previousRun.duration : 0,
      stagesCompleted: previousRun ? snapshot.stagesCompleted - previousRun.stagesCompleted : 0,
    },
    regressions,
    improvements,
    trend: baseline.trend,
    isNewBest,
  };
}

// ── Query: Get baseline for a template ──────────────────────

export async function getBaseline(templateName: string): Promise<TemplateBaseline | null> {
  const store = await loadStore();
  return store.templates[templateName] || null;
}

export async function getAllBaselines(): Promise<BaselineStore> {
  return loadStore();
}
