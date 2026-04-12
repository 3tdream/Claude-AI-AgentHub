/**
 * Pipeline Analytics Storage — persistent learning database for agents.
 *
 * Saves every pipeline execution with structured analytics:
 * - Per-agent performance (score, tokens, duration, tool calls)
 * - Categorized: failed (0-6.9), needs-work (7-7.9), success (8-10)
 * - Indexed by: agent, mode, score range, task type
 *
 * Agents read this to learn from past runs.
 */

import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const RUNS_DIR = path.join(DATA_DIR, "pipeline-runs");
const ANALYTICS_FILE = path.join(DATA_DIR, "pipeline-analytics.json");
const COUNTER_FILE = path.join(DATA_DIR, "pipeline-counter.json");

// --- Short ID generator (MC-001, MC-002, ...) ---

async function getNextShortId(): Promise<string> {
  let counter = 0;
  try {
    const data = JSON.parse(await fs.readFile(COUNTER_FILE, "utf-8"));
    counter = data.counter || 0;
  } catch { /* first run */ }
  counter++;
  await fs.writeFile(COUNTER_FILE, JSON.stringify({ counter }, null, 2), "utf-8");
  return `MC-${String(counter).padStart(3, "0")}`;
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

// --- Types ---

export interface AgentRunRecord {
  agentId: string;
  agentName: string;
  stepId: string;
  status: string;
  score: number;
  scoreCategory: "failed" | "needs-work" | "success";
  tokens: { input: number; output: number };
  toolCalls: number;
  duration: number; // ms
  model: string;
  hadTools: boolean;
  /** Agent output (truncated to 20K chars) */
  output?: string;
  error?: string;
}

export interface PipelineRunRecord {
  id: string;
  /** Short trackable ID: MC-001, MC-002, ... */
  shortId: string;
  workflowName: string;
  input: string;
  mode: string; // quick | medium | full
  status: string;
  startedAt: string;
  completedAt: string;
  totalDuration: number;
  totalTokens: { input: number; output: number };
  jiraKey?: string;
  /** Project this run belongs to */
  projectId?: string;
  agents: AgentRunRecord[];
  stepOutputs?: Record<string, string>;
  /** Full stepResults for UI (file detection, deploy) */
  stepResults?: Record<string, unknown>;
}

export interface AnalyticsSummary {
  totalRuns: number;
  byMode: Record<string, number>;
  byStatus: Record<string, number>;
  agentStats: Record<string, {
    runs: number;
    avgScore: number;
    avgTokens: number;
    avgDuration: number;
    successRate: number; // % of score >= 8
    failRate: number; // % of score < 7
  }>;
  lastUpdated: string;
}

// --- Score categorization ---

function categorizeScore(score: number): "failed" | "needs-work" | "success" {
  if (score >= 8) return "success";
  if (score >= 7) return "needs-work";
  return "failed";
}

// --- Save pipeline run ---

export async function savePipelineRun(execution: any): Promise<PipelineRunRecord> {
  await ensureDir(RUNS_DIR);

  const agents: AgentRunRecord[] = [];
  let totalInput = 0;
  let totalOutput = 0;

  for (const [stepId, result] of Object.entries(execution.stepResults || {})) {
    const r = result as any;
    if (r.status === "pending") continue;

    const score = execution.qualityScores?.[stepId]?.overall ?? 0;
    const inputTokens = r.inputTokens || 0;
    const outputTokens = r.outputTokens || 0;

    agents.push({
      agentId: r.agentId || stepId.replace(/^s\d+\.?\d*-/, ""),
      agentName: r.agentName || stepId,
      stepId,
      status: r.status,
      score,
      scoreCategory: categorizeScore(score),
      tokens: { input: inputTokens, output: outputTokens },
      toolCalls: r.toolCallCount || 0,
      duration: r.duration || 0,
      model: r.model || "unknown",
      hadTools: (r.toolCallCount || 0) > 0,
      output: r.output ? r.output.substring(0, 20000) : undefined,
      error: r.error || undefined,
    });

    totalInput += inputTokens;
    totalOutput += outputTokens;
  }

  // Save step outputs for task cache (truncated to 5K per step)
  const stepOutputs: Record<string, string> = {};
  for (const [stepId, result] of Object.entries(execution.stepResults || {})) {
    const r = result as any;
    if (r.status === "completed" && r.output) {
      stepOutputs[stepId] = r.output.substring(0, 5000);
    }
  }

  const shortId = await getNextShortId();

  const record: PipelineRunRecord = {
    id: execution.id,
    shortId,
    workflowName: execution.workflowName,
    input: execution.input,
    mode: execution.routingDecision?.mode || "unknown",
    status: execution.status,
    startedAt: execution.startedAt,
    completedAt: execution.completedAt || new Date().toISOString(),
    totalDuration: execution.totalDuration || 0,
    totalTokens: { input: totalInput, output: totalOutput },
    jiraKey: execution.jiraKey,
    projectId: execution.projectId || undefined,
    agents,
    stepOutputs,
    stepResults: execution.stepResults || undefined,
  };

  // Save individual run
  const runFile = path.join(RUNS_DIR, `${execution.id}.json`);
  await fs.writeFile(runFile, JSON.stringify(record, null, 2), "utf-8");

  // Update analytics summary
  await updateAnalytics(record);

  return record;
}

// --- Analytics summary ---

async function updateAnalytics(run: PipelineRunRecord) {
  await ensureDir(DATA_DIR);

  let analytics: AnalyticsSummary;
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, "utf-8");
    analytics = JSON.parse(raw);
  } catch {
    analytics = {
      totalRuns: 0,
      byMode: {},
      byStatus: {},
      agentStats: {},
      lastUpdated: "",
    };
  }

  analytics.totalRuns++;
  analytics.byMode[run.mode] = (analytics.byMode[run.mode] || 0) + 1;
  analytics.byStatus[run.status] = (analytics.byStatus[run.status] || 0) + 1;

  // Skip agent stats for stopped/paused runs — partial results pollute success rates
  if (run.status === "stopped" || run.status === "paused" || run.status === "interrupted") {
    analytics.lastUpdated = new Date().toISOString();
    await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), "utf-8");
    return;
  }

  for (const agent of run.agents) {
    if (!analytics.agentStats[agent.agentId]) {
      analytics.agentStats[agent.agentId] = {
        runs: 0,
        avgScore: 0,
        avgTokens: 0,
        avgDuration: 0,
        successRate: 0,
        failRate: 0,
      };
    }

    const stat = analytics.agentStats[agent.agentId];
    const n = stat.runs;
    stat.runs++;
    // Running averages
    stat.avgScore = (stat.avgScore * n + agent.score) / (n + 1);
    stat.avgTokens = (stat.avgTokens * n + agent.tokens.input + agent.tokens.output) / (n + 1);
    stat.avgDuration = (stat.avgDuration * n + agent.duration) / (n + 1);
    // Rates
    const allRuns = stat.runs;
    const prevSuccesses = Math.round(stat.successRate * n / 100);
    const prevFails = Math.round(stat.failRate * n / 100);
    stat.successRate = ((prevSuccesses + (agent.score >= 8 ? 1 : 0)) / allRuns) * 100;
    stat.failRate = ((prevFails + (agent.score < 7 ? 1 : 0)) / allRuns) * 100;
  }

  analytics.lastUpdated = new Date().toISOString();
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), "utf-8");
}

