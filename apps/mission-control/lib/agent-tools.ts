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
] as const;

// Read-only subset for agents that shouldn't write
export const READ_ONLY_TOOLS = AGENT_TOOLS.filter(
  (t) => t.name === "list_files" || t.name === "read_file",
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
  try {
    switch (name) {
      case "list_files": {
        const relPath = validatePath(input.path || ".");
        const fullPath = path.join(PROJECT_ROOT, relPath);
        const entries = await fs.readdir(fullPath, { withFileTypes: true });
        const listing = entries
          .map((e) => `${e.isDirectory() ? "[dir] " : "      "}${e.name}`)
          .join("\n");
        return { success: true, output: listing || "(empty directory)" };
      }

      case "read_file": {
        const relPath = validatePath(input.path);
        const fullPath = path.join(PROJECT_ROOT, relPath);
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
        // If staging dir provided, write to staging. Otherwise edit in-place.
        const readPath = path.join(PROJECT_ROOT, relPath);
        const content = await fs.readFile(readPath, "utf-8");

        if (!content.includes(input.old_string)) {
          return { success: false, output: "", error: "old_string not found in file. Use read_file to check exact content." };
        }

        const occurrences = content.split(input.old_string).length - 1;
        if (occurrences > 1) {
          return { success: false, output: "", error: `old_string found ${occurrences} times — must be unique. Provide more context.` };
        }

        const newContent = content.replace(input.old_string, input.new_string);
        const writePath = stagingDir
          ? path.join(stagingDir, relPath)
          : path.join(PROJECT_ROOT, relPath);
        await fs.mkdir(path.dirname(writePath), { recursive: true });
        await fs.writeFile(writePath, newContent, "utf-8");

        return { success: true, output: `Edited ${relPath} (${input.old_string.length} chars → ${input.new_string.length} chars)` };
      }

      case "create_file": {
        const relPath = validatePath(input.path);
        const writePath = stagingDir
          ? path.join(stagingDir, relPath)
          : path.join(PROJECT_ROOT, relPath);

        // Check if file exists in project (not in staging)
        try {
          await fs.access(path.join(PROJECT_ROOT, relPath));
          return { success: false, output: "", error: "File already exists. Use edit_file to modify it." };
        } catch {
          // Good — file doesn't exist
        }

        await fs.mkdir(path.dirname(writePath), { recursive: true });
        await fs.writeFile(writePath, input.content, "utf-8");
        return { success: true, output: `Created ${relPath} (${input.content.length} chars)` };
      }

      case "run_command": {
        validateCommand(input.command);
        try {
          const { stdout, stderr } = await execAsync(input.command, {
            cwd: PROJECT_ROOT,
            timeout: 30000,
          });
          const output = (stdout + (stderr ? `\nSTDERR:\n${stderr}` : "")).substring(0, 10000);
          return { success: true, output: output || "(no output)" };
        } catch (err: any) {
          const output = ((err.stdout || "") + "\n" + (err.stderr || "")).substring(0, 10000);
          return { success: false, output, error: `Exit code ${err.code}` };
        }
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
