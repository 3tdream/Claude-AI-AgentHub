import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addLog } from "@/lib/logs-storage";

const FAILURE_PATTERNS_PATH = path.join(
  process.cwd(),
  "projects",
  "mission-control",
  "knowledge-base",
  "failure-patterns.json",
);

interface FeedbackPayload {
  pipelineId: string;
  reason: string;
  category: "wrong-files" | "bad-code" | "wrong-approach" | "broke-something" | "other";
  affectedFiles?: string[];
  agentId?: string;
}

/**
 * POST /api/knowledge/feedback
 * Records user feedback when pipeline output is discarded.
 * Appends a new failure pattern to failure-patterns.json.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as FeedbackPayload;

    if (!payload.reason?.trim()) {
      return NextResponse.json({ error: "reason is required" }, { status: 400 });
    }

    // Read existing patterns
    let data: { patterns: any[]; [key: string]: any };
    try {
      const raw = await fs.readFile(FAILURE_PATTERNS_PATH, "utf-8");
      data = JSON.parse(raw);
    } catch {
      data = { _description: "Known issues, root causes, and solutions", _updated: "", patterns: [] };
    }

    // Generate next ID
    const maxId = data.patterns
      .map((p: any) => parseInt(p.id?.replace("FAIL-", "") || "0"))
      .reduce((a: number, b: number) => Math.max(a, b), 0);
    const newId = `FAIL-${String(maxId + 1).padStart(3, "0")}`;

    // Map category to description
    const categoryMap: Record<string, string> = {
      "wrong-files": "Agent created/edited wrong files or paths",
      "bad-code": "Generated code doesn't compile or has bugs",
      "wrong-approach": "Agent took wrong architectural approach",
      "broke-something": "Changes broke existing functionality",
      "other": "Other issue",
    };

    const newPattern = {
      id: newId,
      category: payload.category || "other",
      title: `User rejected pipeline output: ${categoryMap[payload.category] || payload.category}`,
      symptoms: payload.reason.trim(),
      root_cause: `User feedback on pipeline ${payload.pipelineId}${payload.agentId ? ` (agent: ${payload.agentId})` : ""}`,
      solution: "Review and address in next pipeline run. Agents should read this pattern to avoid repeating the mistake.",
      date_discovered: new Date().toISOString().slice(0, 10),
      recurrence: "User feedback via Discard",
      source_pipeline: payload.pipelineId,
      affected_files: payload.affectedFiles || [],
    };

    data.patterns.push(newPattern);
    data._updated = new Date().toISOString().slice(0, 10);

    await fs.writeFile(FAILURE_PATTERNS_PATH, JSON.stringify(data, null, 2), "utf-8");

    await addLog({
      type: "system",
      content: `Knowledge feedback recorded: ${newId} — "${payload.reason.substring(0, 100)}"`,
    });

    return NextResponse.json({ success: true, patternId: newId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save feedback" },
      { status: 500 },
    );
  }
}
