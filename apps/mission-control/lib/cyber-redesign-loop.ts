/**
 * Cyber-Gated Redesign — architectural fix cycle when Cyber finds CRITICAL vulnerabilities.
 *
 * Symmetrical with QA Feedback Loop:
 * - QA Loop:    Implementation layer, max 2 cycles
 * - Cyber Loop: Architecture layer, max 1 cycle
 *
 * Flow:
 * 1. Parse Cyber output for severity level
 * 2. CRITICAL → trigger Architect redesign (targeted, delta only)
 * 3. Re-run Cyber on updated architecture
 * 4. If still CRITICAL → escalate to user
 * 5. HIGH/MEDIUM/LOW → pass downstream as backlog (no pipeline halt)
 */

export type CyberSeverity = "Critical" | "High" | "Medium" | "Low";

export interface CyberFinding {
  title: string;
  severity: CyberSeverity;
  risk: string;
  fix: string;
}

export interface CyberRedesignCycle {
  count: number;
  status: "redesigning" | "re-evaluating" | "resolved" | "escalated";
  criticalFindings: CyberFinding[];
}

/**
 * Parse Cyber agent output for risk level and findings.
 */
export function parseCyberOutput(output: string): {
  riskLevel: CyberSeverity;
  findings: CyberFinding[];
} {
  // Extract RISK LEVEL
  const riskMatch = output.match(/RISK\s*LEVEL\s*:\s*(Critical|High|Medium|Low)/i);
  const riskLevel = (riskMatch?.[1] || "Low") as CyberSeverity;

  // Extract findings
  const findings: CyberFinding[] = [];
  const findingRegex = /Finding\s*\d+\s*:\s*(.+?)(?:\n|$)\s*Risk\s*:\s*(.+?)(?:\n|$)\s*Fix\s*:\s*(.+?)(?:\n|$)/gi;
  let match;
  while ((match = findingRegex.exec(output)) !== null) {
    // Determine severity per finding — inherit from overall if not specified
    const title = match[1].trim();
    const risk = match[2].trim();
    const fix = match[3].trim();

    // Check if finding text implies critical
    const isCritical = /injection|bypass|rce|remote code|auth.*bypass|privilege.*escalat/i.test(title + risk);
    const isHigh = /missing.*rate|csrf|xss|sensitive.*data|token.*leak/i.test(title + risk);

    findings.push({
      title,
      severity: isCritical ? "Critical" : isHigh ? "High" : riskLevel,
      risk,
      fix,
    });
  }

  return { riskLevel, findings };
}

/**
 * Check if Cyber output should trigger an Architect redesign.
 */
export function shouldTriggerRedesign(
  riskLevel: CyberSeverity,
  findings: CyberFinding[],
  redesignCycles: number,
): boolean {
  if (redesignCycles >= 1) return false; // Max 1 redesign cycle
  if (riskLevel === "Critical") return true;
  return findings.some((f) => f.severity === "Critical");
}

/**
 * Separate findings into redesign targets (Critical) and downstream backlog (High/Medium/Low).
 */
export function triageFindings(findings: CyberFinding[]): {
  redesignTargets: CyberFinding[];
  backlog: CyberFinding[];
} {
  return {
    redesignTargets: findings.filter((f) => f.severity === "Critical"),
    backlog: findings.filter((f) => f.severity !== "Critical"),
  };
}

/**
 * Build a targeted redesign prompt for Architect based on Critical findings.
 */
export function buildRedesignPrompt(
  originalArchOutput: string,
  criticalFindings: CyberFinding[],
): string {
  const findingList = criticalFindings.map((f, i) =>
    `${i + 1}. ${f.title}\n   Risk: ${f.risk}\n   Required fix: ${f.fix}`
  ).join("\n\n");

  return `SECURITY-DRIVEN ARCHITECTURE REDESIGN

Cyber-Agent found ${criticalFindings.length} CRITICAL vulnerability(ies) in your architecture.
The pipeline is paused until these are resolved.

CRITICAL FINDINGS:
${findingList}

YOUR ORIGINAL ARCHITECTURE:
${originalArchOutput.substring(0, 6000)}

REDESIGN SCOPE:
- Fix ONLY the findings listed above
- Do NOT change: authentication flow, database schema, API endpoint paths,
  response shapes, or data model UNLESS directly required by the finding
- Do NOT rewrite the ADR, redefine the tech stack, or reorganize file structure
- Designer and Backend are working from the ORIGINAL contracts in parallel —
  any change you make to an API contract MUST be listed explicitly so they can adapt

INSTRUCTIONS:
1. Address EACH critical finding with the minimal architectural change
2. Output ONLY the delta — what changed and why
3. If an API CONTRACT must change, show the before→after
4. If the DATA MODEL must change, show only affected entities
5. Everything not listed as changed remains exactly as before

OUTPUT FORMAT:
SECURITY FIXES:
1. [Finding title] → [Architectural change]

UPDATED API CONTRACTS (only changed endpoints):
[METHOD] /api/path
Request: { ... }
Response: { ... }

UPDATED DATA MODEL (only changed entities):
EntityName: { ... }

CHANGE SUMMARY:
1. [What changed and why]

MAX 1000 words. Delta only.`;
}

/**
 * Build a re-evaluation prompt for Cyber to verify the redesign.
 */
export function buildCyberReevalPrompt(
  originalFindings: CyberFinding[],
  redesignOutput: string,
): string {
  const findingList = originalFindings.map((f) =>
    `- ${f.title} [${f.severity}]: ${f.risk}`
  ).join("\n");

  return `SECURITY RE-EVALUATION — Verify architecture redesign.

ORIGINAL CRITICAL FINDINGS:
${findingList}

ARCHITECT'S REDESIGN:
${redesignOutput.substring(0, 6000)}

For EACH original finding:
1. Is the vulnerability resolved by the redesign? (YES/NO)
2. Did the redesign introduce any NEW vulnerabilities?

Output in the same format:
RISK LEVEL: [Low/Medium/High/Critical]

If all critical findings are resolved and no new criticals introduced:
RISK LEVEL: Low (or Medium/High for remaining non-critical items)

If any critical finding is NOT resolved:
RISK LEVEL: Critical
Finding N: [what's still wrong]
Risk: [one sentence]
Fix: [one sentence]

MAX 400 words.`;
}