// --- Recalculate analytics from all saved runs (excludes stopped/paused/interrupted) ---

export async function recalculateAnalytics(): Promise<AnalyticsSummary> {
  await ensureDir(RUNS_DIR);
  const files = await fs.readdir(RUNS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));

  const analytics: AnalyticsSummary = {
    totalRuns: 0,
    byMode: {},
    byStatus: {},
    agentStats: {},
    lastUpdated: new Date().toISOString(),
  };

  for (const file of jsonFiles) {
    try {
      const raw = await fs.readFile(path.join(RUNS_DIR, file), "utf-8");
      const run: PipelineRunRecord = JSON.parse(raw);

      analytics.totalRuns++;
      analytics.byMode[run.mode] = (analytics.byMode[run.mode] || 0) + 1;
      analytics.byStatus[run.status] = (analytics.byStatus[run.status] || 0) + 1;

      // Skip agent stats for stopped/paused/interrupted runs
      if (run.status === "stopped" || run.status === "paused" || run.status === "interrupted") continue;

      for (const agent of run.agents) {
        if (!analytics.agentStats[agent.agentId]) {
          analytics.agentStats[agent.agentId] = {
            runs: 0, avgScore: 0, avgTokens: 0, avgDuration: 0, successRate: 0, failRate: 0,
          };
        }
        const stat = analytics.agentStats[agent.agentId];
        const n = stat.runs;
        stat.runs++;
        stat.avgScore = (stat.avgScore * n + agent.score) / (n + 1);
        stat.avgTokens = (stat.avgTokens * n + agent.tokens.input + agent.tokens.output) / (n + 1);
        stat.avgDuration = (stat.avgDuration * n + agent.duration) / (n + 1);
        const allRuns = stat.runs;
        const prevSuccesses = Math.round(stat.successRate * n / 100);
        const prevFails = Math.round(stat.failRate * n / 100);
        stat.successRate = ((prevSuccesses + (agent.score >= 8 ? 1 : 0)) / allRuns) * 100;
        stat.failRate = ((prevFails + (agent.score < 7 ? 1 : 0)) / allRuns) * 100;
      }
    } catch { /* skip corrupt files */ }
  }

  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(analytics, null, 2), "utf-8");
  return analytics;
}

