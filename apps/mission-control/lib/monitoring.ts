/**
 * Real-time Monitoring Engine
 *
 * Checks health of all MC subsystems:
 * - Agent performance (success rate, score degradation)
 * - KB integrity (hash validation, stale entries)
 * - Pipeline health (recent run success rate, stuck runs)
 * - External dependencies (Agent Hub connectivity)
 *
 * Generates alerts when thresholds are crossed.
 */

import { promises as fs } from "fs";
import path from "path";
import { validateAll } from "@/lib/kb-storage";
import type { KBIndex } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");

// ── Types ────────────────────────────────────────────

export type AlertSeverity = "critical" | "warning" | "info";
export type AlertStatus = "active" | "resolved";
export type SubsystemId = "agents" | "kb" | "pipeline" | "dependencies";

export interface HealthAlert {
  id: string;
  subsystem: SubsystemId;
  severity: AlertSeverity;
  title: string;
  detail: string;
  metric?: { name: string; value: number; threshold: number };
  status: AlertStatus;
  firstSeen: string;
  lastSeen: string;
}

export interface SubsystemHealth {
  id: SubsystemId;
  label: string;
  status: "healthy" | "degraded" | "down";
  score: number; // 0-100
  alerts: HealthAlert[];
  metrics: { label: string; value: string; status: "ok" | "warn" | "error" }[];
  lastChecked: string;
}

export interface SystemHealthReport {
  overall: "healthy" | "degraded" | "down";
  overallScore: number;
  subsystems: SubsystemHealth[];
  activeAlerts: number;
  criticalAlerts: number;
  checkedAt: string;
}

// ── Data Loaders ─────────────────────────────────────

interface PipelineAnalytics {
  totalRuns: number;
  byStatus: Record<string, number>;
  agentStats: Record<string, {
    runs: number;
    avgScore: number;
    successRate: number;
    failRate: number;
    avgTokens: number;
    avgDuration: number;
  }>;
  lastUpdated: string;
}

async function loadAnalytics(): Promise<PipelineAnalytics | null> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "pipeline-analytics.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function countRecentRuns(hours: number): Promise<{ total: number; failed: number; completed: number }> {
  try {
    const runsDir = path.join(DATA_DIR, "pipeline-runs");
    const files = await fs.readdir(runsDir);
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    let total = 0, failed = 0, completed = 0;

    // Check last 20 files by name (most recent)
    const recent = files.filter(f => f.endsWith(".json")).slice(-20);
    for (const file of recent) {
      try {
        const raw = await fs.readFile(path.join(runsDir, file), "utf-8");
        const run = JSON.parse(raw);
        if (new Date(run.startedAt).getTime() > cutoff) {
          total++;
          if (run.status === "failed") failed++;
          if (run.status === "completed") completed++;
        }
      } catch { /* skip corrupt files */ }
    }
    return { total, failed, completed };
  } catch {
    return { total: 0, failed: 0, completed: 0 };
  }
}

// ── Threshold Logic ──────────────────────────────────

/**
 * Derives a status label from a numeric health score using the canonical
 * three-band threshold:
 *   score <  50  → "down"
 *   score 50–80  → "degraded"
 *   score >  80  → "healthy"
 *
 * This is the single source of truth for score→status mapping and is used
 * both for per-subsystem status and for the overall system status so that
 * the two are always consistent.
 */
export function scoreToStatus(score: number): SubsystemHealth["status"] {
  if (score < 50) return "down";
  if (score <= 80) return "degraded";
  return "healthy";
}

/**
 * Merges an alert-derived status with the score-derived status, taking the
 * *worse* of the two.  This prevents a subsystem with a healthy score (e.g.
 * 73) from being labelled "down" purely because of a transient critical alert,
 * while still allowing alerts to push a status *down* when the score agrees.
 *
 * Severity order: healthy < degraded < down
 */
function worstStatus(
  alertStatus: SubsystemHealth["status"],
  score: number,
): SubsystemHealth["status"] {
  const order: Record<SubsystemHealth["status"], number> = { healthy: 0, degraded: 1, down: 2 };
  const fromScore = scoreToStatus(score);
  return order[alertStatus] > order[fromScore] ? alertStatus : fromScore;
}

// ── Health Checks ────────────────────────────────────

