import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const KB_PATH = join(process.cwd(), "projects", "mission-control", "knowledge-base", "success-patterns.json");

interface SuccessEntry {
  agent: string;
  score: number;
  tokens: number;
  toolCalls: number;
  duration: number;
  model: string;
  task: string;
  context_snippet?: string;
}

function classifyTask(task: string): string {
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

export async function POST(request: NextRequest) {
  try {
    const entry: SuccessEntry = await request.json();
    if (!entry.agent || !entry.score) {
      return NextResponse.json({ error: "Missing agent or score" }, { status: 400 });
    }

    let data: any;
    try {
      data = JSON.parse(await readFile(KB_PATH, "utf-8"));
    } catch {
      await mkdir(join(process.cwd(), "projects", "mission-control", "knowledge-base"), { recursive: true });
      data = { _description: "Successful agent patterns", _updated: "", _totalWins: 0, patterns: [] };
    }

    // Find or create pattern for this agent
    let pattern = data.patterns.find((p: any) => p.agent === entry.agent);
    if (!pattern) {
      pattern = {
        id: `SUCCESS-${String(data.patterns.length + 1).padStart(3, "0")}`,
        agent: entry.agent,
        totalWins: 0,
        avgScore: 0,
        avgTokens: 0,
        avgDurationSec: 0,
        models: [],
        toolPattern: { avgCalls: 0, range: "0-0" },
        recentWins: [],
        date_extracted: new Date().toISOString().slice(0, 10),
        source: "auto-captured",
      };
      data.patterns.push(pattern);
    }

    // Update rolling stats
    const n = pattern.totalWins;
    pattern.avgScore = Math.round(((pattern.avgScore * n + entry.score) / (n + 1)) * 10) / 10;
    pattern.avgTokens = Math.round((pattern.avgTokens * n + entry.tokens) / (n + 1));
    pattern.avgDurationSec = Math.round(((pattern.avgDurationSec || 0) * n + (entry.duration || 0) / 1000) / (n + 1));
    pattern.totalWins = n + 1;

    if (entry.model && !pattern.models?.includes(entry.model)) {
      pattern.models = [...(pattern.models || []), entry.model];
    }

    // Track tool calls
    if (entry.toolCalls > 0) {
      const tc = pattern.toolPattern || { avgCalls: 0, range: "0-0" };
      if (typeof tc === "string") {
        pattern.toolPattern = { avgCalls: entry.toolCalls, range: `${entry.toolCalls}-${entry.toolCalls}` };
      } else {
        const [min, max] = (tc.range || "0-0").split("-").map(Number);
        tc.avgCalls = Math.round(((tc.avgCalls * n + entry.toolCalls) / (n + 1)) * 10) / 10;
        tc.range = `${Math.min(min || entry.toolCalls, entry.toolCalls)}-${Math.max(max || entry.toolCalls, entry.toolCalls)}`;
        pattern.toolPattern = tc;
      }
    }

    // Classify task context
    const snippet = entry.context_snippet || classifyTask(entry.task || "");

    // Track best contexts
    if (!pattern.bestContexts) pattern.bestContexts = [];
    const ctx = pattern.bestContexts.find((c: any) => c.type === snippet);
    if (ctx) { ctx.wins++; } else { pattern.bestContexts.push({ type: snippet, wins: 1 }); }
    pattern.bestContexts.sort((a: any, b: any) => b.wins - a.wins);

    // Keep last 5 wins with context_snippet
    if (!pattern.recentWins) pattern.recentWins = [];
    pattern.recentWins.unshift({
      score: entry.score,
      tokens: entry.tokens,
      toolCalls: entry.toolCalls,
      context_snippet: snippet,
      task: entry.task,
      date: new Date().toISOString().slice(0, 10),
    });
    pattern.recentWins = pattern.recentWins.slice(0, 5);

    data._totalWins = data.patterns.reduce((s: number, p: any) => s + p.totalWins, 0);
    data._updated = new Date().toISOString().slice(0, 10);

    await writeFile(KB_PATH, JSON.stringify(data, null, 2) + "\n");

    return NextResponse.json({ ok: true, agent: entry.agent, totalWins: pattern.totalWins });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
