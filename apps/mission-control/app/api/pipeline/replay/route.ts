import { NextRequest, NextResponse } from "next/server";
import { loadExecutionLog, listExecutionLogs, startExecutionLog, finalizeExecutionLog } from "@/lib/execution-logger";

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

/**
 * POST /api/pipeline/replay — Start or finalize execution log
 * { action: "start", executionId, workflowName, input, projectId? }
 * { action: "finalize", execution }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "start") {
      startExecutionLog(body.executionId, body.workflowName, body.input, body.projectId);
      return NextResponse.json({ ok: true });
    }

    if (body.action === "finalize" && body.execution) {
      const path = await finalizeExecutionLog(body.execution);
      return NextResponse.json({ ok: true, path });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
