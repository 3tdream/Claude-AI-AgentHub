import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addLog } from "@/lib/logs-storage";

const PROJECT_ROOT = process.cwd();
const STAGING_DIR = path.join(PROJECT_ROOT, "data", "applied");

/**
 * POST /api/orchestration/deploy
 * Copies staged files from data/applied/{pipelineId}/ into the real project.
 * Accepts: { pipelineId: string, files?: string[] }
 * If files[] provided — deploys only those; otherwise deploys all staged files.
 */
export async function POST(request: NextRequest) {
  try {
    const { pipelineId, files: selectedFiles } = (await request.json()) as {
      pipelineId: string;
      files?: string[];
    };

    if (!pipelineId) {
      return NextResponse.json({ error: "pipelineId required" }, { status: 400 });
    }

    const stageDir = path.join(STAGING_DIR, pipelineId);

    try {
      await fs.access(stageDir);
    } catch {
      return NextResponse.json({ error: "No staged files for this pipeline" }, { status: 404 });
    }

    // Collect all staged files
    const allFiles: string[] = [];
    async function walk(dir: string, prefix: string) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walk(path.join(dir, entry.name), rel);
        } else {
          allFiles.push(rel);
        }
      }
    }
    await walk(stageDir, "");

    // Filter if specific files requested
    const filesToDeploy = selectedFiles && selectedFiles.length > 0
      ? allFiles.filter((f) => selectedFiles.includes(f))
      : allFiles;

    if (filesToDeploy.length === 0) {
      return NextResponse.json({ error: "No files to deploy" }, { status: 400 });
    }

    const results: { filePath: string; status: "created" | "updated" | "error"; error?: string }[] = [];

    for (const filePath of filesToDeploy) {
      try {
        // Security: double-check path
        if (filePath.includes("..") || path.isAbsolute(filePath)) {
          results.push({ filePath, status: "error", error: "Path traversal not allowed" });
          continue;
        }

        const blocked = ["node_modules/", ".env", "data/api-keys", ".git/"];
        if (blocked.some((b) => filePath.startsWith(b) || filePath.includes(b))) {
          results.push({ filePath, status: "error", error: "Blocked path" });
          continue;
        }

        const srcPath = path.join(stageDir, filePath);
        const destPath = path.join(PROJECT_ROOT, filePath);

        // Check if target exists
        let existed = false;
        try {
          await fs.access(destPath);
          existed = true;
        } catch {
          // new file
        }

        // Ensure target directory exists
        await fs.mkdir(path.dirname(destPath), { recursive: true });

        // Copy file
        const content = await fs.readFile(srcPath, "utf-8");
        await fs.writeFile(destPath, content, "utf-8");

        results.push({ filePath, status: existed ? "updated" : "created" });
      } catch (err) {
        results.push({
          filePath,
          status: "error",
          error: err instanceof Error ? err.message : "Deploy failed",
        });
      }
    }

    const created = results.filter((r) => r.status === "created").length;
    const updated = results.filter((r) => r.status === "updated").length;
    const errors = results.filter((r) => r.status === "error").length;

    await addLog({
      type: "system",
      content: `Pipeline Deploy [${pipelineId}]: ${created} created, ${updated} updated, ${errors} errors — deployed ${filesToDeploy.length}/${allFiles.length} files to project`,
    });

    return NextResponse.json({
      success: errors === 0,
      results,
      summary: { created, updated, errors, total: filesToDeploy.length },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Deploy failed" },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/orchestration/deploy?pipelineId=xxx
 * Removes a staging directory.
 */
export async function DELETE(request: NextRequest) {
  const pipelineId = request.nextUrl.searchParams.get("pipelineId");
  if (!pipelineId) {
    return NextResponse.json({ error: "pipelineId required" }, { status: 400 });
  }

  // Security
  if (pipelineId.includes("..") || pipelineId.includes("/")) {
    return NextResponse.json({ error: "Invalid pipelineId" }, { status: 400 });
  }

  const stageDir = path.join(STAGING_DIR, pipelineId);

  try {
    await fs.rm(stageDir, { recursive: true, force: true });
  } catch {
    // already gone
  }

  return NextResponse.json({ success: true });
}
