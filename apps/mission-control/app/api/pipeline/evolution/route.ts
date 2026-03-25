import { NextRequest, NextResponse } from "next/server";
import { runNightlyEvolution } from "@/lib/nightly-evolution";

/**
 * POST /api/pipeline/evolution
 *
 * Trigger nightly evolution — analyze runs, extract patterns, calibrate.
 * Body: { windowHours?: number } — default 168 (7 days)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const windowHours = body.windowHours || 168;

    const report = await runNightlyEvolution(windowHours);
    return NextResponse.json({ data: report });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
