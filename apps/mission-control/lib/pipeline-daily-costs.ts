import { readdir, readFile } from "fs/promises";
import { join } from "path";

interface DailyCostEntry {
  date: string;
  cost: number;
  requests: number;
  tokens: number;
}

const PIPELINE_RUNS_DIR = join(process.cwd(), "data", "pipeline-runs");

// Approximate pricing per 1M tokens (blended across models)
const INPUT_PRICE_PER_M = 3;   // ~$3/M input (sonnet avg)
const OUTPUT_PRICE_PER_M = 15;  // ~$15/M output (sonnet avg)

/**
 * Aggregate daily costs from local pipeline-runs/*.json files.
 * Used as fallback when Agent Hub is unreachable.
 */
export async function aggregateDailyCostsFromRuns(days?: number): Promise<DailyCostEntry[]> {
  try {
    const files = await readdir(PIPELINE_RUNS_DIR);
    const byDate: Record<string, { cost: number; requests: number; tokens: number }> = {};

    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      try {
        const raw = await readFile(join(PIPELINE_RUNS_DIR, file), "utf-8");
        const run = JSON.parse(raw);
        const date = (run.startedAt || "").slice(0, 10);
        if (!date) continue;

        if (!byDate[date]) byDate[date] = { cost: 0, requests: 0, tokens: 0 };
        byDate[date].requests++;

        const steps = Object.values(run.stepResults || {}) as Array<{
          inputTokens?: number;
          outputTokens?: number;
          toolCallCount?: number;
        }>;

        for (const step of steps) {
          const input = step.inputTokens || 0;
          const output = step.outputTokens || 0;
          byDate[date].tokens += input + output;
          byDate[date].cost += (input * INPUT_PRICE_PER_M + output * OUTPUT_PRICE_PER_M) / 1_000_000;
        }
      } catch {
        // skip corrupt files
      }
    }

    let entries = Object.entries(byDate)
      .map(([date, v]) => ({
        date,
        cost: Number(v.cost.toFixed(4)),
        requests: v.requests,
        tokens: v.tokens,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    if (days) {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      entries = entries.filter((e) => e.date >= cutoffStr);
    }

    return entries;
  } catch {
    return [];
  }
}
