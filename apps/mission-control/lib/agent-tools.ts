/**
 * Agent Tool-Belt — file system tools for pipeline agents.
 * Tools execute server-side with safety constraints.
 */

import { promises as fs } from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const PROJECT_ROOT = process.cwd();

/**
 * Quick syntax check after edit/create.
 * For .ts/.tsx: checks basic syntax (unterminated strings, unmatched braces).
 * Returns null if OK, error string if broken.
 */
async function quickSyntaxCheck(filePath: string): Promise<string | null> {
  const ext = path.extname(filePath);
  if (![".ts", ".tsx", ".js", ".jsx"].includes(ext)) return null;

  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Check 1: Unterminated string literals (basic heuristic)
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip comment lines
      if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;
      // Count unescaped quotes
      const singleQuotes = (line.match(/(?<!\\)'/g) || []).length;
      const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;
      const backticks = (line.match(/(?<!\\)`/g) || []).length;
      // Odd number of quotes on a line (excluding template literals which can span lines)
      if (singleQuotes % 2 !== 0 && !line.includes("`")) {
        // Check it's not a line continuation
        const nextLine = lines[i + 1] || "";
        if (!nextLine.trimStart().startsWith("import") && !nextLine.trimStart().startsWith("export")) continue;
        return `Line ${i + 1}: possible unterminated string (odd single quotes)`;
      }
    }

    // Check 2: Import inside non-import block (agent inserted code between imports)
    let pastImports = false;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trimStart();
      if (trimmed.startsWith("import ") && pastImports) {
        // Import after non-import code — likely corrupted
        // Allow: dynamic imports, type imports after code are OK in some patterns
        if (!trimmed.includes("import(") && !trimmed.includes("import type")) {
          return `Line ${i + 1}: import statement found after code block — file may be corrupted`;
        }
      }
      if (trimmed && !trimmed.startsWith("import ") && !trimmed.startsWith("//") && !trimmed.startsWith("'use ") && !trimmed.startsWith('"use ') && trimmed !== "" && !trimmed.startsWith("*") && !trimmed.startsWith("/*")) {
        pastImports = true;
      }
    }

    // Check 3: Brace balance
    let braces = 0;
    for (const char of content) {
      if (char === "{") braces++;
      if (char === "}") braces--;
      if (braces < 0) return "Unmatched closing brace }";
    }
    if (braces > 2) return `${braces} unclosed braces { — likely truncated or corrupted`;

    return null; // OK
  } catch {
    return null; // Can't read file, skip check
  }
}

// --- Tool definitions for Anthropic API ---

