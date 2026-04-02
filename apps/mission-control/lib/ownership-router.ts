/**
 * Ownership Feedback Loop — routes QA failures to the responsible agent.
 *
 * Instead of generic retries, this module:
 * 1. Groups QA issues by fix_agent (the agent whose output caused the issue)
 * 2. Builds a targeted fix prompt including the agent's ORIGINAL output
 * 3. Returns structured fix tasks for the pipeline executor to dispatch
 *
 * Pure function — no side effects, no API calls.
 */

export interface QAIssue {
  /** Which agent should fix this */
  fix_agent: string;
  /** Description of what's wrong */
  description: string;
  /** File path that needs fixing */
  file: string;
  /** Severity of the issue */
  severity?: "P0" | "P1" | "P2";
  /** Acceptance criteria ID if applicable */
  criteria_id?: string;
}

export interface QAResult {
  issues: QAIssue[];
}

export interface FixTask {
  /** Agent ID to dispatch the fix to */
  agentId: string;
  /** Targeted fix prompt for this agent */
  fixPrompt: string;
  /** Upstream context summary for the agent */
  context: string;
}

/**
 * Route QA-found issues to the responsible agents with targeted fix prompts.
 *
 * @param qaResult - Parsed QA output with issues and fix_agent assignments
 * @param executionContext - Map of step outputs (e.g. step_s5-backend_output → content)
 * @returns Array of fix tasks, one per responsible agent
 */
export function routeFixToOwner(
  qaResult: QAResult,
  executionContext: Record<string, string>,
): FixTask[] {
  if (!qaResult.issues || qaResult.issues.length === 0) return [];

  // Group issues by fix_agent
  const agentIssues = new Map<string, QAIssue[]>();
  for (const issue of qaResult.issues) {
    const agent = issue.fix_agent || "frontend-agent";
    if (!agentIssues.has(agent)) {
      agentIssues.set(agent, []);
    }
    agentIssues.get(agent)!.push(issue);
  }

  const fixTasks: FixTask[] = [];

  for (const [agentId, issues] of agentIssues) {
    // Find the agent's original output from execution context
    const originalOutputKey = Object.keys(executionContext).find(
      (k) => k.startsWith("step_") && k.endsWith("_output") && findAgentInKey(k, agentId),
    );
    const originalOutput = originalOutputKey ? executionContext[originalOutputKey] : "";

    // Collect unique file paths
    const filePaths = [...new Set(issues.map((i) => i.file).filter(Boolean))];

    // Build the issue list
    const issueList = issues
      .map(
        (issue, idx) =>
          `${idx + 1}. [${issue.severity || "P1"}] ${issue.description}\n   File: ${issue.file}${issue.criteria_id ? `\n   Criteria: ${issue.criteria_id}` : ""}`,
      )
      .join("\n\n");

    const fixPrompt = `OWNERSHIP FIX — Targeted Repair Task

QA found ${issues.length} issue(s) in YOUR output that need fixing.

ISSUES TO FIX:
${issueList}

FILES TO MODIFY:
${filePaths.map((f) => `- ${f}`).join("\n")}

YOUR ORIGINAL OUTPUT (for reference):
${originalOutput.substring(0, 8000)}

INSTRUCTIONS:
1. Fix ONLY the specific issues listed above
2. Do NOT change anything else — other parts of the code are working
3. Do NOT introduce new patterns, endpoints, or dependencies
4. Do NOT rewrite entire files — make minimal targeted edits
5. Use edit_file with exact old_string matching

DEFINITION OF DONE:
- Each listed issue has a corresponding edit_file call
- No regressions in other acceptance criteria`;

    const contextSummary = buildContextSummary(agentId, executionContext);

    fixTasks.push({
      agentId,
      fixPrompt,
      context: contextSummary,
    });
  }

  return fixTasks;
}

/**
 * Check if a context key belongs to a specific agent.
 * Keys look like step_s5-backend_output, step_s7-frontend_output, etc.
 */
function findAgentInKey(key: string, agentId: string): boolean {
  const shortAgent = agentId.replace("-agent", "");
  return key.includes(shortAgent);
}

/**
 * Build a summary of relevant upstream context for the fix agent.
 */
function buildContextSummary(agentId: string, executionContext: Record<string, string>): string {
  const relevantKeys: string[] = [];

  // Architect output is always relevant
  for (const key of Object.keys(executionContext)) {
    if (key.includes("architect") || key.includes("s3")) {
      relevantKeys.push(key);
    }
  }

  // Designer output is relevant for frontend
  if (agentId === "frontend-agent") {
    for (const key of Object.keys(executionContext)) {
      if (key.includes("designer") || key.includes("s6")) {
        relevantKeys.push(key);
      }
    }
  }

  if (relevantKeys.length === 0) return "No upstream context available.";

  return relevantKeys
    .map((k) => `--- ${k} ---\n${executionContext[k]?.substring(0, 3000) || "(empty)"}`)
    .join("\n\n");
}
