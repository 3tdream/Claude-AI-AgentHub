import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const RUNS_DIR = path.join(process.cwd(), "data", "pipeline-runs");

/**
 * GET /api/pipeline/cache?input=xxx&stepId=yyy&minScore=7.5
 * Returns cached output from past runs with matching input + step.
 */
export async function GET(request: NextRequest) {
  const taskInput = request.nextUrl.searchParams.get("input");
  const stepId = request.nextUrl.searchParams.get("stepId");
  const minScore = parseFloat(request.nextUrl.searchParams.get("minScore") || "7.5");

  if (!taskInput || !stepId) {
    return NextResponse.json({ cached: false });
  }

  try {
    await fs.access(RUNS_DIR);
  } catch {
    return NextResponse.json({ cached: false });
  }

  try {
    const files = await fs.readdir(RUNS_DIR);
    const sorted = files.filter((f) => f.endsWith(".json")).sort().reverse().slice(0, 30);

    for (const file of sorted) {
      try {
        const raw = await fs.readFile(path.join(RUNS_DIR, file), "utf-8");
        const run = JSON.parse(raw);

        if (run.input !== taskInput) continue;

        const agent = run.agents?.find((a: any) => a.stepId === stepId);
        if (!agent || agent.score < minScore || agent.status !== "completed") continue;

        // Get cached output
        const output = run.stepOutputs?.[stepId];
        if (!output) continue;

        return NextResponse.json({
          cached: true,
          runId: run.id,
          score: agent.score,
          output,
          stepId,
        });
      } catch {
        continue;
      }
    }
  } catch {
    // ignore
  }

  return NextResponse.json({ cached: false });
}