async function checkAgentHealth(analytics: PipelineAnalytics | null): Promise<SubsystemHealth> {
  const alerts: HealthAlert[] = [];
  const metrics: SubsystemHealth["metrics"] = [];
  const now = new Date().toISOString();

  if (!analytics) {
    return {
      id: "agents", label: "Agent Performance", status: "down", score: 0,
      alerts: [{ id: "no-analytics", subsystem: "agents", severity: "warning", title: "No analytics data", detail: "pipeline-analytics.json not found", status: "active", firstSeen: now, lastSeen: now }],
      metrics: [{ label: "Status", value: "No data", status: "warn" }],
      lastChecked: now,
    };
  }

  let degradedCount = 0;
  let criticalCount = 0;
  const agents = Object.entries(analytics.agentStats);

  for (const [agentId, stats] of agents) {
    if (stats.runs < 3) continue; // Not enough data

    // Alert: success rate below 30% = critical
    if (stats.successRate < 30) {
      criticalCount++;
      alerts.push({
        id: `agent-critical-${agentId}`,
        subsystem: "agents",
        severity: "critical",
        title: `${agentId}: ${Math.round(stats.successRate)}% success rate`,
        detail: `${stats.runs} runs, avg score ${stats.avgScore.toFixed(1)}, fail rate ${Math.round(stats.failRate)}%`,
        metric: { name: "successRate", value: stats.successRate, threshold: 30 },
        status: "active",
        firstSeen: now,
        lastSeen: now,
      });
    }
    // Alert: success rate below 50% = warning
    else if (stats.successRate < 50) {
      degradedCount++;
      alerts.push({
        id: `agent-degraded-${agentId}`,
        subsystem: "agents",
        severity: "warning",
        title: `${agentId}: ${Math.round(stats.successRate)}% success rate`,
        detail: `${stats.runs} runs, avg score ${stats.avgScore.toFixed(1)}`,
        metric: { name: "successRate", value: stats.successRate, threshold: 50 },
        status: "active",
        firstSeen: now,
        lastSeen: now,
      });
    }

    // Alert: abnormal token usage (>80K avg)
    if (stats.avgTokens > 80000) {
      alerts.push({
        id: `agent-tokens-${agentId}`,
        subsystem: "agents",
        severity: "warning",
        title: `${agentId}: high token usage (${Math.round(stats.avgTokens / 1000)}K avg)`,
        detail: "Truncation risk. Consider splitting output.",
        metric: { name: "avgTokens", value: stats.avgTokens, threshold: 80000 },
        status: "active",
        firstSeen: now,
        lastSeen: now,
      });
    }
  }

  const totalAgents = agents.filter(([, s]) => s.runs >= 3).length;
  const healthyAgents = totalAgents - degradedCount - criticalCount;
  const score = totalAgents > 0 ? Math.round((healthyAgents / totalAgents) * 100) : 0;

  metrics.push(
    { label: "Agents tracked", value: String(totalAgents), status: "ok" },
    { label: "Healthy", value: String(healthyAgents), status: healthyAgents > 0 ? "ok" : "error" },
    { label: "Degraded", value: String(degradedCount), status: degradedCount > 0 ? "warn" : "ok" },
    { label: "Critical", value: String(criticalCount), status: criticalCount > 0 ? "error" : "ok" },
    { label: "Total runs", value: String(analytics.totalRuns), status: "ok" },
  );

  const alertStatus: SubsystemHealth["status"] =
    criticalCount > 0 ? "down" : degradedCount > 0 ? "degraded" : "healthy";

  return {
    id: "agents",
    label: "Agent Performance",
    status: worstStatus(alertStatus, score),
    score,
    alerts,
    metrics,
    lastChecked: now,
  };
}