// --- Read analytics for agent context ---

export async function getAgentLearningContext(agentId: string, taskText?: string): Promise<string> {
  try {
    const raw = await fs.readFile(ANALYTICS_FILE, "utf-8");
    const analytics: AnalyticsSummary = JSON.parse(raw);
    const stat = analytics.agentStats[agentId];

    if (!stat || stat.runs === 0) return "";

    let context = `\n### YOUR PERFORMANCE STATS (from ${stat.runs} past runs)\n` +
      `- Avg score: ${stat.avgScore.toFixed(1)}/10\n` +
      `- Success rate (8+): ${stat.successRate.toFixed(0)}%\n` +
      `- Fail rate (<7): ${stat.failRate.toFixed(0)}%\n` +
      `- Avg tokens: ${Math.round(stat.avgTokens).toLocaleString()}\n` +
      `- Avg duration: ${(stat.avgDuration / 1000).toFixed(0)}s\n` +
      (stat.failRate > 30 ? `⚠️ Your fail rate is high. Focus on concise output and following the exact format.\n` : "");

    // Inject context-relevant success pattern
    try {
      const successPath = path.join(process.cwd(), "projects", "mission-control", "knowledge-base", "success-patterns.json");
      const successRaw = await fs.readFile(successPath, "utf-8");
      const successData = JSON.parse(successRaw);
      const pattern = successData.patterns?.find((p: any) => p.agent === agentId);
      if (pattern && pattern.whatWorks) {
        context += `\n### WHAT WORKS FOR YOU (from ${pattern.totalWins} successful runs)\n` +
          `${pattern.whatWorks}\n` +
          (pattern.toolPattern && typeof pattern.toolPattern === "object"
            ? `- Optimal tool calls: ${pattern.toolPattern.avgCalls} avg (range ${pattern.toolPattern.range})\n`
            : "") +
          `- Best avg tokens: ${pattern.avgTokens?.toLocaleString()}\n`;

        // Show relevant recent wins matching current task context
        if (taskText && pattern.recentWins?.length > 0) {
          const currentSnippet = classifyTaskContext(taskText);
          const relevant = pattern.recentWins.filter((w: any) => w.context_snippet === currentSnippet);
          if (relevant.length > 0) {
            context += `\n### SIMILAR PAST WINS (${currentSnippet})\n`;
            for (const w of relevant.slice(0, 3)) {
              context += `  ✓ ${w.score}/10 (${w.toolCalls} tools, ${w.tokens?.toLocaleString()} tokens) — "${(w.task || "").slice(0, 80)}"\n`;
            }
          }
        }
      }
    } catch { /* no success patterns yet */ }

    return context;
  } catch {
    return "";
  }
}

function classifyTaskContext(task: string): string {
  const t = task.toLowerCase();
  if (/api.*(route|endpoint)|create.*get|create.*post|route\.ts/.test(t)) return "api-route";
  if (/page|dashboard|settings|view/.test(t)) return "new-page";
  if (/button|component|footer|header|banner|modal|dialog|badge/.test(t)) return "ui-component";
  if (/edit|rename|inline|update|modify|refactor/.test(t)) return "refactor";
  if (/security|audit|cyber|auth|login|encrypt/.test(t)) return "security";
  if (/test|qa|lint|check/.test(t)) return "testing";
  if (/deploy|ci|devops|build|docker/.test(t)) return "devops";
  if (/router|logic|escalation|pipeline|config/.test(t)) return "pipeline-logic";
  return "general";
}

// --- Get recent runs for an agent (for learning) ---

export async function getRecentAgentRuns(agentId: string, limit = 5): Promise<string> {
  try {
    await ensureDir(RUNS_DIR);
    const files = await fs.readdir(RUNS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json")).sort().reverse().slice(0, 20);

    const relevant: Array<{ score: number; category: string; input: string; tokens: number }> = [];

    for (const file of jsonFiles) {
      const raw = await fs.readFile(path.join(RUNS_DIR, file), "utf-8");
      const run: PipelineRunRecord = JSON.parse(raw);
      const agentRun = run.agents.find((a) => a.agentId === agentId);
      if (agentRun) {
        relevant.push({
          score: agentRun.score,
          category: agentRun.scoreCategory,
          input: run.input.substring(0, 80),
          tokens: agentRun.tokens.input + agentRun.tokens.output,
        });
      }
      if (relevant.length >= limit) break;
    }

    if (relevant.length === 0) return "";

    const lines = relevant.map((r) =>
      `  ${r.category === "success" ? "✓" : r.category === "needs-work" ? "~" : "✗"} ${r.score}/10 (${r.tokens.toLocaleString()} tokens) — "${r.input}"`
    );

    return `\n### YOUR RECENT RUNS\n${lines.join("\n")}\n`;
  } catch {
    return "";
  }
}
