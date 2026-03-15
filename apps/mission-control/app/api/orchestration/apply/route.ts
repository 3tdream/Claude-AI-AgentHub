import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addLog } from "@/lib/logs-storage";

const PROJECT_ROOT = process.cwd();
const STAGING_DIR = path.join(PROJECT_ROOT, "data", "applied");

interface ApplyFile {
  filePath: string;
  content: string;
  language: string;
}

/**
 * POST /api/orchestration/apply
 * Stages parsed code blocks into data/applied/{pipelineId}/ — does NOT modify working code.
 * Accepts: { files: ApplyFile[], pipelineId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { files, pipelineId } = (await request.json()) as {
      files: ApplyFile[];
      pipelineId?: string;
    };

    if (!pipelineId) {
      return NextResponse.json(
        { error: "pipelineId is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "No files to stage" },
        { status: 400 },
      );
    }

    const stageDir = path.join(STAGING_DIR, pipelineId);
    const results: { filePath: string; status: "staged" | "error"; error?: string }[] = [];

    for (const file of files) {
      try {
        const normalizedPath = file.filePath
          .replace(/\\/g, "/")
          .replace(/^\/+/, "");

        // Security: prevent path traversal
        if (normalizedPath.includes("..") || path.isAbsolute(normalizedPath)) {
          results.push({ filePath: normalizedPath, status: "error", error: "Path traversal not allowed" });
          continue;
        }

        // Block sensitive locations
        const blocked = ["node_modules/", ".env", "data/api-keys", ".git/"];
        if (blocked.some((b) => normalizedPath.startsWith(b) || normalizedPath.includes(b))) {
          results.push({ filePath: normalizedPath, status: "error", error: "Writing to this path is blocked" });
          continue;
        }

        const fullPath = path.join(stageDir, normalizedPath);
        await fs.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.writeFile(fullPath, file.content, "utf-8");

        results.push({ filePath: normalizedPath, status: "staged" });
      } catch (err) {
        results.push({
          filePath: file.filePath,
          status: "error",
          error: err instanceof Error ? err.message : "Stage failed",
        });
      }
    }

    const staged = results.filter((r) => r.status === "staged").length;
    const errors = results.filter((r) => r.status === "error").length;

    await addLog({
      type: "system",
      content: `Pipeline Staged [${pipelineId}]: ${staged} files staged to data/applied/, ${errors} errors`,
    });

    return NextResponse.json({
      success: errors === 0,
      results,
      summary: { staged, errors, total: files.length },
      stagingPath: `data/applied/${pipelineId}`,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Apply failed" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/orchestration/apply?pipelineId=xxx
 * Lists staged files for a pipeline.
 */
export async function GET(request: NextRequest) {
  const pipelineId = request.nextUrl.searchParams.get("pipelineId");
  if (!pipelineId) {
    return NextResponse.json({ error: "pipelineId required" }, { status: 400 });
  }

  const stageDir = path.join(STAGING_DIR, pipelineId);

  try {
    await fs.access(stageDir);
  } catch {
    return NextResponse.json({ files: [], exists: false });
  }

  const files: { filePath: string; size: number }[] = [];

  async function walk(dir: string, prefix: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        await walk(path.join(dir, entry.name), rel);
      } else {
        const stat = await fs.stat(path.join(dir, entry.name));
        files.push({ filePath: rel, size: stat.size });
      }
    }
  }

  await walk(stageDir, "");

  return NextResponse.json({ files, exists: true, pipelineId });
}