async function checkKBHealth(): Promise<SubsystemHealth> {
  const alerts: HealthAlert[] = [];
  const metrics: SubsystemHealth["metrics"] = [];
  const now = new Date().toISOString();

  let kbIndex: KBIndex;
  try {
    kbIndex = await validateAll();
  } catch {
    return {
      id: "kb", label: "Knowledge Base", status: "down", score: 0,
      alerts: [{ id: "kb-unavailable", subsystem: "kb", severity: "critical", title: "KB unavailable", detail: "Could not read knowledge base files", status: "active", firstSeen: now, lastSeen: now }],
      metrics: [{ label: "Status", value: "Unavailable", status: "error" }],
      lastChecked: now,
    };
  }

  // Integrity check
  if (!kbIndex.integrityOk) {
    alerts.push({
      id: "kb-integrity", subsystem: "kb", severity: "critical",
      title: "KB integrity violation", detail: "One or more KB files have mismatched hashes",
      status: "active", firstSeen: now, lastSeen: now,
    });
  }

  // Stale check
  const staleCategories = kbIndex.categories.filter((c) => c.stale);
  if (staleCategories.length > 0) {
    alerts.push({
      id: "kb-stale", subsystem: "kb", severity: "warning",
      title: `${staleCategories.length} stale KB categories`,
      detail: staleCategories.map((c) => c.category).join(", "),
      status: "active", firstSeen: now, lastSeen: now,
    });
  }

  const score = kbIndex.integrityOk
    ? staleCategories.length === 0 ? 100 : Math.round(((kbIndex.categories.length - staleCategories.length) / kbIndex.categories.length) * 100)
    : 20;

  metrics.push(
    { label: "Categories", value: String(kbIndex.categories.length), status: "ok" },
    { label: "Total entries", value: String(kbIndex.totalEntries), status: kbIndex.totalEntries > 0 ? "ok" : "warn" },
    { label: "Integrity", value: kbIndex.integrityOk ? "OK" : "FAIL", status: kbIndex.integrityOk ? "ok" : "error" },
    { label: "Stale", value: String(staleCategories.length), status: staleCategories.length > 0 ? "warn" : "ok" },
  );

  const alertStatus: SubsystemHealth["status"] =
    !kbIndex.integrityOk ? "down" : staleCategories.length > 0 ? "degraded" : "healthy";

  return {
    id: "kb",
    label: "Knowledge Base",
    status: worstStatus(alertStatus, score),
    score,
    alerts,
    metrics,
    lastChecked: now,
  };
}

async function checkPipelineHealth(analytics: PipelineAnalytics | null): Promise<SubsystemHealth> {
  const alerts: HealthAlert[] = [];
  const metrics: SubsystemHealth["metrics"] = [];
  const now = new Date().toISOString();

  const recent = await countRecentRuns(24);
  const overallSuccessRate = analytics
    ? Math.round((analytics.byStatus.completed || 0) / analytics.totalRuns * 100)
    : 0;

  if (recent.total > 0 && recent.failed / recent.total > 0.5) {
    alerts.push({
      id: "pipeline-high-failure", subsystem: "pipeline", severity: "critical",
      title: `${recent.failed}/${recent.total} recent runs failed (24h)`,
      detail: "More than 50% of recent pipeline runs are failing",
      metric: { name: "recentFailRate", value: recent.failed / recent.total * 100, threshold: 50 },
      status: "active", firstSeen: now, lastSeen: now,
    });
  }

  // Check for stuck runs (paused > 50%)
  const pausedRate = analytics ? ((analytics.byStatus.paused || 0) / analytics.totalRuns * 100) : 0;
  if (pausedRate > 40) {
    alerts.push({
      id: "pipeline-stuck", subsystem: "pipeline", severity: "warning",
      title: `${Math.round(pausedRate)}% of all runs are paused`,
      detail: "High pause rate may indicate checkpoint bottleneck or manual intervention needed",
      metric: { name: "pausedRate", value: pausedRate, threshold: 40 },
      status: "active", firstSeen: now, lastSeen: now,
    });
  }

  const score = alerts.some(a => a.severity === "critical") ? 30
    : alerts.length > 0 ? 60 : 90;

  metrics.push(
    { label: "Total runs", value: String(analytics?.totalRuns || 0), status: "ok" },
    { label: "Success rate", value: `${overallSuccessRate}%`, status: overallSuccessRate >= 50 ? "ok" : overallSuccessRate >= 30 ? "warn" : "error" },
    { label: "Recent (24h)", value: `${recent.completed}/${recent.total} passed`, status: recent.failed === 0 ? "ok" : "warn" },
    { label: "Paused", value: `${Math.round(pausedRate)}%`, status: pausedRate < 40 ? "ok" : "warn" },
  );

  const alertStatus: SubsystemHealth["status"] =
    alerts.some(a => a.severity === "critical") ? "down" : alerts.length > 0 ? "degraded" : "healthy";

  return {
    id: "pipeline",
    label: "Pipeline Health",
    status: worstStatus(alertStatus, score),
    score,
    alerts,
    metrics,
    lastChecked: now,
  };
}

