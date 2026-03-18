/**
 * Task Cache — reuse completed stage outputs from past pipeline runs.
 * Searches data/pipeline-runs/ for runs with matching input.
 * Returns cached outputs for stages that scored ≥7.5.
 */

import { promises as fs } from "fs";
import path from "path";

const RUNS_DIR = path.join(process.cwd(), "data", "pipeline-runs");

export interface CachedStepOutput {
  stepId: string;
  output: string;
  score: number;
  source: "cached";
  cachedFromRun: string;
}

/**
 * Search past runs for cached stage outputs matching the given task input.
 * Returns a map of stepId → cached output for stages with score ≥ minScore.
 */
export async function findCachedOutputs(
  taskInput: string,
  minScore: number = 7.5,
): Promise<Record<string, CachedStepOutput>> {
  const cached: Record<string, CachedStepOutput> = {};

  try {
    await fs.access(RUNS_DIR);
  } catch {
    return cached; // No runs directory yet
  }

  try {
    const files = await fs.readdir(RUNS_DIR);
    const jsonFiles = files.filter((f) => f.endsWith(".json")).sort().reverse().slice(0, 30); // Check last 30 runs

    for (const file of jsonFiles) {
      try {
        const raw = await fs.readFile(path.join(RUNS_DIR, file), "utf-8");
        const run = JSON.parse(raw);

        // Exact match on input (v1 — simple)
        if (run.input !== taskInput) continue;

        // Extract completed stages with good scores
        if (!run.agents || !Array.isArray(run.agents)) continue;

        for (const agent of run.agents) {
          // Only cache stages with score ≥ minScore
          if (agent.score < minScore) continue;
          if (agent.status !== "completed") continue;

          // Don't override if we already have a better cached version
          if (cached[agent.stepId] && cached[agent.stepId].score >= agent.score) continue;

          // We need the actual output — read from the full run file
          // The analytics run doesn't store full output, we need the original
          // For now, store what we have
          cached[agent.stepId] = {
            stepId: agent.stepId,
            output: "", // Will be populated from stepResults
            score: agent.score,
            source: "cached",
            cachedFromRun: run.id,
          };
        }

        // If we found a match, try to get full outputs from execution
        if (Object.keys(cached).length > 0) {
          break; // Use the most recent matching run
        }
      } catch {
        // Skip corrupted files
      }
    }
  } catch {
    // Directory read error
  }

  return cached;
}
