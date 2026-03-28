import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

/**
 * GET /api/agents/performance — Returns agentStats from pipeline-analytics.json
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "pipeline-analytics.json");
    const raw = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json({
      success: true,
      agentStats: data.agentStats || {},
      lastUpdated: data.lastUpdated || null,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, agentStats: {}, error: err instanceof Error ? err.message : "Failed to read analytics" },
      { status: 500 },
    );
  }
}
