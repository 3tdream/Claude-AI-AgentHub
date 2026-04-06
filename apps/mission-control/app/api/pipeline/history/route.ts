import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const RUNS_DIR = path.join(process.cwd(), "data", "pipeline-runs");
const LIMIT = 100;

interface RawPipelineRun {
  id?: string;
  shortId?: string;
  workflowName?: string;
  status?: string;
  input?: string;
  startedAt?: string;
  completedAt?: string;
  totalDuration?: number;
  jiraKey?: string;
  projectId?: string;
  agents?: unknown[];
  [key: string]: unknown;
}

export interface PipelineHistoryItem {
  id: string;
  shortId: string;
  workflowName: string;
  status: string;
  input: string;
  startedAt: string;
  completedAt: string | null;
  totalDuration: number | null;
  stepsCount: number;
  jiraKey: string | null;
  projectId: string | null;
}

async function parseRunFile(filePath: string): Promise<PipelineHistoryItem | null> {
  try {
    const data: RawPipelineRun = JSON.parse(await fs.readFile(filePath, "utf-8"));
    const startedAt = data.startedAt || (data as any).timestamp;
    if (!startedAt) return null;
    const fileId = path.basename(filePath, ".json");
    const stepResults = (data as any).stepResults;
    const stepsCount = stepResults ? Object.keys(stepResults).length : Array.isArray(data.agents) ? data.agents.length : 0;
    return {
      id: typeof data.id === "string" && data.id.trim() ? data.id : (data as any).taskId || fileId,
      shortId: typeof data.shortId === "string" ? data.shortId : "",
      workflowName: typeof data.workflowName === "string" ? data.workflowName : "Direct Execution",
      status: typeof data.status === "string" ? data.status : "unknown",
      input: typeof data.input === "string" ? data.input : "",
      startedAt,
      completedAt: typeof data.completedAt === "string" ? data.completedAt : null,
      totalDuration: typeof data.totalDuration === "number" ? data.totalDuration : null,
      stepsCount,
      jiraKey: typeof data.jiraKey === "string" ? data.jiraKey : null,
      projectId: typeof data.projectId === "string" ? data.projectId : null,
    };
  } catch {
    return null;
  }
}

/**
 * GET /api/pipeline/history
 * Returns up to 100 pipeline runs sorted by startedAt descending.
 * Query params:
 *   - projectId: filter by project
 * Response: { success: true, runs: PipelineHistoryItem[], total: number }
 */
export async function GET(request: NextRequest) {
  try {
    const projectFilter = request.nextUrl.searchParams.get("projectId");

    let entries: string[];
    try {
      entries = await fs.readdir(RUNS_DIR);
    } catch {
      return NextResponse.json({ success: true, runs: [], total: 0 });
    }

    const settled = await Promise.all(
      entries
        .filter((n) => n.endsWith(".json"))
        .map((n) => parseRunFile(path.join(RUNS_DIR, n))),
    );

    let allRuns = settled
      .filter((r): r is PipelineHistoryItem => r !== null)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

    const totalAll = allRuns.length;

    // Filter by project if requested
    if (projectFilter) {
      allRuns = allRuns.filter((r) => r.projectId === projectFilter);
    }

    const total = allRuns.length;

    // Assign sequential shortIds to runs that don't have one (legacy backfill)
    // These are display-only, not persisted back to file
    let backfillCounter = total;
    const runs = allRuns.slice(0, LIMIT).map((r) => {
      if (!r.shortId) {
        r.shortId = `MC-${String(backfillCounter).padStart(3, "0")}`;
        backfillCounter--;
      }
      return r;
    });

    // Collect unique projectIds for filter dropdown
    const projectIds = [...new Set(
      settled
        .filter((r): r is PipelineHistoryItem => r !== null && !!r.projectId)
        .map((r) => r.projectId!)
    )];

    return NextResponse.json({ success: true, runs, total, totalAll, projectIds });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[GET /api/pipeline/history]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
