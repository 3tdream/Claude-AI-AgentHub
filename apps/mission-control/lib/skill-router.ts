/**
 * Skill Router — Adaptive Skill Orchestrator
 *
 * Not a filter. An orchestration brain that:
 * 1. Classifies task (domain, scope, complexity)
 * 2. Matches broad skill set
 * 3. Scores each skill (relevance + KB boost + project fit + history - conflicts)
 * 4. Resolves conflicts
 * 5. Assigns roles (primary/support/guard)
 * 6. Returns ordered execution plan with confidence
 *
 * Max 6 skills. Max 2 primary. Always explains why.
 */

import type { KBEntry } from "@/types";

// ── Types ────────────────────────────────────────────

export type SkillRole = "pre" | "primary" | "support" | "guard" | "post";

export interface SkillPlanEntry {
  skill: string;
  role: SkillRole;
  order: number;
  score: number;
  why: string;
}

export interface SkillPlan {
  plan: SkillPlanEntry[];
  confidence: number;
  taskAnalysis: {
    domains: string[];
    scope: string;
    complexity: "low" | "medium" | "high";
    projectType: string;
  };
  skippedSkills: { skill: string; reason: string }[];
  totalSkills: number;
  routedAt: string;
}

// ── Skill Manifest ───────────────────────────────────

interface SkillDef {
  id: string;
  domains: string[];
  scope: string[]; // "planning" | "implementation" | "validation" | "deployment" | "research" | "design"
  complexity: ("low" | "medium" | "high")[];
  defaultRole: SkillRole;
  conflictsWith: string[];
  /** Base relevance weight 1-10 */
  weight: number;
}

