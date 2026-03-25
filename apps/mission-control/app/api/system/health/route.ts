import { NextResponse } from "next/server";
import { runHealthCheck } from "@/lib/monitoring";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/system/health
 *
 * Full system health check — agents, KB, pipeline, dependencies.
 * Returns detailed report with alerts and per-subsystem scores.
 */
export async function GET() {
  try {
    const report = await runHealthCheck();
    return NextResponse.json(report);
  } catch (e) {
    return NextResponse.json({
      overall: "down",
      overallScore: 0,
      subsystems: [],
      activeAlerts: 1,
      criticalAlerts: 1,
      checkedAt: new Date().toISOString(),
      error: String(e),
    });
  }
}
