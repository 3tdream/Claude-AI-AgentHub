import { NextRequest, NextResponse } from "next/server";
import { syncBidirectional, exportKBToMemory, importMemoryToKB } from "@/lib/cross-session-bridge";

/**
 * POST /api/knowledge-base/sync
 *
 * Sync between CLI memory and MC KB.
 * Body: { direction?: "kb-to-memory" | "memory-to-kb" | "bidirectional" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const direction = body.direction || "bidirectional";

    if (direction === "kb-to-memory") {
      const result = await exportKBToMemory();
      return NextResponse.json({ data: { direction, kbToMemory: result, syncedAt: new Date().toISOString() } });
    }
    if (direction === "memory-to-kb") {
      const result = await importMemoryToKB();
      return NextResponse.json({ data: { direction, memoryToKb: result, syncedAt: new Date().toISOString() } });
    }

    const report = await syncBidirectional();
    return NextResponse.json({ data: report });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
