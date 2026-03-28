/**
 * Self-generating Skills
 *
 * Analyzes KB failure patterns + investigation results to propose new skills.
 * Pattern: if the same failure category appears 3+ times → propose a skill to prevent it.
 *
 * Does NOT create skills automatically — proposes to user for approval.
 */

import type { KBEntry } from "@/types";

export interface SkillProposal {
  /** Proposed skill name (kebab-case) */
  name: string;
  /** What the skill does */
  description: string;
  /** When to trigger this skill */
  trigger: string;
  /** Which failure patterns motivated this */
  basedOn: { id: string; title: string; count: number }[];
  /** Confidence that this skill would help (0-1) */
  confidence: number;
  /** Category of the skill */
  category: "prevention" | "detection" | "builder" | "calibration";
}

/**
 * Analyze KB patterns and propose new skills
 */
export function generateSkillProposals(kbEntries: KBEntry[]): SkillProposal[] {
  const proposals: SkillProposal[] = [];

  // Group failure patterns by tags/categories
  const tagCounts: Record<string, { count: number; entries: KBEntry[] }> = {};

  for (const entry of kbEntries) {
    if (entry.severity !== "critical" && entry.severity !== "high") continue;

    for (const tag of entry.tags) {
      if (!tagCounts[tag]) tagCounts[tag] = { count: 0, entries: [] };
      tagCounts[tag].count++;
      tagCounts[tag].entries.push(entry);
    }
  }

  // Pattern 1: Recurring failure tags → prevention skills
  for (const [tag, data] of Object.entries(tagCounts)) {
    if (data.count < 3) continue;
    if (["auto-detected", "imported-from-memory", "auto-captured"].includes(tag)) continue;

    // Check if a skill for this already exists (by naming convention)
    const existingSkillNames = [
      "cyber", "qa", "backend", "frontend", "architect", "auth-review",
      "secret-scan", "performance-pass", "a11y-check", "dead-code-scan",
    ];
    if (existingSkillNames.includes(tag)) continue;

    proposals.push({
      name: `prevent-${tag}`,
      description: `Detect and prevent "${tag}" issues before they reach pipeline (${data.count} occurrences in KB)`,
      trigger: `Before pipeline run, if task involves ${tag}`,
      basedOn: data.entries.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        count: data.count,
      })),
      confidence: Math.min(0.9, 0.5 + data.count * 0.1),
      category: "prevention",
    });
  }

  // Pattern 2: Agent-specific failures → agent tuning skills
  const agentFailCounts: Record<string, KBEntry[]> = {};
  for (const entry of kbEntries) {
    if (!entry.agentId) continue;
    if (!agentFailCounts[entry.agentId]) agentFailCounts[entry.agentId] = [];
    agentFailCounts[entry.agentId].push(entry);
  }

  for (const [agentId, entries] of Object.entries(agentFailCounts)) {
    const failEntries = entries.filter((e) => e.severity === "critical" || e.severity === "high");
    if (failEntries.length < 3) continue;

    const shortName = agentId.replace("-agent", "");
    proposals.push({
      name: `tune-${shortName}`,
      description: `Auto-tune ${agentId} prompt based on ${failEntries.length} failure patterns`,
      trigger: `Nightly evolution detects ${shortName} fail rate > 40%`,
      basedOn: failEntries.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        count: failEntries.length,
      })),
      confidence: Math.min(0.85, 0.4 + failEntries.length * 0.1),
      category: "calibration",
    });
  }

  // Pattern 3: Investigation categories → detection skills
  const investigationCategories = ["wrong_directory", "no_edits", "truncation", "tool_error"];
  for (const cat of investigationCategories) {
    const matching = kbEntries.filter((e) => e.tags.includes(cat) || e.content.toLowerCase().includes(cat.replace("_", " ")));
    if (matching.length < 2) continue;

    proposals.push({
      name: `detect-${cat.replace("_", "-")}`,
      description: `Pre-flight detection of "${cat}" risk before stage execution`,
      trigger: `Before each pipeline stage, check for ${cat} risk factors`,
      basedOn: matching.slice(0, 3).map((e) => ({
        id: e.id,
        title: e.title,
        count: matching.length,
      })),
      confidence: Math.min(0.8, 0.5 + matching.length * 0.1),
      category: "detection",
    });
  }

  // Sort by confidence descending
  proposals.sort((a, b) => b.confidence - a.confidence);

  // Deduplicate by name
  const seen = new Set<string>();
  return proposals.filter((p) => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });
}
