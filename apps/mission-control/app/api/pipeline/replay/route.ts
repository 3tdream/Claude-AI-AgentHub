import { NextRequest, NextResponse } from "next/server";
import { loadExecutionLog, listExecutionLogs } from "@/lib/execution-logger";

/**
 * GET /api/pipeline/replay — List execution logs or load a specific one
 * ?id=xxx — Load specific execution log for replay
 * (no params) — List all execution logs
 */
export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");

  if (id) {
    const log = await loadExecutionLog(id);
    if (!log) {
      return NextResponse.json({ error: "Execution log not found" }, { status: 404 });
    }
    return NextResponse.json({ data: log });
  }

  const logs = await listExecutionLogs();
  return NextResponse.json({ data: logs });
}
