import { NextRequest, NextResponse } from "next/server";
import { routeTask } from "@/lib/smart-router";
import { runPreflightSimulation } from "@/lib/preflight-simulation";
import { applySimulationAdjustments } from "@/lib/simulation-router";
import { runStrategyArchitect } from "@/lib/strategy-architect";
import { readKBFile } from "@/lib/kb-storage";
import { routeSkills } from "@/lib/skill-router";
import { CRM_PIPELINE_STAGES } from "@/lib/pipeline-templates";
import type { KBEntry } from "@/types";

async function loadKBEntries(): Promise<KBEntry[]> {
  const entries: KBEntry[] = [];
  for (const cat of ["failure-patterns", "security-playbook", "success-patterns", "architecture-patterns", "tech-decisions"] as const) {
    const file = await readKBFile(cat);
    if (file) entries.push(...file.entries);
  }
  return entries;
}

/**
 * POST /api/pipeline/route — Smart routing + simulation + auto-replan
 *
 * 1. Routes task via AI (quick/medium/full)
 * 2. Runs preflight simulation against KB + analytics
 * 3. If simulation < 50%: triggers S0.2 Strategy Architect (auto-replan)
 * 4. Applies simulation adjustments (mode upgrades, guard agents, warnings)
 * 5. Returns adjusted decision with simulation + replan context
 */
export async function POST(request: NextRequest) {
  try {
    const { input, selectedProject } = await request.json();

    if (!input?.trim()) {
      return NextResponse.json(
        { success: false, error: "input is required" },
        { status: 400 },
      );
    }

    // Run routing + simulation in parallel
    const [decision, simulation] = await Promise.all([
      routeTask(input),
      runPreflightSimulation(input, CRM_PIPELINE_STAGES, selectedProject),
    ]);

    // Load KB entries once for replan + skill routing
    const kbEntries = await loadKBEntries();

    // S0.2: Auto-replan if simulation is below 50%
    let replanReport = null;
    if (simulation.overallProbability < 50) {
      try {
        replanReport = await runStrategyArchitect(input, CRM_PIPELINE_STAGES, simulation, kbEntries);
      } catch {
        // Replan failed — continue without it
      }
    }

    // Apply simulation-based adjustments
    const adjusted = applySimulationAdjustments(decision, simulation);

    // Run Skill Router as validation/enhancement layer
    const skillPlan = routeSkills(input, kbEntries);

    return NextResponse.json({
      success: true,
      decision: adjusted,
      replan: replanReport
        ? {
            needed: true,
            initialScore: replanReport.initialScore,
            finalScore: replanReport.finalScore,
            totalLift: replanReport.totalLift,
            liftRate: Math.round(replanReport.liftRate * 100),
            iterations: replanReport.iterations.length,
            stopReason: replanReport.stopReason,
            durationMs: replanReport.totalDurationMs,
            actions: replanReport.appliedActions.map((a) => ({
              type: a.type,
              stageId: a.stageId,
              description: a.description,
            })),
          }
        : { needed: false },
      skillPlan: {
        plan: skillPlan.plan.map((s) => ({
          skill: s.skill,
          role: s.role,
          order: s.order,
          score: s.score,
          why: s.why,
        })),
        confidence: skillPlan.confidence,
        suggestedSkills: skillPlan.plan.map((s) => s.skill),
        taskAnalysis: skillPlan.taskAnalysis,
      },
      _meta: {
        originalMode: decision.mode,
        adjustedMode: adjusted.mode,
        adjustmentCount: adjusted.simulation.adjustments.length,
        simulationProbability: simulation.overallProbability,
        replanTriggered: simulation.overallProbability < 50,
        finalProbability: replanReport?.finalScore || simulation.overallProbability,
        kbEntriesUsed: simulation.dataSources.kbFailurePatterns + simulation.dataSources.kbSuccessPatterns,
      },
    });
  } catch (error) {
    console.error("[API] Smart routing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Routing failed",
      },
      { status: 500 },
    );
  }
}