export const AGENT_TOOLS = [
  {
    name: "list_files",
    description: "List files and directories in a given path. Returns file names with type indicators (file/dir).",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Relative path from project root. Use '.' for root. Example: 'app/(shell)/orchestration'",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "read_file",
    description: "Read a file's content. For large files (>100 lines), use line_start/line_end to read only the section you need. First call without line params to see total line count, then read specific sections.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Relative path to file. Example: 'lib/stores/orchestration-store.ts'",
        },
        line_start: {
          type: "number",
          description: "Start line (1-based). Omit to read from beginning.",
        },
        line_end: {
          type: "number",
          description: "End line (inclusive). Omit to read to end. Max 200 lines per call.",
        },
      },
      required: ["path"],
    },
  },
  {
    name: "edit_file",
    description: "Replace a specific string in a file with new content. The old_string must be an exact match (unique in the file). Use read_file first to get the exact content.",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Relative path to file to edit",
        },
        old_string: {
          type: "string",
          description: "Exact string to find and replace (must be unique in file)",
        },
        new_string: {
          type: "string",
          description: "Replacement string",
        },
      },
      required: ["path", "old_string", "new_string"],
    },
  },
  {
    name: "create_file",
    description: "Create a new file with the given content. Will fail if file already exists (use edit_file instead).",
    input_schema: {
      type: "object" as const,
      properties: {
        path: {
          type: "string",
          description: "Relative path for new file",
        },
        content: {
          type: "string",
          description: "File content",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "run_command",
    description: "Run a shell command for verification (e.g. type-checking). Only allowed: tsc, eslint, grep. Max 30s timeout.",
    input_schema: {
      type: "object" as const,
      properties: {
        command: {
          type: "string",
          description: "Command to run. Example: 'npx tsc --noEmit --pretty'",
        },
      },
      required: ["command"],
    },
  },
  {
    name: "save_failure_pattern",
    description: "Record a failure pattern in the knowledge base. Use this when you find a critical bug, architectural violation, or code that breaks existing functionality. This helps future pipeline runs avoid the same mistake.",
    input_schema: {
      type: "object" as const,
      properties: {
        category: {
          type: "string",
          enum: ["bad-code", "wrong-approach", "broke-something", "security", "performance"],
          description: "Category of the failure",
        },
        title: {
          type: "string",
          description: "Short title of the failure pattern (1 line)",
        },
        symptoms: {
          type: "string",
          description: "What went wrong — observable symptoms",
        },
        root_cause: {
          type: "string",
          description: "Why it happened — technical root cause",
        },
        solution: {
          type: "string",
          description: "How to fix it and prevent recurrence",
        },
        affected_files: {
          type: "string",
          description: "Comma-separated list of affected file paths",
        },
      },
      required: ["category", "title", "symptoms", "root_cause", "solution"],
    },
  },
] as const;

// Read-only + save_failure_pattern (Architect, Cyber, DevOps)
export const READ_ONLY_TOOLS = AGENT_TOOLS.filter(
  (t) => t.name === "list_files" || t.name === "read_file" || t.name === "save_failure_pattern",
);

// QA tools: read-only + save_failure_pattern + run_command
export const QA_TOOLS = AGENT_TOOLS.filter(
  (t) => t.name === "list_files" || t.name === "read_file" || t.name === "run_command" || t.name === "save_failure_pattern",
);

// --- Security ---

const BLOCKED_PATHS = ["node_modules", ".env", ".git", "data/api-keys"];
const ALLOWED_COMMANDS = ["tsc", "eslint", "grep", "cat", "head", "wc"];

function validatePath(p: string): string {
  const cleaned = p.replace(/\\/g, "/").replace(/^\/+/, "");
  if (cleaned.includes("..")) throw new Error("Path traversal not allowed");
  if (path.isAbsolute(cleaned)) throw new Error("Absolute paths not allowed");
  if (BLOCKED_PATHS.some((b) => cleaned.startsWith(b) || cleaned.includes(`/${b}`))) {
    throw new Error(`Access to ${cleaned} is blocked`);
  }
  return cleaned;
}

function validateCommand(cmd: string): void {
  const first = cmd.trim().split(/\s+/)[0].replace(/^npx\s+/, "");
  if (!ALLOWED_COMMANDS.some((a) => first.includes(a))) {
    throw new Error(`Command not allowed: ${first}. Allowed: ${ALLOWED_COMMANDS.join(", ")}`);
  }
}

// --- Tool execution ---

export interface ToolResult {
  success: boolean;
  output: string;
  error?: string;
}

export async function executeTool(
  name: string,
  input: Record<string, string>,
  stagingDir?: string,
): Promise<ToolResult> {
  // Use project path when provided (for cross-project pipeline execution)
  const ROOT = stagingDir || PROJECT_ROOT;
  try {
    switch (name) {
      case "list_files": {
        const relPath = validatePath(input.path || ".");
        const fullPath = path.join(ROOT, relPath);
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        const listing = entries
          .map((e) => `${e.isDirectory() ? "[dir] " : "      "}${e.name}`)
          .join("\n");
        return { success: true, output: listing || "(empty directory)" };
      }

      case "read_file": {
        const relPath = validatePath(input.path);
        const fullPath = path.join(ROOT, relPath);
        const content = await fs.readFile(fullPath, "utf-8");
        const lines = content.split("\n");
        const totalLines = lines.length;

        const lineStart = Math.max(1, parseInt(input.line_start as any) || 1);
        const lineEnd = Math.min(totalLines, parseInt(input.line_end as any) || totalLines);
        const maxLines = 200;

        // If file is large and no line range specified, return summary + first 100 lines
        if (totalLines > 100 && !input.line_start && !input.line_end) {
          const preview = lines.slice(0, 100).map((l, i) => `${i + 1}\t${l}`).join("\n");
          return {
            success: true,
            output: `File: ${relPath} (${totalLines} lines)\n--- Lines 1-100 of ${totalLines} ---\n${preview}\n\n... (${totalLines - 100} more lines. Use line_start/line_end to read specific sections)`,
          };
        }

        // Clamp range to maxLines
        const effectiveEnd = Math.min(lineEnd, lineStart + maxLines - 1);
        const slice = lines.slice(lineStart - 1, effectiveEnd).map((l, i) => `${lineStart + i}\t${l}`).join("\n");

        let header = `File: ${relPath} (${totalLines} lines)`;
        if (lineStart > 1 || effectiveEnd < totalLines) {
          header += ` — showing lines ${lineStart}-${effectiveEnd}`;
        }
        const truncNote = effectiveEnd < lineEnd ? `\n\n... (truncated at ${maxLines} lines per call)` : "";

        return { success: true, output: `${header}\n${slice}${truncNote}` };
      }

      case "edit_file": {
        const relPath = validatePath(input.path);
        const readPath = path.join(ROOT, relPath);
        const content = await fs.readFile(readPath, "utf-8");

        if (!content.includes(input.old_string)) {
          return { success: false, output: "", error: "old_string not found in file. Use read_file to check exact content." };
        }

        const occurrences = content.split(input.old_string).length - 1;
        if (occurrences > 1) {
          return { success: false, output: "", error: `old_string found ${occurrences} times — must be unique. Provide more context.` };
        }

        // Speed Governor: hard limit on diff size (soft limits per-agent via prompts)
        const oldLines = input.old_string.split("\n").length;
        const newLines = input.new_string.split("\n").length;
        const diffLines = Math.abs(newLines - oldLines) + Math.min(oldLines, newLines);
        const HARD_DIFF_LIMIT = 250;
        if (diffLines > HARD_DIFF_LIMIT) {
          return { success: false, output: "", error: `Edit too large: ${diffLines} lines (hard limit ${HARD_DIFF_LIMIT}). Break into smaller edits.` };
        }

        const newContent = content.replace(input.old_string, input.new_string);
        const writePath = path.join(ROOT, relPath);
        await fs.mkdir(path.dirname(writePath), { recursive: true });
        await fs.writeFile(writePath, newContent, "utf-8");

        // Post-edit syntax check — auto-revert if broken
        const syntaxError = await quickSyntaxCheck(writePath);
        if (syntaxError) {
          await fs.writeFile(writePath, content, "utf-8"); // Revert
          return { success: false, output: "", error: `Edit reverted — syntax check failed: ${syntaxError}. Your edit broke the file. Try a smaller, more precise edit.` };
        }

        return { success: true, output: `Edited ${relPath} (+${newLines - oldLines} lines, ${diffLines} lines touched)` };
      }

      case "create_file": {
        const relPath = validatePath(input.path);
        const writePath = path.join(ROOT, relPath);

        // Check if file exists — guide agent to use edit_file instead
        try {
          await fs.access(path.join(ROOT, relPath));
          const existing = await fs.readFile(path.join(ROOT, relPath), "utf-8");
          const preview = existing.substring(0, 2000);
          return {
            success: false, output: preview,
            error: `File already exists (${existing.split("\n").length} lines). Use edit_file to modify it. Here is the current content for your old_string reference.`,
          };
        } catch {
          // Good — file doesn't exist
        }

        // Speed Governor: limit new file size
        const fileLines = input.content.split("\n").length;
        const MAX_NEW_FILE_LINES = 120;
        if (fileLines > MAX_NEW_FILE_LINES) {
          return { success: false, output: "", error: `New file too large: ${fileLines} lines (max ${MAX_NEW_FILE_LINES}). Create a minimal working version first. Add complexity in follow-up edits.` };
        }

        await fs.mkdir(path.dirname(writePath), { recursive: true });
        await fs.writeFile(writePath, input.content, "utf-8");

        // Post-create syntax check
        const createSyntaxError = await quickSyntaxCheck(writePath);
        if (createSyntaxError) {
          await fs.unlink(writePath).catch(() => {}); // Remove broken file
          return { success: false, output: "", error: `File not created — syntax check failed: ${createSyntaxError}. Fix the content and try again.` };
        }

        return { success: true, output: `Created ${relPath} (${fileLines} lines)` };
      }

      case "run_command": {
        validateCommand(input.command);
        try {
          // Fix Windows: replace npx tsc with direct path to avoid shell crashes
          let cmd = input.command;
          if (cmd.includes("npx tsc")) {
            cmd = cmd.replace("npx tsc", "node node_modules/typescript/bin/tsc");
          }
          const { stdout, stderr } = await execAsync(cmd, {
            cwd: ROOT,
            timeout: 30000,
            shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
          });
          const output = (stdout + (stderr ? `\nSTDERR:\n${stderr}` : "")).substring(0, 10000);
          return { success: true, output: output || "(no output)" };
        } catch (err: any) {
          const output = ((err.stdout || "") + "\n" + (err.stderr || "")).substring(0, 10000);
          return { success: false, output, error: `Exit code ${err.code}` };
        }
      }

      case "save_failure_pattern": {
        const patternsPath = path.join(PROJECT_ROOT, "projects", "mission-control", "knowledge-base", "failure-patterns.json");
        let data: { patterns: any[]; [key: string]: any };
        try {
          const raw = await fs.readFile(patternsPath, "utf-8");
          data = JSON.parse(raw);
        } catch {
          data = { _description: "Known issues", _updated: "", patterns: [] };
        }

        const maxId = data.patterns
          .map((p: any) => parseInt(p.id?.replace("FAIL-", "") || "0"))
          .reduce((a: number, b: number) => Math.max(a, b), 0);
        const newId = `FAIL-${String(maxId + 1).padStart(3, "0")}`;

        data.patterns.push({
          id: newId,
          category: input.category,
          title: input.title,
          symptoms: input.symptoms,
          root_cause: input.root_cause,
          solution: input.solution,
          date_discovered: new Date().toISOString().slice(0, 10),
          recurrence: "Discovered by QA-Agent",
          source: "qa-agent",
          affected_files: input.affected_files?.split(",").map((f: string) => f.trim()) || [],
        });
        data._updated = new Date().toISOString().slice(0, 10);

        await fs.writeFile(patternsPath, JSON.stringify(data, null, 2), "utf-8");
        return { success: true, output: `Saved failure pattern ${newId}: ${input.title}` };
      }

      default:
        return { success: false, output: "", error: `Unknown tool: ${name}` };
    }
  } catch (err) {
    return {
      success: false,
      output: "",
      error: err instanceof Error ? err.message : "Tool execution failed",
    };
  }
}