const SKILL_MANIFEST: SkillDef[] = [
  // ── Planning ──
  { id: "architect", domains: ["backend", "frontend", "database", "api", "system"], scope: ["planning"], complexity: ["medium", "high"], defaultRole: "pre", conflictsWith: ["api-design"], weight: 8 },
  { id: "api-design", domains: ["api", "backend"], scope: ["planning"], complexity: ["low", "medium"], defaultRole: "pre", conflictsWith: ["architect"], weight: 5 },
  { id: "feature-scope", domains: ["*"], scope: ["planning"], complexity: ["low"], defaultRole: "pre", conflictsWith: [], weight: 3 },
  { id: "tech-decision", domains: ["*"], scope: ["planning"], complexity: ["medium"], defaultRole: "pre", conflictsWith: [], weight: 4 },
  { id: "preflight", domains: ["pipeline"], scope: ["planning"], complexity: ["medium", "high"], defaultRole: "pre", conflictsWith: [], weight: 6 },
  { id: "pm", domains: ["product", "management"], scope: ["planning"], complexity: ["medium", "high"], defaultRole: "pre", conflictsWith: [], weight: 5 },
  { id: "user-story", domains: ["product"], scope: ["planning"], complexity: ["low"], defaultRole: "support", conflictsWith: ["pm"], weight: 3 },
  { id: "acceptance-gen", domains: ["product", "qa"], scope: ["planning"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 3 },

  // ── Implementation ──
  { id: "backend", domains: ["backend", "api", "database"], scope: ["implementation"], complexity: ["medium", "high"], defaultRole: "primary", conflictsWith: [], weight: 9 },
  { id: "frontend", domains: ["frontend", "ui", "design"], scope: ["implementation"], complexity: ["medium", "high"], defaultRole: "primary", conflictsWith: [], weight: 9 },
  { id: "frontend-designer", domains: ["frontend", "ui", "design"], scope: ["implementation"], complexity: ["low", "medium"], defaultRole: "primary", conflictsWith: ["frontend", "designer"], weight: 7 },
  { id: "api-scaffold", domains: ["api", "backend"], scope: ["implementation"], complexity: ["low"], defaultRole: "support", conflictsWith: ["backend"], weight: 4 },
  { id: "form-builder", domains: ["frontend", "ui"], scope: ["implementation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "table-builder", domains: ["frontend", "ui"], scope: ["implementation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "dashboard-builder", domains: ["frontend", "ui", "analytics"], scope: ["implementation"], complexity: ["medium"], defaultRole: "primary", conflictsWith: [], weight: 6 },
  { id: "db-schema", domains: ["database"], scope: ["implementation"], complexity: ["low", "medium"], defaultRole: "support", conflictsWith: [], weight: 5 },
  { id: "db-migration", domains: ["database"], scope: ["implementation"], complexity: ["low", "medium"], defaultRole: "support", conflictsWith: [], weight: 5 },
  { id: "seed-data", domains: ["database"], scope: ["implementation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 2 },
  { id: "designer", domains: ["design", "ui"], scope: ["implementation"], complexity: ["medium"], defaultRole: "support", conflictsWith: ["frontend-designer"], weight: 5 },
  { id: "theme-factory", domains: ["design", "ui"], scope: ["implementation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "animation", domains: ["frontend", "ui"], scope: ["implementation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 2 },

  // ── Security ──
  { id: "cyber", domains: ["security", "auth", "backend"], scope: ["validation"], complexity: ["medium", "high"], defaultRole: "guard", conflictsWith: [], weight: 8 },
  { id: "auth-review", domains: ["security", "auth"], scope: ["validation"], complexity: ["medium"], defaultRole: "guard", conflictsWith: ["cyber"], weight: 6 },
  { id: "threat-model", domains: ["security"], scope: ["planning"], complexity: ["high"], defaultRole: "pre", conflictsWith: [], weight: 5 },
  { id: "secret-scan", domains: ["security", "devops"], scope: ["validation"], complexity: ["low"], defaultRole: "guard", conflictsWith: [], weight: 4 },
  { id: "data-privacy", domains: ["security", "compliance"], scope: ["validation"], complexity: ["medium"], defaultRole: "guard", conflictsWith: [], weight: 5 },

  // ── QA ──
  { id: "qa", domains: ["*"], scope: ["validation"], complexity: ["medium", "high"], defaultRole: "guard", conflictsWith: [], weight: 7 },
  { id: "test-plan", domains: ["*"], scope: ["planning"], complexity: ["medium"], defaultRole: "support", conflictsWith: [], weight: 4 },
  { id: "edge-cases", domains: ["*"], scope: ["validation"], complexity: ["low", "medium"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "bug-report", domains: ["*"], scope: ["validation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 2 },
  { id: "a11y-check", domains: ["frontend", "ui"], scope: ["validation"], complexity: ["low"], defaultRole: "guard", conflictsWith: [], weight: 3 },

  // ── DevOps ──
  { id: "devops", domains: ["devops", "deployment", "infra"], scope: ["deployment"], complexity: ["medium", "high"], defaultRole: "post", conflictsWith: [], weight: 7 },
  { id: "docker-compose", domains: ["devops", "deployment"], scope: ["deployment"], complexity: ["low"], defaultRole: "support", conflictsWith: ["devops"], weight: 3 },
  { id: "monitoring-setup", domains: ["devops", "monitoring"], scope: ["deployment"], complexity: ["medium"], defaultRole: "post", conflictsWith: [], weight: 4 },
  { id: "env-audit", domains: ["devops", "security"], scope: ["validation"], complexity: ["low"], defaultRole: "guard", conflictsWith: [], weight: 3 },
  { id: "backup-plan", domains: ["devops"], scope: ["planning"], complexity: ["medium"], defaultRole: "support", conflictsWith: [], weight: 3 },

  // ── Research ──
  { id: "research", domains: ["product", "market"], scope: ["research"], complexity: ["medium"], defaultRole: "pre", conflictsWith: [], weight: 5 },
  { id: "market-scan", domains: ["product", "market"], scope: ["research"], complexity: ["low"], defaultRole: "pre", conflictsWith: ["research"], weight: 3 },
  { id: "competitor-dive", domains: ["product", "market"], scope: ["research"], complexity: ["medium"], defaultRole: "pre", conflictsWith: [], weight: 4 },
  { id: "tech-radar", domains: ["*"], scope: ["research"], complexity: ["medium"], defaultRole: "pre", conflictsWith: [], weight: 4 },

  // ── Pipeline ──
  { id: "run-pipeline", domains: ["pipeline"], scope: ["implementation"], complexity: ["high"], defaultRole: "primary", conflictsWith: [], weight: 8 },
  { id: "compare-runs", domains: ["pipeline", "analytics"], scope: ["validation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "retro", domains: ["pipeline"], scope: ["validation"], complexity: ["low"], defaultRole: "post", conflictsWith: [], weight: 3 },
  { id: "agent-memory", domains: ["pipeline", "kb"], scope: ["validation"], complexity: ["low"], defaultRole: "post", conflictsWith: [], weight: 4 },
  { id: "kb-update", domains: ["kb"], scope: ["implementation"], complexity: ["low"], defaultRole: "post", conflictsWith: [], weight: 3 },
  { id: "nightly-evolution", domains: ["pipeline", "kb"], scope: ["validation"], complexity: ["low"], defaultRole: "post", conflictsWith: [], weight: 3 },

  // ── Meta ──
  { id: "figma", domains: ["design", "ui", "frontend"], scope: ["research", "implementation"], complexity: ["medium"], defaultRole: "pre", conflictsWith: [], weight: 6 },
  { id: "dead-code-scan", domains: ["*"], scope: ["validation"], complexity: ["low"], defaultRole: "guard", conflictsWith: [], weight: 2 },
  { id: "performance-pass", domains: ["*"], scope: ["validation"], complexity: ["medium"], defaultRole: "guard", conflictsWith: [], weight: 4 },
  { id: "dependency-map", domains: ["*"], scope: ["planning"], complexity: ["medium"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "cost-analysis", domains: ["analytics", "pipeline"], scope: ["validation"], complexity: ["low"], defaultRole: "support", conflictsWith: [], weight: 3 },
];

// ── Task Classifier ──────────────────────────────────

interface TaskAnalysis {
  domains: string[];
  scope: string;
  complexity: "low" | "medium" | "high";
  projectType: string;
  keywords: string[];
}

function classifyTask(input: string, projectContext?: string): TaskAnalysis {
  const t = input.toLowerCase();
  const domains: string[] = [];
  const keywords: string[] = [];

  // Domain detection
  if (/\b(api|endpoint|route|rest|graphql)\b/.test(t)) { domains.push("api"); keywords.push("api"); }
  if (/\b(backend|server|service|controller|repository)\b/.test(t)) { domains.push("backend"); keywords.push("backend"); }
  if (/\b(frontend|page|component|ui|react|next)\b/.test(t)) { domains.push("frontend"); keywords.push("frontend"); }
  if (/\b(database|db|schema|migration|table|postgres|sql|entity)\b/.test(t)) { domains.push("database"); keywords.push("database"); }
  if (/\b(auth|login|jwt|session|rbac|permission|role|oauth)\b/.test(t)) { domains.push("auth", "security"); keywords.push("auth"); }
  if (/\b(security|cyber|vulnerability|xss|csrf|injection|owasp)\b/.test(t)) { domains.push("security"); keywords.push("security"); }
  if (/\b(design|css|tailwind|theme|style|layout|figma|mockup)\b/.test(t)) { domains.push("design", "ui"); keywords.push("design"); }
  if (/\b(deploy|docker|ci|cd|infra|terraform|nginx|vercel)\b/.test(t)) { domains.push("devops", "deployment"); keywords.push("devops"); }
  if (/\b(test|qa|bug|edge.case|regression)\b/.test(t)) { domains.push("qa"); keywords.push("qa"); }
  if (/\b(pipeline|orchestr|agent|workflow|routing|stage)\b/.test(t)) { domains.push("pipeline"); keywords.push("pipeline"); }
  if (/\b(product|feature|user.story|prd|requirement)\b/.test(t)) { domains.push("product"); keywords.push("product"); }
  if (/\b(monitor|health|alert|metric|analytics)\b/.test(t)) { domains.push("monitoring", "analytics"); keywords.push("monitoring"); }
  if (/\b(dashboard)\b/.test(t)) { domains.push("analytics", "frontend"); keywords.push("dashboard"); }

  // Research/market — only if NOT in technical context
  const isTechnical = domains.some((d) => ["backend", "frontend", "api", "database", "pipeline", "devops"].includes(d));
  if (/\b(research|market|competitor|analyze)\b/.test(t) && !isTechnical) {
    domains.push("market"); keywords.push("market");
  }

  if (domains.length === 0) domains.push("*");

  // Scope detection — priority order matters (later wins)
  let scope = "implementation";
  if (/\b(plan|design|architect|decide|choose|compare)\b/.test(t)) scope = "planning";
  if (/\b(test|check|audit|review|scan|validate|verify)\b/.test(t)) scope = "validation";
  if (/\b(deploy|release|ship|publish|push)\b/.test(t)) scope = "deployment";
  // Research scope ONLY when no technical domains detected
  if (/\b(research|explore|discover|survey)\b/.test(t) && !isTechnical) scope = "research";
  // Fix/improve always = implementation regardless of other keywords
  if (/\b(fix|improve|add|create|build|implement|update)\b/.test(t)) scope = "implementation";

  // Complexity
  let complexity: TaskAnalysis["complexity"] = "medium";
  const wordCount = input.split(/\s+/).length;
  if (wordCount < 15 && domains.length <= 2) complexity = "low";
  if (wordCount > 40 || domains.length > 3) complexity = "high";
  if (/\b(from scratch|full|complete|entire|system)\b/.test(t)) complexity = "high";
  if (/\b(fix|add|update|change|rename)\b/.test(t) && wordCount < 20) complexity = "low";

  // Project type
  let projectType = "unknown";
  if (projectContext) {
    if (/next/i.test(projectContext)) projectType = "nextjs";
    else if (/vite/i.test(projectContext)) projectType = "vite";
    else if (/express/i.test(projectContext)) projectType = "express";
  }

  return { domains: [...new Set(domains)], scope, complexity, projectType, keywords };
}

// ── Skill Scorer ─────────────────────────────────────

function scoreSkill(
  skill: SkillDef,
  task: TaskAnalysis,
  kbEntries: KBEntry[],
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];

  // 1. Domain relevance (0-40) — strongest signal
  const matchedDomains = skill.domains.filter((d) => task.domains.includes(d));
  if (skill.domains.includes("*")) {
    // Wildcard skills get LOW base — they must earn score elsewhere
    score += 5;
    reasons.push("wildcard domain");
  } else if (matchedDomains.length > 0) {
    // Direct domain match — strong signal
    score += matchedDomains.length * 15;
    reasons.push(`domain: ${matchedDomains.join(", ")}`);
  } else {
    // No domain match — heavy penalty, almost never selected
    score -= 20;
    reasons.push("no domain match");
  }

  // 2. Scope match (0-20) — with mismatch penalty
  if (skill.scope.includes(task.scope)) {
    score += 20;
    reasons.push(`scope: ${task.scope}`);
  } else {
    // Wrong scope = significant penalty
    score -= 10;
  }

  // 3. Complexity fit (0-10)
  if (skill.complexity.includes(task.complexity)) {
    score += 10;
  } else {
    score -= 5;
  }

  // 4. Base weight (0-10)
  score += skill.weight;

  // 5. KB boost (0-15) — only for direct skill/domain matches
  const kbRelevant = kbEntries.filter((e) => {
    // Must match skill ID or matched domains — not just any tag
    if (e.tags.includes(skill.id)) return true;
    if (matchedDomains.some((d) => e.tags.includes(d))) return true;
    if (e.agentId && skill.id.includes(e.agentId.replace("-agent", ""))) return true;
    return false;
  });
  if (kbRelevant.length > 0) {
    const kbBoost = Math.min(kbRelevant.length * 5, 15);
    score += kbBoost;
    reasons.push(`KB: ${kbRelevant.length} patterns`);
  }

  // 6. Keyword boost — if task keywords directly mention the skill
  const skillInInput = task.keywords.some((k) =>
    skill.id.includes(k) || k.includes(skill.id.split("-")[0]),
  );
  if (skillInInput) {
    score += 10;
    reasons.push("keyword match");
  }

  // 7. Specificity penalty — low complexity tasks don't need broad/heavy skills
  if (task.complexity === "low" && skill.weight >= 7 && skill.defaultRole === "primary") {
    // Only penalize if it's not a direct keyword match
    if (!skillInInput && matchedDomains.length <= 1) {
      score -= 8;
      reasons.push("over-weight for simple task");
    }
  }

  // 8. Support skill penalty for narrow tasks — form-builder, table-builder etc
  if (task.complexity === "low" && task.domains.length <= 2 && skill.defaultRole === "support") {
    if (!skillInInput) {
      score -= 12;
    }
  }

  // 9. Design tool penalty when task is not design-focused
  if (["figma", "designer", "animation", "theme-factory", "dashboard-builder"].includes(skill.id)) {
    if (!task.domains.includes("design") && !task.domains.includes("ui") && !task.keywords.includes("design")) {
      score -= 15;
      reasons.push("not a design task");
    }
  }

  return { score, reasons };
}

// ── Conflict Resolution ──────────────────────────────

function resolveConflicts(scored: { skill: SkillDef; score: number; reasons: string[] }[]): {
  selected: typeof scored;
  skipped: { skill: string; reason: string }[];
} {
  const selected: typeof scored = [];
  const skipped: { skill: string; reason: string }[] = [];
  const selectedIds = new Set<string>();

  // Sort by score descending
  const sorted = [...scored].sort((a, b) => b.score - a.score);

  for (const item of sorted) {
    // Check conflicts
    const conflictWith = item.skill.conflictsWith.find((c) => selectedIds.has(c));
    if (conflictWith) {
      skipped.push({ skill: item.skill.id, reason: `conflicts with ${conflictWith} (higher score)` });
      continue;
    }
    selected.push(item);
    selectedIds.add(item.skill.id);
  }

  return { selected, skipped };
}

// ── Role Assignment ──────────────────────────────────

function assignRoles(skills: { skill: SkillDef; score: number; reasons: string[] }[]): SkillPlanEntry[] {
  const plan: SkillPlanEntry[] = [];
  let primaryCount = 0;
  let order = 1;

  // Sort by default role order: pre → primary → support → guard → post
  const roleOrder: Record<SkillRole, number> = { pre: 0, primary: 1, support: 2, guard: 3, post: 4 };

  const sorted = [...skills].sort((a, b) => {
    const roleA = roleOrder[a.skill.defaultRole] ?? 2;
    const roleB = roleOrder[b.skill.defaultRole] ?? 2;
    if (roleA !== roleB) return roleA - roleB;
    return b.score - a.score;
  });

  for (const item of sorted) {
    let role = item.skill.defaultRole;

    // Enforce max 2 primaries
    if (role === "primary") {
      if (primaryCount >= 2) {
        role = "support"; // Demote to support
      } else {
        primaryCount++;
      }
    }

    plan.push({
      skill: item.skill.id,
      role,
      order: order++,
      score: item.score,
      why: item.reasons.join(" | "),
    });
  }

  return plan;
}

// ── Main Router ──────────────────────────────────────

const MAX_SKILLS = 6;

export function routeSkills(
  input: string,
  kbEntries: KBEntry[] = [],
  projectContext?: string,
): SkillPlan {
  // 1. Classify task
  const task = classifyTask(input, projectContext);

  // 2. Match — score ALL skills, let scorer filter by negative scores
  const candidates = SKILL_MANIFEST.filter((skill) => {
    // Must have SOME relevance: domain match OR wildcard OR high weight
    const domainMatch = skill.domains.includes("*") || skill.domains.some((d) => task.domains.includes(d));
    return domainMatch || skill.weight >= 8;
  });

  // 3. Score each
  const scored = candidates.map((skill) => {
    const { score, reasons } = scoreSkill(skill, task, kbEntries);
    return { skill, score, reasons };
  });

  // 3.5. Filter out low scores (noise reduction)
  const MIN_SCORE = 20;
  const viable = scored.filter((s) => s.score >= MIN_SCORE);
  const belowThreshold = scored.filter((s) => s.score < MIN_SCORE);

  // 4. Resolve conflicts
  const { selected, skipped: conflictSkipped } = resolveConflicts(viable);
  const skipped = [
    ...conflictSkipped,
    ...belowThreshold.map((s) => ({ skill: s.skill.id, reason: `score ${s.score} below threshold ${MIN_SCORE}` })),
  ];

  // 5. Trim to max
  const trimmed = selected.slice(0, MAX_SKILLS);
  const overflowSkipped = selected.slice(MAX_SKILLS).map((s) => ({
    skill: s.skill.id,
    reason: `exceeded max ${MAX_SKILLS} skills (score: ${s.score})`,
  }));

  // 6. Assign roles + order
  const plan = assignRoles(trimmed);

  // 7. Calculate confidence
  const avgScore = plan.reduce((s, p) => s + p.score, 0) / (plan.length || 1);
  const maxPossible = 95; // theoretical max score
  const confidence = Math.min(Math.round((avgScore / maxPossible) * 100) / 100, 0.99);

  return {
    plan,
    confidence,
    taskAnalysis: {
      domains: task.domains,
      scope: task.scope,
      complexity: task.complexity,
      projectType: task.projectType,
    },
    skippedSkills: [...skipped, ...overflowSkipped],
    totalSkills: SKILL_MANIFEST.length,
    routedAt: new Date().toISOString(),
  };
}
