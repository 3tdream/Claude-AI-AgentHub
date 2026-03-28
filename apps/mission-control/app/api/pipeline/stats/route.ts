import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/pipeline/stats — Returns pipeline run counts from pipeline-analytics.json
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "pipeline-analytics.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json({
      success: true,
      totalRuns: data.totalRuns || 0,
      completed: data.byStatus?.completed || 0,
      failed: data.byStatus?.failed || 0,
      paused: data.byStatus?.paused || 0,
      stopped: data.byStatus?.stopped || 0,
      lastUpdated: data.lastUpdated || null,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, totalRuns: 0, completed: 0, failed: 0, paused: 0, stopped: 0, error: err instanceof Error ? err.message : "Failed to read" },
      { status: 500 },
    );
  }
}
