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

export type FailureCategory =
  | "wrong_directory"
  | "no_edits"
  | "truncation"
  | "tool_error"
  | "low_quality"
  | "infra"
  | "hallucination"
  | "budget_exceeded"
  | "context_missing"
  | "unknown";

export interface Investigation {
  /** What went wrong */
  diagnosis: string;
  /** Category of failure */
  category: FailureCategory;
  /** Severity */
  severity: "fixable" | "needs_context" | "fundamental";
  /** Corrective instructions to prepend to retry prompt */
  correction: string;
  /** Should retry? */
  shouldRetry: boolean;
  /** KB patterns that match this failure */
  matchedKBPatterns: string[];
  /** Retry strategy hint for the executor */
  retryStrategy?: RetryStrategy;
}

export interface RetryStrategy {
  /** Whether to escalate the model on retry */
  escalateModel: boolean;
  /** Whether to apply KB penalty (lower confidence for this pattern) */
  applyKBPenalty: boolean;
  /** Additional prompt instructions to inject on retry */
  promptInjection?: string;
  /** Whether to pause and wait for human review */
  pauseForReview: boolean;
  /** Whether to re-inject upstream context explicitly */
  reinjectContext: boolean;
}

interface StepResult {
  status: string;
  output?: string;
  error?: string;
  toolCalls?: { name: string; input: Record<string, string>; output: string; success: boolean }[];
  toolCallCount?: number;
  tokensUsed?: number;
  budgetCap?: number;
  /** Known project files — used for hallucination detection */
  projectFiles?: string[];
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

  // ── Check A: Infrastructure errors (timeout, rate limit, API errors) ──
  const infraPatterns = /timeout|429|rate.?limit|ECONNREFUSED|abort|ETIMEDOUT|ENOTFOUND|503|502|500/i;
  if (infraPatterns.test(error) || infraPatterns.test(output)) {
    return {
      diagnosis: `Infrastructure error detected: ${error.substring(0, 200) || output.substring(0, 200)}`,
      category: "infra",
      severity: "fixable",
      correction: `[INVESTIGATION RESULT: Previous attempt failed due to an infrastructure issue (timeout/rate limit/API error). This is transient — retry with the same approach.]`,
      shouldRetry: true,
      matchedKBPatterns: matchedKB,
      retryStrategy: {
        escalateModel: false,
        applyKBPenalty: false,
        pauseForReview: false,
        reinjectContext: false,
      },
    };
  }

  // ── Check B: Budget exceeded (tokens over cap) ──
  if (stepResult.tokensUsed && stepResult.budgetCap && stepResult.tokensUsed > stepResult.budgetCap) {
    return {
      diagnosis: `Budget exceeded: used ${stepResult.tokensUsed} tokens vs cap of ${stepResult.budgetCap}. Stage hit budget limit.`,
      category: "budget_exceeded",
      severity: "fundamental",
      correction: "",
      shouldRetry: false,
      matchedKBPatterns: matchedKB,
      retryStrategy: {
        escalateModel: false,
        applyKBPenalty: false,
        pauseForReview: true,
        reinjectContext: false,
      },
    };
  }

  // ── Check C: Context missing (agent didn't receive upstream context) ──
  const contextMissingPatterns = /I don't have|not provided|no information about|wasn't given|missing context|no context|not available to me|I lack/i;
  if (contextMissingPatterns.test(output)) {
    return {
      diagnosis: `Agent output indicates missing upstream context: "${output.match(contextMissingPatterns)?.[0] || "context missing"}"`,
      category: "context_missing",
      severity: "needs_context",
      correction: `[INVESTIGATION RESULT: Your previous attempt failed because you reported missing context. The upstream data IS available. Re-read the input carefully — all context from previous pipeline stages is included above. Do NOT claim data is missing.]`,
      shouldRetry: true,
      matchedKBPatterns: matchedKB,
      retryStrategy: {
        escalateModel: false,
        applyKBPenalty: true,
        pauseForReview: false,
        reinjectContext: true,
      },
    };
  }

  // ── Check D: Hallucination (references non-existent files/endpoints/data) ──
  if (stepResult.projectFiles && stepResult.projectFiles.length > 0) {
    const referencedPaths = extractReferencedPaths(output);
    const knownFiles = new Set(stepResult.projectFiles);
    const hallucinated = referencedPaths.filter((p) => !knownFiles.has(p) && !isCommonPath(p));
    if (hallucinated.length >= 2) {
      return {
        diagnosis: `Agent referenced ${hallucinated.length} non-existent files: ${hallucinated.slice(0, 5).join(", ")}. Likely hallucination.`,
        category: "hallucination",
        severity: "needs_context",
        correction: `[INVESTIGATION RESULT: Your previous output referenced files that do not exist in the project: ${hallucinated.slice(0, 3).join(", ")}. ONLY use data from upstream stages. DO NOT invent file paths, endpoints, or data structures. Use list_files to verify paths before referencing them.]`,
        shouldRetry: true,
        matchedKBPatterns: matchedKB,
        retryStrategy: {
          escalateModel: true,
          applyKBPenalty: true,
          promptInjection: "CRITICAL: ONLY use data from upstream stages. Do NOT invent or assume file paths, API endpoints, or data schemas.",
          pauseForReview: false,
          reinjectContext: false,
        },
      };
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

// ── Helpers for hallucination detection ──

/** Extract file path references from agent output */
function extractReferencedPaths(output: string): string[] {
  const paths: string[] = [];
  // Match file paths like src/foo/bar.ts, app/page.tsx, lib/utils.ts, components/Foo.tsx
  const matches = output.matchAll(/(?:^|\s|["'`(])([a-zA-Z][a-zA-Z0-9_\-/.]*\.(?:ts|tsx|js|jsx|css|json|md))/gm);
  for (const m of matches) {
    if (m[1] && !m[1].startsWith("http") && m[1].includes("/")) {
      paths.push(m[1]);
    }
  }
  return [...new Set(paths)];
}

/** Common paths that should not be flagged as hallucinations */
function isCommonPath(path: string): boolean {
  const common = [
    "package.json", "tsconfig.json", "next.config.ts", "next.config.js",
    "tailwind.config.ts", "tailwind.config.js", "postcss.config.js",
    ".env", ".env.local", "README.md", "node_modules/",
  ];
  return common.some((c) => path.endsWith(c) || path.startsWith("node_modules/"));
}
