/**
 * KB Agent Context — builds a focused knowledge block for each agent
 * based on their past failures, successes, and relevant security rules.
 *
 * This is what makes agents "read" the KB before acting.
 */

import type { KBEntry, WorkflowStep } from "@/types";

interface AgentKBContext {
  /** Formatted prompt block to inject */
  promptBlock: string;
  /** Count of entries included */
  entryCount: number;
  /** Categories included */
  categories: string[];
}

/**
 * Match KB entries relevant to a specific agent/stage.
 * Matching logic:
 *   1. Direct source match (entry.source === step.id)
 *   2. Agent match (entry.agentId === step.agentId)
 *   3. Tag match (entry tags contain agent short name)
 *   4. Downstream dependency match (entries from stages this step depends on)
 */
function matchEntries(entries: KBEntry[], step: WorkflowStep): KBEntry[] {
  const agentShort = step.agentId.replace("-agent", "");
  const depStageIds = new Set(step.dependsOn || []);

  return entries.filter((e) => {
    if (e.source === step.id) return true;
    if (e.agentId === step.agentId) return true;
    if (e.tags.some((t) => t === agentShort)) return true;
    // Include entries from upstream stages this step depends on (cross-stage awareness)
    if (depStageIds.has(e.source)) return true;
    return false;
  });
}

/**
 * Prioritize entries: critical first, then high, then by recency.
 * Limit to max N entries to avoid prompt bloat.
 */
function prioritize(entries: KBEntry[], maxEntries: number): KBEntry[] {
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

  return [...entries]
    .sort((a, b) => {
      const sevDiff = (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3);
      if (sevDiff !== 0) return sevDiff;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
    .slice(0, maxEntries);
}

/**
 * Format a single KB entry as an actionable lesson for the agent.
 */
function formatEntry(entry: KBEntry, category: string): string {
  const icon = entry.severity === "critical" ? "🔴"
    : entry.severity === "high" ? "🟠"
    : entry.severity === "medium" ? "🟡" : "⚪";

  // Extract actionable fix if present
  const fixMatch = entry.content.match(/Fix:\s*(.+?)(?:\.|$)/i);
  const fix = fixMatch ? `\n   FIX: ${fixMatch[1].trim()}` : "";

  return `${icon} [${category}] ${entry.title}${fix}`;
}

/**
 * Build the full KB context block for an agent.
 *
 * Structure:
 * - MY PAST FAILURES (what I broke before — don't repeat)
 * - SECURITY RULES (mandatory compliance)
 * - SUCCESS PATTERNS (what works — keep doing)
 * - UPSTREAM CONTEXT (what previous stages learned)
 */
export function buildAgentKBContext(
  step: WorkflowStep,
  allEntries: KBEntry[],
  maxEntries: number = 12,
): AgentKBContext {
  // Categorize entries
  const failureEntries = allEntries.filter((e) =>
    e.tags.some((t) => ["truncation", "p0", "compilation", "guard-bypass", "sql-injection",
      "scope-creep", "timeout", "failure-rate", "implementation-gap"].includes(t)) ||
    // Entries from failure-patterns category (check source patterns)
    e.id.startsWith("kb-fp"),
  );
  const securityEntries = allEntries.filter((e) =>
    e.id.startsWith("kb-sp") ||
    e.tags.some((t) => ["security", "jwt", "xss", "auth", "rbac", "gdpr", "injection",
      "rate-limiting", "authentication", "dos-protection"].includes(t)),
  );
  const successEntries = allEntries.filter((e) =>
    e.id.startsWith("kb-su") ||
    e.tags.some((t) => ["success-pattern", "reliability", "benchmark", "100-percent"].includes(t)),
  );

  // Match to this agent
  const myFailures = prioritize(matchEntries(failureEntries, step), 5);
  const mySecurityRules = prioritize(matchEntries(securityEntries, step), 4);
  const mySuccesses = prioritize(matchEntries(successEntries, step), 3);

  const totalIncluded = myFailures.length + mySecurityRules.length + mySuccesses.length;
  if (totalIncluded === 0) {
    return { promptBlock: "", entryCount: 0, categories: [] };
  }

  const categories: string[] = [];
  const sections: string[] = [];

  // Section 1: Past failures
  if (myFailures.length > 0) {
    categories.push("failures");
    const items = myFailures.map((e) => formatEntry(e, "FAIL")).join("\n");
    sections.push(`MY PAST FAILURES (I made these mistakes before — I must not repeat them):
${items}`);
  }

  // Section 2: Security rules
  if (mySecurityRules.length > 0) {
    categories.push("security");
    const items = mySecurityRules.map((e) => formatEntry(e, "SEC")).join("\n");
    sections.push(`SECURITY RULES (mandatory — violations = pipeline failure):
${items}`);
  }

  // Section 3: Success patterns
  if (mySuccesses.length > 0) {
    categories.push("success");
    const items = mySuccesses.map((e) => formatEntry(e, "OK")).join("\n");
    sections.push(`WHAT WORKS (proven patterns — follow these):
${items}`);
  }

  const promptBlock = `
═══ KNOWLEDGE BASE: What I learned from ${totalIncluded} past experiences ═══

${sections.join("\n\n")}

═══ END KB CONTEXT ═══`;

  return { promptBlock, entryCount: totalIncluded, categories };
}
