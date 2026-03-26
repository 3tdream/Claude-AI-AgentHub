/**
 * Failure Investigator
 *
 * Analyzes WHY a pipeline stage failed BEFORE retry.
 * Returns diagnosis + corrective instructions for the retry prompt.
 *
 * Investigation checks:
 * 1. Wrong directory (grep/read found nothing)
 * 2. No edits made (implementation agent read-only loop)
 * 3. Truncation (output cut mid-file)
 * 4. Tool errors (permission, missing file)
 * 5. Score too low (quality issue, not crash)
 * 6. KB pattern match (known failure mode)
 */

import type { KBEntry } from "@/types";

export interface Investigation {
  /** What went wrong */
  diagnosis: string;
  /** Category of failure */
  category: "wrong_directory" | "no_edits" | "truncation" | "tool_error" | "low_quality" | "unknown";
  /** Severity */
  severity: "fixable" | "needs_context" | "fundamental";
  /** Corrective instructions to prepend to retry prompt */
  correction: string;
  /** Should retry? */
  shouldRetry: boolean;
  /** KB patterns that match this failure */
  matchedKBPatterns: string[];
}

interface StepResult {
  status: string;
  output?: string;
  error?: string;
  toolCalls?: { name: string; input: Record<string, string>; output: string; success: boolean }[];
  toolCallCount?: number;
}

export function investigateFailure(
  stepId: string,
  agentId: string,
  stepResult: StepResult,
  evaluationFeedback: string | undefined,
  projectPath: string | undefined,
  kbEntries: KBEntry[] = [],
): Investigation {
  const output = stepResult.output || "";
  const error = stepResult.error || "";
  const tools = stepResult.toolCalls || [];
  const toolCount = stepResult.toolCallCount || tools.length;

  const matchedKB: string[] = [];

  // Check KB for matching patterns
  const agentShort = agentId.replace("-agent", "");
  for (const entry of kbEntries) {
    if (entry.severity === "critical" || entry.severity === "high") {
      if (entry.agentId === agentId || entry.tags.includes(agentShort) || entry.source === stepId) {
        matchedKB.push(entry.title);
      }
    }
  }

  // ── Check 1: Wrong directory ──
  const grepCalls = tools.filter((t) => t.name === "run_command" && t.input.command?.includes("grep"));
  const readCalls = tools.filter((t) => t.name === "read_file");
  const editCalls = tools.filter((t) => t.name === "edit_file" || t.name === "create_file");

  const allGrepsFailed = grepCalls.length > 0 && grepCalls.every((t) => !t.output || t.output.trim().length < 10);
  const readsFoundWrongFiles = readCalls.some((t) => {
    const filePath = t.input.path || "";
    // If project is secretutka but agent reads mission-control files
    return projectPath && !filePath.includes(projectPath.split("/").pop() || "___");
  });

  if (allGrepsFailed && editCalls.length === 0) {
    return {
      diagnosis: `Agent searched ${grepCalls.length} times but found nothing. Likely working in wrong directory.${projectPath ? ` Target project: ${projectPath}` : ""}`,
      category: "wrong_directory",
      severity: "fixable",
      correction: `[INVESTIGATION RESULT: Your previous attempt failed because you searched in the wrong directory.
Your working directory is: ${projectPath || "the target project"}.
All file paths are relative to this directory.
Start with: list_files . — to see the project structure.
Then grep for the relevant component.]`,
      shouldRetry: true,
      matchedKBPatterns: matchedKB,
    };
  }

  // ── Check 2: No edits made ──
  if (error?.includes("did not call edit_file or create_file") || (editCalls.length === 0 && toolCount > 0)) {
    const readFiles = readCalls.map((t) => t.input.path).filter(Boolean);
    return {
      diagnosis: `Agent made ${toolCount} tool calls (${readCalls.length} reads, ${grepCalls.length} greps) but 0 edits. Got stuck in read-only loop.${readFiles.length > 0 ? ` Files read: ${readFiles.join(", ")}` : ""}`,
      category: "no_edits",
      severity: "fixable",
      correction: `[INVESTIGATION RESULT: Your previous attempt read files but made NO edits. This is not acceptable.
${readFiles.length > 0 ? `You already read: ${readFiles.join(", ")}` : ""}
Your FIRST action must be edit_file or create_file.
Do NOT read more files. Use the information from your previous attempt to make the edit NOW.]`,
      shouldRetry: true,
      matchedKBPatterns: matchedKB,
    };
  }

  // ── Check 3: Truncation ──
  if (output && (output.endsWith("...") || output.length > 15000 || /truncat/i.test(evaluationFeedback || ""))) {
    return {
      diagnosis: "Output appears truncated. Agent may have hit token limit.",
      category: "truncation",
      severity: "fixable",
      correction: `[INVESTIGATION RESULT: Your previous output was truncated. Keep your response shorter. Focus on the specific edit needed — do NOT explain the whole codebase.]`,
      shouldRetry: true,
      matchedKBPatterns: matchedKB,
    };
  }

  // ── Check 4: Tool errors ──
  const failedTools = tools.filter((t) => !t.success);
  if (failedTools.length > tools.length / 2 && tools.length > 0) {
    const errors = failedTools.map((t) => `${t.name}: ${t.output?.substring(0, 50)}`).join("; ");
    return {
      diagnosis: `${failedTools.length}/${tools.length} tool calls failed. Errors: ${errors}`,
      category: "tool_error",
      severity: "needs_context",
      correction: `[INVESTIGATION RESULT: Multiple tool calls failed in previous attempt. Errors: ${errors}. Try different file paths or approach.]`,
      shouldRetry: true,
      matchedKBPatterns: matchedKB,
    };
  }

  // ── Check 5: Low quality score ──
  if (evaluationFeedback && stepResult.status === "retrying") {
    return {
      diagnosis: `Quality evaluation failed. Feedback: ${evaluationFeedback.substring(0, 200)}`,
      category: "low_quality",
      severity: "fixable",
      correction: `[INVESTIGATION RESULT: Previous output scored too low. Evaluator feedback: "${evaluationFeedback.substring(0, 300)}". Address these specific issues.]`,
      shouldRetry: true,
      matchedKBPatterns: matchedKB,
    };
  }

  // ── Unknown ──
  return {
    diagnosis: `Unknown failure. Error: ${error.substring(0, 200)}. Output length: ${output.length}`,
    category: "unknown",
    severity: "fundamental",
    correction: "",
    shouldRetry: toolCount === 0, // Retry if agent didn't even try
    matchedKBPatterns: matchedKB,
  };
}
