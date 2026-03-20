/**
 * QA Feedback Loop — targeted fix cycle when QA finds failures.
 *
 * Flow:
 * 1. Parse QA's acceptance_results JSON
 * 2. Group failures by responsible agent (based on file paths in evidence)
 * 3. Build targeted fix prompt per agent
 * 4. Re-run only failing agents
 * 5. Re-validate only failed criteria
 * 6. Max 2 fix cycles, then escalate to user
 */

export interface AcceptanceResult {
  criteria_id: string;
  user_story?: string;
  given: string;
  when: string;
  then: string;
  status: "PASS" | "FAIL" | "PARTIAL" | "BLOCKED";
  evidence: string;
  severity: "P0" | "P1" | "P2";
  fix_required?: string;
}

export interface QAResults {
  acceptance_results: AcceptanceResult[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    partial: number;
    blocked: number;
    p0_failures: number;
  };
  verdict: "PASS" | "FAIL";
}

export interface FixTarget {
  agentId: string;
  failures: AcceptanceResult[];
  filePaths: string[];
}

/**
 * Parse QA output for structured acceptance_results JSON block.
 */
export function parseQAResults(qaOutput: string): QAResults | null {
  // Find the acceptance_results JSON block
  const jsonFences = [...qaOutput.matchAll(/```json\s*\n([\s\S]*?)\n```/g)];
  for (const match of jsonFences) {
    try {
      const parsed = JSON.parse(match[1]);
      if (parsed?.acceptance_results && Array.isArray(parsed.acceptance_results)) {
        return parsed as QAResults;
      }
    } catch {
      // Not this block
    }
  }

  // Try bare JSON
  const bareMatch = qaOutput.match(/\{"acceptance_results"\s*:\s*\[[\s\S]*?\}[\s\S]*?\}/);
  if (bareMatch) {
    try {
      const parsed = JSON.parse(bareMatch[0]);
      if (parsed?.acceptance_results) return parsed as QAResults;
    } catch { /* fall through */ }
  }

  return null;
}

/**
 * Determine which agent is responsible for a failure based on file path evidence.
 */
function classifyFailure(evidence: string): string {
  const lower = evidence.toLowerCase();
  // API routes, lib, server-side
  if (lower.includes("/api/") || lower.includes("route.ts") || lower.includes("lib/") || lower.includes("schema") || lower.includes("migration")) {
    return "backend-agent";
  }
  // Components, pages, UI
  if (lower.includes("components/") || lower.includes("page.tsx") || lower.includes("app/(shell)") || lower.includes(".css") || lower.includes("layout.tsx")) {
    return "frontend-agent";
  }
  // Design tokens, styles
  if (lower.includes("globals.css") || lower.includes("design") || lower.includes("token")) {
    return "designer-agent";
  }
  // Default to frontend (most common)
  return "frontend-agent";
}

/**
 * Extract file paths from evidence strings.
 */
function extractFilePaths(evidence: string): string[] {
  const paths: string[] = [];
  // Match patterns like "file:line" or "path/to/file.ts:42" or "path/to/file.ts"
  const matches = evidence.matchAll(/([a-zA-Z0-9_\-/.]+\.[a-zA-Z]+)(?::(\d+))?/g);
  for (const m of matches) {
    if (m[1] && !m[1].startsWith("http")) {
      paths.push(m[1]);
    }
  }
  return [...new Set(paths)];
}

/**
 * Group QA failures by responsible agent.
 */
export function groupFailuresByAgent(results: QAResults): FixTarget[] {
  const failures = results.acceptance_results.filter(
    (r) => r.status === "FAIL" || r.status === "PARTIAL"
  );

  if (failures.length === 0) return [];

  const agentMap = new Map<string, { failures: AcceptanceResult[]; filePaths: Set<string> }>();

  for (const failure of failures) {
    const agentId = classifyFailure(failure.evidence);
    if (!agentMap.has(agentId)) {
      agentMap.set(agentId, { failures: [], filePaths: new Set() });
    }
    const entry = agentMap.get(agentId)!;
    entry.failures.push(failure);
    for (const fp of extractFilePaths(failure.evidence)) {
      entry.filePaths.add(fp);
    }
  }

  return Array.from(agentMap.entries()).map(([agentId, data]) => ({
    agentId,
    failures: data.failures,
    filePaths: [...data.filePaths],
  }));
}

/**
 * Build a targeted fix prompt for an agent based on QA failures.
 */
export function buildFixPrompt(
  target: FixTarget,
  originalOutput: string,
  fixCycle: number,
): string {
  const failureList = target.failures.map((f) =>
    `- ${f.criteria_id} [${f.severity}] — ${f.status}\n  GIVEN: ${f.given}\n  WHEN: ${f.when}\n  THEN: ${f.then}\n  Evidence: ${f.evidence}\n  Fix required: ${f.fix_required || "see evidence"}`
  ).join("\n\n");

  const fileList = target.filePaths.length > 0
    ? `Files to fix:\n${target.filePaths.map((f) => `- ${f}`).join("\n")}`
    : "";

  return `QA FEEDBACK LOOP — Fix Cycle ${fixCycle}/2

QA found ${target.failures.length} failure(s) in your previous output.
Fix ONLY the issues listed below. Do NOT rewrite files that are working.

FAILURES TO FIX:
${failureList}

${fileList}

YOUR PREVIOUS OUTPUT (for reference):
${originalOutput.substring(0, 8000)}

INSTRUCTIONS:
1. Read each failure's evidence (file:line)
2. Fix ONLY the specific issue described
3. Output the corrected files in the standard JSON format
4. Do NOT change files that passed QA

FILE OUTPUT FORMAT:
\`\`\`json
{"files": [
  {"path": "path/to/fixed-file.ts", "action": "modify", "content": "complete corrected file content"}
]}
\`\`\``;
}

/**
 * Build a targeted re-validation prompt for QA to check only failed criteria.
 */
export function buildRevalidationPrompt(
  failedCriteria: AcceptanceResult[],
  fixOutputs: Record<string, string>,
): string {
  const criteriaList = failedCriteria.map((f) =>
    `- ${f.criteria_id} [${f.severity}]: GIVEN ${f.given} WHEN ${f.when} THEN ${f.then}`
  ).join("\n");

  const fixSummary = Object.entries(fixOutputs).map(([agentId, output]) =>
    `### ${agentId} fix output:\n${output.substring(0, 4000)}`
  ).join("\n\n");

  return `QA RE-VALIDATION — Check only previously failed criteria.

CRITERIA TO RE-VALIDATE:
${criteriaList}

FIX OUTPUTS:
${fixSummary}

Re-check ONLY the criteria listed above against the fix outputs.
Output the same JSON format:

\`\`\`json
{"acceptance_results": [
  {
    "criteria_id": "AC-X",
    "status": "PASS | FAIL",
    "evidence": "what changed",
    "severity": "P0 | P1 | P2",
    "fix_required": "only if still failing"
  }
],
"summary": {"total": 0, "pass": 0, "fail": 0, "partial": 0, "blocked": 0, "p0_failures": 0},
"verdict": "PASS | FAIL"
}
\`\`\``;
}
