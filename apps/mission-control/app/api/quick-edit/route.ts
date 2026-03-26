import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const APPS_DIR = path.resolve(process.cwd(), "..");

/**
 * POST /api/quick-edit/search — find text in project files
 * Body: { query: string, projectId?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const { action, query, projectId, filePath, oldText, newText } = await req.json();

    const root = projectId ? path.join(APPS_DIR, projectId) : process.cwd();

    if (action === "search") {
      if (!query) return NextResponse.json({ error: "query required" }, { status: 400 });

      // Search for text across project files
      const results = await searchFiles(root, query, 20);
      return NextResponse.json({ data: results });
    }

    if (action === "preview") {
      if (!filePath || !oldText || !newText) {
        return NextResponse.json({ error: "filePath, oldText, newText required" }, { status: 400 });
      }

      const fullPath = path.join(root, filePath);
      const content = await fs.readFile(fullPath, "utf-8");

      if (!content.includes(oldText)) {
        return NextResponse.json({ error: "Text not found in file" }, { status: 404 });
      }

      const occurrences = content.split(oldText).length - 1;
      const lineNum = content.substring(0, content.indexOf(oldText)).split("\n").length;

      return NextResponse.json({
        data: {
          filePath,
          lineNumber: lineNum,
          occurrences,
          context: getContext(content, oldText, 3),
          preview: content.replace(oldText, newText).substring(
            Math.max(0, content.indexOf(oldText) - 200),
            content.indexOf(oldText) + oldText.length + 200,
          ),
        },
      });
    }

    if (action === "apply") {
      if (!filePath || !oldText || !newText) {
        return NextResponse.json({ error: "filePath, oldText, newText required" }, { status: 400 });
      }

      const fullPath = path.join(root, filePath);
      const content = await fs.readFile(fullPath, "utf-8");

      if (!content.includes(oldText)) {
        return NextResponse.json({ error: "Text not found — file may have changed" }, { status: 404 });
      }

      const occurrences = content.split(oldText).length - 1;
      if (occurrences > 1) {
        return NextResponse.json({
          error: `Found ${occurrences} occurrences — must be unique. Provide more context.`,
        }, { status: 400 });
      }

      // Apply edit
      const newContent = content.replace(oldText, newText);
      await fs.writeFile(fullPath, newContent, "utf-8");

      return NextResponse.json({
        data: {
          success: true,
          filePath,
          linesChanged: newText.split("\n").length - oldText.split("\n").length,
        },
      });
    }

    return NextResponse.json({ error: "Invalid action. Use: search, preview, apply" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// ── Helpers ──

async function searchFiles(
  root: string,
  query: string,
  maxResults: number,
): Promise<{ filePath: string; lineNumber: number; line: string; context: string }[]> {
  const results: { filePath: string; lineNumber: number; line: string; context: string }[] = [];
  const skip = new Set(["node_modules", ".next", "dist", ".git", "data"]);

  async function walk(dir: string, relDir: string) {
    if (results.length >= maxResults) return;
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (results.length >= maxResults) return;
        if (skip.has(entry.name) || entry.name.startsWith(".")) continue;

        const full = path.join(dir, entry.name);
        const rel = relDir ? `${relDir}/${entry.name}` : entry.name;

        if (entry.isDirectory()) {
          await walk(full, rel);
        } else if (/\.(tsx?|jsx?|css|json|md)$/.test(entry.name)) {
          try {
            const content = await fs.readFile(full, "utf-8");
            const lines = content.split("\n");
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes(query)) {
                results.push({
                  filePath: rel,
                  lineNumber: i + 1,
                  line: lines[i].trim().substring(0, 120),
                  context: lines.slice(Math.max(0, i - 1), i + 2).join("\n"),
                });
                if (results.length >= maxResults) return;
              }
            }
          } catch { /* skip binary/unreadable */ }
        }
      }
    } catch { /* permission error */ }
  }

  await walk(root, "");
  return results;
}

function getContext(content: string, target: string, lines: number): string {
  const idx = content.indexOf(target);
  if (idx === -1) return "";
  const before = content.substring(0, idx).split("\n");
  const after = content.substring(idx + target.length).split("\n");
  const targetLines = target.split("\n");
  return [
    ...before.slice(-lines),
    ...targetLines,
    ...after.slice(0, lines),
  ].join("\n");
}
