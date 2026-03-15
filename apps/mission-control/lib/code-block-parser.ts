/**
 * Parses pipeline agent output for file definitions.
 *
 * Primary: JSON format {"files": [{"path", "action", "content"}]}
 * Fallback: markdown fenced code blocks with file path comments
 */

export interface ParsedCodeBlock {
  filePath: string;
  action: "create" | "modify";
  language: string;
  content: string;
}

/**
 * Try to parse structured JSON output first.
 * Looks for ```json ... ``` containing {"files": [...]}
 * Falls back to legacy markdown code block parsing.
 */
export function parseCodeBlocks(output: string): ParsedCodeBlock[] {
  // --- Try JSON format first ---
  const jsonResult = parseJsonOutput(output);
  if (jsonResult.length > 0) return jsonResult;

  // --- Fallback: legacy markdown code blocks ---
  return parseLegacyCodeBlocks(output);
}

function parseJsonOutput(output: string): ParsedCodeBlock[] {
  // Extract JSON from ```json ... ``` fence
  const jsonFenceMatch = output.match(/```json\s*\n([\s\S]*?)\n```/);
  if (jsonFenceMatch) {
    try {
      const parsed = JSON.parse(jsonFenceMatch[1]);
      if (parsed?.files && Array.isArray(parsed.files)) {
        return parsed.files
          .filter((f: any) => f.path && f.content)
          .map((f: any) => ({
            filePath: cleanPath(f.path),
            action: f.action === "modify" ? "modify" : "create",
            language: guessLanguage(f.path),
            content: f.content,
          }));
      }
    } catch {
      // JSON parse failed — fall through to legacy
    }
  }

  // Try bare JSON (no fence)
  const bareJsonMatch = output.match(/\{"files"\s*:\s*\[[\s\S]*?\]\s*\}/);
  if (bareJsonMatch) {
    try {
      const parsed = JSON.parse(bareJsonMatch[0]);
      if (parsed?.files && Array.isArray(parsed.files)) {
        return parsed.files
          .filter((f: any) => f.path && f.content)
          .map((f: any) => ({
            filePath: cleanPath(f.path),
            action: f.action === "modify" ? "modify" : "create",
            language: guessLanguage(f.path),
            content: f.content,
          }));
      }
    } catch {
      // fall through
    }
  }

  return [];
}

function parseLegacyCodeBlocks(output: string): ParsedCodeBlock[] {
  const lines = output.split("\n");
  const blocks: ParsedCodeBlock[] = [];
  const FENCE_REGEX = /^```(\w+)?(?:\s+(?:title=["']([^"']+)["']|\/\/\s*(.+)))?\s*$/;
  const FILE_COMMENT_REGEX =
    /^(?:\/\/|#|\/\*\*?|\{\/\*)\s*(?:file:|filepath:|path:)?\s*(\S+\.\w+)/i;

  let i = 0;
  while (i < lines.length) {
    const fenceMatch = lines[i].match(FENCE_REGEX);
    if (!fenceMatch) {
      i++;
      continue;
    }

    const language = fenceMatch[1] || "text";
    let filePath = fenceMatch[2] || fenceMatch[3] || "";
    const contentLines: string[] = [];

    i++;
    while (i < lines.length && !lines[i].startsWith("```")) {
      contentLines.push(lines[i]);
      i++;
    }
    i++;

    if (!filePath && contentLines.length > 0) {
      const commentMatch = contentLines[0].match(FILE_COMMENT_REGEX);
      if (commentMatch) {
        filePath = commentMatch[1].trim();
        contentLines.shift();
      }
    }

    if (!filePath) continue;
    filePath = cleanPath(filePath);

    blocks.push({
      filePath,
      action: "create",
      language,
      content: contentLines.join("\n").trim(),
    });
  }

  return blocks;
}

function cleanPath(p: string): string {
  return p
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .trim();
}

function guessLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    json: "json",
    css: "css",
    md: "markdown",
    sql: "sql",
    yaml: "yaml",
    yml: "yaml",
  };
  return map[ext] || ext || "text";
}