async function checkDependencies(): Promise<SubsystemHealth> {
  const alerts: HealthAlert[] = [];
  const metrics: SubsystemHealth["metrics"] = [];
  const now = new Date().toISOString();

  // Check Agent Hub
  const agentHubLive = process.env.AGENT_HUB_LIVE === "1";
  const agentHubUrl = process.env.AGENT_HUB_API_URL || "";
  metrics.push({
    label: "Agent Hub",
    value: agentHubLive ? "Live" : "Offline",
    status: agentHubLive ? "ok" : "warn",
  });
  if (!agentHubLive) {
    alerts.push({
      id: "dep-agent-hub", subsystem: "dependencies", severity: "info",
      title: "Agent Hub offline mode", detail: "AGENT_HUB_LIVE not set — using cached data",
      status: "active", firstSeen: now, lastSeen: now,
    });
  }

  // Check OpenAI key
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  metrics.push({
    label: "OpenAI fallback",
    value: hasOpenAI ? "Configured" : "Missing",
    status: hasOpenAI ? "ok" : "warn",
  });

  // Check KB files exist
  const kbDir = path.join(DATA_DIR, "knowledge-base");
  let kbFileCount = 0;
  try {
    const files = await fs.readdir(kbDir);
    kbFileCount = files.filter(f => f.endsWith(".json") && !f.startsWith("_")).length;
  } catch { /* dir missing */ }
  metrics.push({
    label: "KB files",
    value: String(kbFileCount),
    status: kbFileCount >= 5 ? "ok" : kbFileCount > 0 ? "warn" : "error",
  });

  // Check pipeline-analytics.json freshness
  try {
    const stat = await fs.stat(path.join(DATA_DIR, "pipeline-analytics.json"));
    const ageHours = (Date.now() - stat.mtimeMs) / (60 * 60 * 1000);
    metrics.push({
      label: "Analytics age",
      value: ageHours < 1 ? "< 1h" : `${Math.round(ageHours)}h`,
      status: ageHours < 24 ? "ok" : "warn",
    });
    if (ageHours > 48) {
      alerts.push({
        id: "dep-analytics-stale", subsystem: "dependencies", severity: "warning",
        title: "Analytics data stale", detail: `Last updated ${Math.round(ageHours)}h ago`,
        status: "active", firstSeen: now, lastSeen: now,
      });
    }
  } catch {
    metrics.push({ label: "Analytics", value: "Missing", status: "error" });
  }

  const score = alerts.filter(a => a.severity !== "info").length === 0 ? 100
    : alerts.some(a => a.severity === "critical") ? 30 : 70;

  const alertStatus: SubsystemHealth["status"] =
    alerts.some(a => a.severity === "critical") ? "down"
    : alerts.some(a => a.severity === "warning") ? "degraded"
    : "healthy";

  return {
    id: "dependencies",
    label: "Dependencies",
    status: worstStatus(alertStatus, score),
    score,
    alerts,
    metrics,
    lastChecked: now,
  };
}

// ── Main Health Check ────────────────────────────────

export async function runHealthCheck(): Promise<SystemHealthReport> {
  const analytics = await loadAnalytics();

  const subsystems = await Promise.all([
    checkAgentHealth(analytics),
    checkKBHealth(),
    checkPipelineHealth(analytics),
    checkDependencies(),
  ]);

  const allAlerts = subsystems.flatMap(s => s.alerts);
  const activeAlerts = allAlerts.filter(a => a.status === "active").length;
  const criticalAlerts = allAlerts.filter(a => a.severity === "critical").length;

  const overallScore = Math.round(subsystems.reduce((sum, s) => sum + s.score, 0) / subsystems.length);
  // Canonical thresholds (scoreToStatus): score < 50 → down | 50–80 → degraded | > 80 → healthy
  const overall: SystemHealthReport["overall"] = scoreToStatus(overallScore);

  return {
    overall,
    overallScore,
    subsystems,
    activeAlerts,
    criticalAlerts,
    checkedAt: new Date().toISOString(),
  };
}
