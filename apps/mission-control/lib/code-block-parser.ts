/**
 * Parses code blocks from pipeline agent output.
 * Extracts file path, language, and content from markdown fenced code blocks.
 *
 * Supported formats:
 *   ```tsx title="components/Foo.tsx"
 *   ```typescript // components/Foo.tsx
 *   ```tsx
 *   // file: components/Foo.tsx
 *   ...code...
 *   ```
 */

export interface ParsedCodeBlock {
  filePath: string;
  language: string;
  content: string;
  startLine: number;
}

const FENCE_REGEX = /^```(\w+)?(?:\s+(?:title=["']([^"']+)["']|\/\/\s*(.+)))?\s*$/;
const FILE_COMMENT_REGEX =
  /^(?:\/\/|#|\/\*\*?|\{\/\*)\s*(?:file:|filepath:|path:)?\s*(\S+\.\w+)/i;

export function parseCodeBlocks(output: string): ParsedCodeBlock[] {
  const lines = output.split("\n");
  const blocks: ParsedCodeBlock[] = [];

  let i = 0;
  while (i < lines.length) {
    const fenceMatch = lines[i].match(FENCE_REGEX);
    if (!fenceMatch) {
      i++;
      continue;
    }

    const language = fenceMatch[1] || "text";
    let filePath = fenceMatch[2] || fenceMatch[3] || "";
    const startLine = i + 1;
    const contentLines: string[] = [];

    i++;
    while (i < lines.length && !lines[i].startsWith("```")) {
      contentLines.push(lines[i]);
      i++;
    }
    i++; // skip closing ```

    // Try to extract file path from first content line if not in fence
    if (!filePath && contentLines.length > 0) {
      const commentMatch = contentLines[0].match(FILE_COMMENT_REGEX);
      if (commentMatch) {
        filePath = commentMatch[1].trim();
        contentLines.shift(); // remove the path comment from content
      }
    }

    if (!filePath) continue; // skip blocks without identifiable file path

    // Clean up file path
    filePath = filePath.replace(/^['"]+|['"]+$/g, "").trim();

    blocks.push({
      filePath,
      language,
      content: contentLines.join("\n").trim(),
      startLine,
    });
  }

  return blocks;
}

/**
 * Guess file path from language + agent context if not explicitly provided.
 */
export function inferProjectPath(
  filePath: string,
  projectRoot: string,
): string {
  // If already absolute or starts with project structure hints, normalize
  const cleaned = filePath
    .replace(/^\/+/, "")
    .replace(/^src\//, "src/")
    .replace(/^app\//, "app/")
    .replace(/^components\//, "components/")
    .replace(/^lib\//, "lib/");

  return `${projectRoot}/${cleaned}`;
}
