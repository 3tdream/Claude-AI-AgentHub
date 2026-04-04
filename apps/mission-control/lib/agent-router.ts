/**
 * Agent Router — maps task keywords to the best agentId.
 * routeToAgent(task)  → single best match (falls back to "orchestrator")
 * routeToAgents(task) → ranked list of all scoring agents
 */

import { AGENT_CATALOG } from "@/lib/agent-catalog";

export interface RouteResult {
  agentId: string;
  agentName: string;
  score: number;
  matchedKeywords: string[];
  isFallback: boolean;
}

type KW = [string, number];
const RULES: { agentId: string; keywords: KW[] }[] = [
  { agentId: "orchestrator",      keywords: [["orchestrate",3],["coordinate",3],["workflow",2],["multi-agent",3],["clarify",2]] },
  { agentId: "pm-agent",          keywords: [["prd",3],["roadmap",3],["epic",3],["backlog",3],["jira",3],["sprint",3],["scope",2],["milestone",2],["product",2],["timeline",2]] },
  { agentId: "research-agent",    keywords: [["research",3],["market",3],["competitor",3],["benchmark",3],["analyze",2],["survey",2],["landscape",2],["evaluate",2]] },
  { agentId: "architect-agent",   keywords: [["architecture",3],["architect",3],["adr",3],["system design",3],["tech stack",3],["scalability",2],["microservice",3],["diagram",2]] },
  { agentId: "backend-agent",     keywords: [["api",3],["endpoint",3],["route",2],["backend",3],["database",2],["schema",2],["migration",2],["graphql",3],["webhook",2],["auth",2],["jwt",2],["postgres",2],["prisma",2]] },
  { agentId: "frontend-agent",    keywords: [["frontend",3],["component",3],["react",3],["page",2],["ui",2],["form",2],["table",2],["dashboard",2],["hook",2],["tailwind",2],["tsx",2],["animation",2],["canvas",3],["3d",2],["visualization",2],["navigation",2],["sidebar",2],["menu",2],["button",2],["modal",2],["panel",2],["layout",2],["responsive",2],["css",2],["style",2],["color",2],["icon",2],["tooltip",2]] },
  { agentId: "designer-agent",    keywords: [["figma",3],["mockup",3],["wireframe",3],["prototype",3],["ux",3],["design system",3],["style guide",3],["typography",3],["theme",2],["token",2]] },
  { agentId: "devops-agent",      keywords: [["devops",3],["deploy",3],["docker",3],["dockerfile",3],["github actions",3],["nginx",3],["terraform",3],["kubernetes",3],["infra",3],["release",2],["ci",2]] },
  { agentId: "cyber-agent",       keywords: [["security",3],["vulnerability",3],["audit",3],["owasp",3],["threat",3],["pentest",3],["xss",3],["csrf",3],["injection",3],["gdpr",3],["pii",3],["encrypt",2]] },
  { agentId: "qa-agent",          keywords: [["qa",3],["quality",3],["bug",3],["test",2],["code review",3],["regression",3],["unit test",3],["e2e",3],["coverage",2],["lint",2],["edge case",2]] },
  { agentId: "email-calendar-agent", keywords: [["email",3],["calendar",3],["schedule",3],["meeting",3],["invite",2],["reminder",2],["gmail",3],["composio",3]] },
  { agentId: "tech-support-agent",keywords: [["troubleshoot",3],["debug",3],["not working",3],["broken",2],["crash",2],["exception",2],["install",2],["configure",2]] },
  { agentId: "assistant-agent",   keywords: [["summarize",2],["summary",2],["draft",2],["explain",2],["general",2],["miscellaneous",2]] },
];

function hit(kw: string, t: string): boolean {
  return kw.includes(" ") ? t.includes(kw) : new RegExp(`\\b${kw}\\b`).test(t);
}

function getName(id: string): string {
  return AGENT_CATALOG.find((a) => a.agentId === id)?.agentName ?? id;
}

function fallback(): RouteResult {
  return { agentId: "orchestrator", agentName: getName("orchestrator"), score: 0, matchedKeywords: [], isFallback: true };
}

/** Routes a task to the single best-matching agent. Falls back to "orchestrator". */
export function routeToAgent(task: string): RouteResult {
  if (!task?.trim()) return fallback();
  const t = task.toLowerCase();
  let best = fallback();
  for (const rule of RULES) {
    let score = 0; const matched: string[] = [];
    for (const [kw, w] of rule.keywords) { if (hit(kw, t)) { score += w; matched.push(kw); } }
    if (score > best.score) best = { agentId: rule.agentId, agentName: getName(rule.agentId), score, matchedKeywords: matched, isFallback: false };
  }
  return best;
}

/** Returns all scoring agents sorted by score desc. Falls back to ["orchestrator"]. */
export function routeToAgents(task: string, limit = 3): RouteResult[] {
  if (!task?.trim()) return [fallback()];
  const t = task.toLowerCase();
  const out: RouteResult[] = [];
  for (const rule of RULES) {
    let score = 0; const matched: string[] = [];
    for (const [kw, w] of rule.keywords) { if (hit(kw, t)) { score += w; matched.push(kw); } }
    if (score > 0) out.push({ agentId: rule.agentId, agentName: getName(rule.agentId), score, matchedKeywords: matched, isFallback: false });
  }
  return out.length ? out.sort((a, b) => b.score - a.score).slice(0, limit) : [fallback()];
}
