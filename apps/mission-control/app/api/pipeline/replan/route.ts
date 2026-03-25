import { NextRequest, NextResponse } from "next/server";
import { runPreflightSimulation } from "@/lib/preflight-simulation";
import { runStrategyArchitect } from "@/lib/strategy-architect";
import { readKBFile } from "@/lib/kb-storage";
import { CRM_PIPELINE_STAGES } from "@/lib/pipeline-templates";
import type { KBEntry, WorkflowStep } from "@/types";

async function loadKBEntries(): Promise<KBEntry[]> {
  const entries: KBEntry[] = [];
  for (const cat of ["failure-patterns", "security-playbook", "success-patterns", "architecture-patterns", "tech-decisions"] as const) {
    const file = await readKBFile(cat);
    if (file) entries.push(...file.entries);
  }
  return entries;
}

/**
 * POST /api/pipeline/replan
 *
 * S0.2 Strategy Architect — iterative replanning.
 * Runs simulation, then replan loop until >70% or convergence.
 *
 * Body: { input: string, steps?: WorkflowStep[] }
 */
export async function POST(req: NextRequest) {
  try {
    const { input, steps } = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: "input is required" }, { status: 400 });
    }

    const pipelineSteps: WorkflowStep[] = steps || CRM_PIPELINE_STAGES;
    const kbEntries = await loadKBEntries();

    // Initial simulation
    const initialSim = await runPreflightSimulation(input, pipelineSteps);

    // If already above threshold, no replan needed
    if (initialSim.overallProbability >= 70) {
      return NextResponse.json({
        data: {
          needed: false,
          initialScore: initialSim.overallProbability,
          finalScore: initialSim.overallProbability,
          message: "Simulation score already above threshold (70%). No replan needed.",
          simulation: initialSim,
        },
      });
    }

    // Run Strategy Architect
    const report = await runStrategyArchitect(input, pipelineSteps, initialSim, kbEntries);

    return NextResponse.json({
      data: {
        needed: true,
        ...report,
        simulation: await runPreflightSimulation(input, pipelineSteps), // Final simulation state
        _meta: {
          kbEntriesUsed: kbEntries.length,
          threshold: 70,
        },
      },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
