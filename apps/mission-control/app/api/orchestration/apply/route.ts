import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { addLog } from "@/lib/logs-storage";

const PROJECT_ROOT = process.cwd();

interface ApplyFile {
  filePath: string;
  content: string;
  language: string;
}

/**
 * POST /api/orchestration/apply
 * Writes parsed code blocks to the filesystem.
 * Accepts: { files: ApplyFile[], pipelineId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { files, pipelineId } = (await request.json()) as {
      files: ApplyFile[];
      pipelineId?: string;
    };

    if (!Array.isArray(files) || files.length === 0) {
      return NextResponse.json(
        { error: "No files to apply" },
        { status: 400 },
      );
    }

    const results: { filePath: string; status: "created" | "updated" | "error"; error?: string }[] = [];

    for (const file of files) {
      try {
        // Normalize path — keep within project
        const normalizedPath = file.filePath
          .replace(/\\/g, "/")
          .replace(/^\/+/, "");

        // Security: prevent path traversal
        if (normalizedPath.includes("..") || path.isAbsolute(normalizedPath)) {
          results.push({
            filePath: normalizedPath,
            status: "error",
            error: "Path traversal not allowed",
          });
          continue;
        }

        // Block writing to sensitive locations
        const blocked = ["node_modules/", ".env", "data/api-keys", ".git/"];
        if (blocked.some((b) => normalizedPath.startsWith(b) || normalizedPath.includes(b))) {
          results.push({
            filePath: normalizedPath,
            status: "error",
            error: "Writing to this path is blocked",
          });
          continue;
        }

        const fullPath = path.join(PROJECT_ROOT, normalizedPath);

        // Check if file exists (for created vs updated status)
        let existed = false;
        try {
          await fs.access(fullPath);
          existed = true;
        } catch {
          // File doesn't exist — will be created
        }

        // Ensure directory exists
        await fs.mkdir(path.dirname(fullPath), { recursive: true });

        // Write file
        await fs.writeFile(fullPath, file.content, "utf-8");

        results.push({
          filePath: normalizedPath,
          status: existed ? "updated" : "created",
        });
      } catch (err) {
        results.push({
          filePath: file.filePath,
          status: "error",
          error: err instanceof Error ? err.message : "Write failed",
        });
      }
    }

    const created = results.filter((r) => r.status === "created").length;
    const updated = results.filter((r) => r.status === "updated").length;
    const errors = results.filter((r) => r.status === "error").length;

    await addLog({
      type: "system",
      content: `Pipeline Auto-Apply${pipelineId ? ` [${pipelineId}]` : ""}: ${created} created, ${updated} updated, ${errors} errors out of ${files.length} files`,
    });

    return NextResponse.json({
      success: errors === 0,
      results,
      summary: { created, updated, errors, total: files.length },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Apply failed" },
      { status: 500 },
    );
  }
}
