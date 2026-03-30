import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addLog } from "@/lib/logs-storage";

const PROJECT_ROOT = process.cwd();
const STAGING_DIR = path.join(PROJECT_ROOT, "data", "applied");

// Ignored directories when searching for existing files
const SEARCH_IGNORE = new Set(["node_modules", ".next", ".git", "data", "dist", ".turbo"]);
const BLOCKED_PATHS = ["node_modules/", ".env", "data/api-keys", ".git/"];

type DeployStatus = "created" | "updated" | "skipped" | "error";

interface DeployResult {
  filePath: string;
  status: DeployStatus;
  error?: string;
  note?: string;
}

/** Validate pipelineId — no traversal or slashes */
function isValidPipelineId(id: string): boolean {
  return !!id && !id.includes("..") && !id.includes("/") && !id.includes("\\");
}

/** Ensure resolved path stays within PROJECT_ROOT */
function isSafePath(resolvedPath: string): boolean {
  const abs = path.resolve(PROJECT_ROOT, resolvedPath);
  return abs.startsWith(PROJECT_ROOT + path.sep) || abs === PROJECT_ROOT;
}

/**
 * Smart path resolution: if staged file has no directory (e.g. "globals.css"),
 * search the project for an existing file with that name and deploy there.
 * If multiple matches — pick the shallowest one.
 */
async function resolveSmartPath(filePath: string): Promise<string> {
  if (filePath.includes("/")) return filePath;

  const fileName = path.basename(filePath);
  const matches: { rel: string; depth: number }[] = [];

  async function search(dir: string, prefix: string, depth: number) {
    if (depth > 5) return;
    let entries;
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return; // skip unreadable dirs
    }
    for (const entry of entries) {
      if (SEARCH_IGNORE.has(entry.name)) continue;
      if (entry.isDirectory()) {
        await search(path.join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name, depth + 1);
      } else if (entry.name === fileName) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        matches.push({ rel, depth });
      }
    }
  }

  await search(PROJECT_ROOT, "", 0);

  if (matches.length === 1) return matches[0].rel;
  if (matches.length > 1) {
    matches.sort((a, b) => a.depth - b.depth);
    return matches[0].rel;
  }

  return filePath;
}

/**
 * POST /api/orchestration/deploy
 * Copies staged files from data/applied/{pipelineId}/ into the real project.
 * Smart path resolution for bare filenames. Overwrite protection with explicit allowlist.
 */
export async function POST(request: NextRequest) {
  try {
    const { pipelineId, files: selectedFiles, allowOverwrite } = (await request.json()) as {
      pipelineId: string;
      files?: string[];
      allowOverwrite?: string[];
    };

    if (!isValidPipelineId(pipelineId)) {
      return NextResponse.json({ error: "Invalid pipelineId" }, { status: 400 });
    }

    const stageDir = path.join(STAGING_DIR, pipelineId);

    try {
      await fs.access(stageDir);
    } catch {
      return NextResponse.json({ error: "No staged files for this pipeline" }, { status: 404 });
    }

    // Collect all staged files (depth-limited)
    const allFiles: string[] = [];
    async function walk(dir: string, prefix: string, depth: number) {
      if (depth > 10) return;
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) {
          await walk(path.join(dir, entry.name), rel, depth + 1);
        } else {
          allFiles.push(rel);
        }
      }
    }
    await walk(stageDir, "", 0);

    const filesToDeploy = selectedFiles && selectedFiles.length > 0
      ? allFiles.filter((f) => selectedFiles.includes(f))
      : allFiles;

    if (filesToDeploy.length === 0) {
      return NextResponse.json({ error: "No files to deploy" }, { status: 400 });
    }

    const results: DeployResult[] = [];

    for (const filePath of filesToDeploy) {
      try {
        const resolvedPath = await resolveSmartPath(filePath);

        // Security: absolute path normalization check
        if (!isSafePath(resolvedPath)) {
          results.push({ filePath: resolvedPath, status: "error", error: "Path outside project root" });
          continue;
        }

        if (BLOCKED_PATHS.some((b) => resolvedPath.startsWith(b) || resolvedPath.includes(b))) {
          results.push({ filePath: resolvedPath, status: "error", error: "Blocked path" });
          continue;
        }

        const srcPath = path.join(stageDir, filePath);
        const destPath = path.resolve(PROJECT_ROOT, resolvedPath);

        let existed = false;
        try {
          await fs.access(destPath);
          existed = true;
        } catch { /* new file */ }

        // Overwrite check — compare against BOTH raw and resolved paths
        if (existed && (!allowOverwrite || (!allowOverwrite.includes(filePath) && !allowOverwrite.includes(resolvedPath)))) {
          results.push({ filePath: resolvedPath, status: "skipped", error: `File exists at ${resolvedPath} — click Overwrite to replace` });
          continue;
        }

        await fs.mkdir(path.dirname(destPath), { recursive: true });

        const content = await fs.readFile(srcPath, "utf-8");
        await fs.writeFile(destPath, content, "utf-8");

        const note = resolvedPath !== filePath ? `resolved: ${filePath} → ${resolvedPath}` : undefined;
        results.push({ filePath: resolvedPath, status: existed ? "updated" : "created", note });
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
    const skipped = results.filter((r) => r.status === "skipped").length;
    const errors = results.filter((r) => r.status === "error").length;

    await addLog({
      type: "system",
      content: `Pipeline Deploy [${pipelineId}]: ${created} created, ${updated} updated, ${skipped} skipped, ${errors} errors`,
    });

    return NextResponse.json({
      success: errors === 0 && (created > 0 || updated > 0),
      results,
      summary: { created, updated, skipped, errors, total: filesToDeploy.length },
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

  if (!pipelineId || !isValidPipelineId(pipelineId)) {
    return NextResponse.json({ error: "Invalid pipelineId" }, { status: 400 });
  }

  const stageDir = path.join(STAGING_DIR, pipelineId);

  try {
    await fs.rm(stageDir, { recursive: true, force: true });
  } catch { /* already gone */ }

  return NextResponse.json({ success: true });
}
