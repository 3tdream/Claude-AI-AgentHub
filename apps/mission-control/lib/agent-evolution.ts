/**
 * Agent Specialization Evolution
 *
 * Agents improve their own prompts based on performance data:
 * 1. Reads agent performance matrix (success rate, fail patterns)
 * 2. Reads KB failure patterns for this agent
 * 3. Generates prompt improvements (additions, not rewrites)
 * 4. Proposes changes — NEVER auto-applies (requires user approval)
 *
 * NOT autonomous rewriting. Controlled evolution with human in the loop.
 */

import { promises as fs } from "fs";
import path from "path";
import type { KBEntry } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROMPTS_DIR = path.join(DATA_DIR, "prompt-overrides.json");

interface AgentStats {
  runs: number;
  avgScore: number;
  successRate: number;
  failRate: number;
  avgTokens: number;
  avgDuration: number;
}

export interface PromptEvolution {
  agentId: string;
  currentPromptLength: number;
  /** What to ADD to the prompt (not replace) */
  additions: PromptAddition[];
  /** Overall recommendation */
  recommendation: string;
  /** Confidence in these changes (0-1) */
  confidence: number;
  /** Data sources used */
  basedOn: {
    runs: number;
    failurePatterns: number;
    successPatterns: number;
    successRate: number;
  };
}

export interface PromptAddition {
  type: "constraint" | "example" | "warning" | "technique";
  content: string;
  reason: string;
  /** KB entry that motivated this */
  source?: string;
}

// ── Analytics loader ──

async function loadAgentStats(): Promise<Record<string, AgentStats>> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, "pipeline-analytics.json"), "utf-8");
    return JSON.parse(raw).agentStats || {};
  } catch {
    return {};
  }
}

// ── Evolution engine ──

export function generateEvolution(
  agentId: string,
  stats: AgentStats | null,
  failurePatterns: KBEntry[],
  successPatterns: KBEntry[],
): PromptEvolution {
  const additions: PromptAddition[] = [];
  const agentShort = agentId.replace("-agent", "");

  // 1. From failure patterns → constraints
  const agentFailures = failurePatterns.filter(
    (e) => e.agentId === agentId || e.tags.includes(agentShort) || e.source?.includes(agentShort),
  );

  for (const failure of agentFailures.slice(0, 5)) {
    // Extract actionable fix from content
    const fixMatch = failure.content.match(/Fix:\s*(.+?)(?:\.|$)/i);
    const fix = fixMatch?.[1]?.trim();

    if (fix) {
      additions.push({
        type: "constraint",
        content: `CONSTRAINT: ${fix}`,
        reason: `KB failure pattern: "${failure.title}"`,
        source: failure.id,
      });
    } else {
      additions.push({
        type: "warning",
        content: `WARNING: ${failure.title}. ${failure.content.substring(0, 100)}`,
        reason: `Recurring failure (severity: ${failure.severity})`,
        source: failure.id,
      });
    }
  }

  // 2. From success patterns → techniques
  const agentSuccesses = successPatterns.filter(
    (e) => e.agentId === agentId || e.tags.includes(agentShort),
  );

  for (const success of agentSuccesses.slice(0, 3)) {
    additions.push({
      type: "technique",
      content: `PROVEN TECHNIQUE: ${success.title}`,
      reason: `Success pattern with high confidence`,
      source: success.id,
    });
  }

  // 3. From stats → specific improvements
  if (stats) {
    if (stats.failRate > 50) {
      additions.push({
        type: "warning",
        content: `YOUR STATS: ${Math.round(stats.failRate)}% fail rate across ${stats.runs} runs. Focus on completeness and following contracts exactly.`,
        reason: `High fail rate (${Math.round(stats.failRate)}%)`,
      });
    }

    if (stats.avgTokens > 50000) {
      additions.push({
        type: "constraint",
        content: "TOKEN BUDGET: Your average output is very large. Prioritize critical content first. Use chunking.",
        reason: `High avg tokens (${Math.round(stats.avgTokens / 1000)}K)`,
      });
    }

    if (stats.avgScore < 7) {
      additions.push({
        type: "constraint",
        content: "QUALITY: Your average score is below threshold. Follow the stage contract outputs EXACTLY. Every required field must be present.",
        reason: `Low avg score (${stats.avgScore.toFixed(1)})`,
      });
    }
  }

  // Recommendation
  let recommendation: string;
  const severity = additions.filter((a) => a.type === "constraint" || a.type === "warning").length;

  if (severity === 0) {
    recommendation = `${agentId} is performing well. No prompt changes needed.`;
  } else if (severity <= 2) {
    recommendation = `${agentId} has minor issues. ${severity} additions suggested to address known patterns.`;
  } else {
    recommendation = `${agentId} needs attention. ${severity} additions from ${agentFailures.length} failure patterns. Review and approve.`;
  }

  const confidence = stats
    ? Math.min(0.95, 0.5 + (stats.runs / 100) * 0.3 + (agentFailures.length / 10) * 0.2)
    : 0.3;

  return {
    agentId,
    currentPromptLength: 0, // Will be filled by API
    additions,
    recommendation,
    confidence: Math.round(confidence * 100) / 100,
    basedOn: {
      runs: stats?.runs || 0,
      failurePatterns: agentFailures.length,
      successPatterns: agentSuccesses.length,
      successRate: stats?.successRate || 0,
    },
  };
}

/**
 * Generate evolution proposals for ALL agents
 */
export async function evolveAllAgents(
  kbEntries: KBEntry[],
): Promise<PromptEvolution[]> {
  const allStats = await loadAgentStats();
  const failurePatterns = kbEntries.filter((e) => e.id.startsWith("kb-fp") || e.tags.includes("failure"));
  const successPatterns = kbEntries.filter((e) => e.id.startsWith("kb-su") || e.tags.includes("success"));

  const agentIds = [
    "research-agent", "orchestrator", "pm-agent", "architect-agent",
    "backend-agent", "frontend-agent", "designer-agent",
    "cyber-agent", "qa-agent", "devops-agent",
  ];

  return agentIds.map((agentId) => {
    const shortId = agentId.replace("-agent", "");
    const stats = allStats[shortId] || allStats[agentId] || null;
    return generateEvolution(agentId, stats, failurePatterns, successPatterns);
  });
}
