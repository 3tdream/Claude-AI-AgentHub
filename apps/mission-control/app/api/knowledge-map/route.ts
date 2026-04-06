import { NextResponse } from "next/server";
import { getAllCategories, readKBFile } from "@/lib/kb-storage";

// ── Skill manifest (mirror of lib/skill-router.ts, data only) ──

interface SkillNode {
  id: string;
  domains: string[];
  scope: string[];
  defaultRole: string;
  conflictsWith: string[];
  weight: number;
}

const SKILLS: SkillNode[] = [
  // Planning
  { id: "architect", domains: ["backend", "frontend", "database", "api", "system"], scope: ["planning"], defaultRole: "pre", conflictsWith: ["api-design"], weight: 8 },
  { id: "api-design", domains: ["api", "backend"], scope: ["planning"], defaultRole: "pre", conflictsWith: ["architect"], weight: 5 },
  { id: "feature-scope", domains: ["*"], scope: ["planning"], defaultRole: "pre", conflictsWith: [], weight: 3 },
  { id: "tech-decision", domains: ["*"], scope: ["planning"], defaultRole: "pre", conflictsWith: [], weight: 4 },
  { id: "preflight", domains: ["pipeline"], scope: ["planning"], defaultRole: "pre", conflictsWith: [], weight: 6 },
  { id: "pm", domains: ["product", "management"], scope: ["planning"], defaultRole: "pre", conflictsWith: [], weight: 5 },
  { id: "user-story", domains: ["product"], scope: ["planning"], defaultRole: "support", conflictsWith: ["pm"], weight: 3 },
  { id: "acceptance-gen", domains: ["product", "qa"], scope: ["planning"], defaultRole: "support", conflictsWith: [], weight: 3 },
  // Implementation
  { id: "backend", domains: ["backend", "api", "database"], scope: ["implementation"], defaultRole: "primary", conflictsWith: [], weight: 9 },
  { id: "frontend", domains: ["frontend", "ui", "design"], scope: ["implementation"], defaultRole: "primary", conflictsWith: [], weight: 9 },
  { id: "frontend-designer", domains: ["frontend", "ui", "design"], scope: ["implementation"], defaultRole: "primary", conflictsWith: ["frontend", "designer"], weight: 7 },
  { id: "api-scaffold", domains: ["api", "backend"], scope: ["implementation"], defaultRole: "support", conflictsWith: ["backend"], weight: 4 },
  { id: "form-builder", domains: ["frontend", "ui"], scope: ["implementation"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "table-builder", domains: ["frontend", "ui"], scope: ["implementation"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "dashboard-builder", domains: ["frontend", "ui", "analytics"], scope: ["implementation"], defaultRole: "primary", conflictsWith: [], weight: 6 },
  { id: "db-schema", domains: ["database"], scope: ["implementation"], defaultRole: "support", conflictsWith: [], weight: 5 },
  { id: "db-migration", domains: ["database"], scope: ["implementation"], defaultRole: "support", conflictsWith: [], weight: 5 },
  { id: "seed-data", domains: ["database"], scope: ["implementation"], defaultRole: "support", conflictsWith: [], weight: 2 },
  { id: "designer", domains: ["design", "ui"], scope: ["implementation"], defaultRole: "support", conflictsWith: ["frontend-designer"], weight: 5 },
  { id: "theme-factory", domains: ["design", "ui"], scope: ["implementation"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "animation", domains: ["frontend", "ui"], scope: ["implementation"], defaultRole: "support", conflictsWith: [], weight: 2 },
  // Security
  { id: "cyber", domains: ["security", "auth", "backend"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 8 },
  { id: "auth-review", domains: ["security", "auth"], scope: ["validation"], defaultRole: "guard", conflictsWith: ["cyber"], weight: 6 },
  { id: "threat-model", domains: ["security"], scope: ["planning"], defaultRole: "pre", conflictsWith: [], weight: 5 },
  { id: "secret-scan", domains: ["security", "devops"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 4 },
  { id: "data-privacy", domains: ["security", "compliance"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 5 },
  // QA
  { id: "qa", domains: ["*"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 7 },
  { id: "test-plan", domains: ["*"], scope: ["planning"], defaultRole: "support", conflictsWith: [], weight: 4 },
  { id: "edge-cases", domains: ["*"], scope: ["validation"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "bug-report", domains: ["*"], scope: ["validation"], defaultRole: "support", conflictsWith: [], weight: 2 },
  { id: "a11y-check", domains: ["frontend", "ui"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 3 },
  // DevOps
  { id: "devops", domains: ["devops", "deployment", "infra"], scope: ["deployment"], defaultRole: "post", conflictsWith: [], weight: 7 },
  { id: "docker-compose", domains: ["devops", "deployment"], scope: ["deployment"], defaultRole: "support", conflictsWith: ["devops"], weight: 3 },
  { id: "monitoring-setup", domains: ["devops", "monitoring"], scope: ["deployment"], defaultRole: "post", conflictsWith: [], weight: 4 },
  { id: "env-audit", domains: ["devops", "security"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 3 },
  { id: "backup-plan", domains: ["devops"], scope: ["planning"], defaultRole: "support", conflictsWith: [], weight: 3 },
  // Research
  { id: "research", domains: ["product", "market"], scope: ["research"], defaultRole: "pre", conflictsWith: [], weight: 5 },
  { id: "market-scan", domains: ["product", "market"], scope: ["research"], defaultRole: "pre", conflictsWith: ["research"], weight: 3 },
  { id: "competitor-dive", domains: ["product", "market"], scope: ["research"], defaultRole: "pre", conflictsWith: [], weight: 4 },
  { id: "tech-radar", domains: ["*"], scope: ["research"], defaultRole: "pre", conflictsWith: [], weight: 4 },
  // Pipeline
  { id: "run-pipeline", domains: ["pipeline"], scope: ["implementation"], defaultRole: "primary", conflictsWith: [], weight: 8 },
  { id: "compare-runs", domains: ["pipeline", "analytics"], scope: ["validation"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "retro", domains: ["pipeline"], scope: ["validation"], defaultRole: "post", conflictsWith: [], weight: 3 },
  { id: "agent-memory", domains: ["pipeline", "kb"], scope: ["validation"], defaultRole: "post", conflictsWith: [], weight: 4 },
  { id: "kb-update", domains: ["kb"], scope: ["implementation"], defaultRole: "post", conflictsWith: [], weight: 3 },
  { id: "nightly-evolution", domains: ["pipeline", "kb"], scope: ["validation"], defaultRole: "post", conflictsWith: [], weight: 3 },
  // Meta
  { id: "figma", domains: ["design", "ui", "frontend"], scope: ["research", "implementation"], defaultRole: "pre", conflictsWith: [], weight: 6 },
  { id: "dead-code-scan", domains: ["*"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 2 },
  { id: "performance-pass", domains: ["*"], scope: ["validation"], defaultRole: "guard", conflictsWith: [], weight: 4 },
  { id: "dependency-map", domains: ["*"], scope: ["planning"], defaultRole: "support", conflictsWith: [], weight: 3 },
  { id: "cost-analysis", domains: ["analytics", "pipeline"], scope: ["validation"], defaultRole: "support", conflictsWith: [], weight: 3 },
];

// ── Agent definitions (from Agent Hub known set) ──

const AGENTS = [
  { id: "orchestrator", name: "Orchestrator", role: "orchestrator", team: "beauty-crm" },
  { id: "pm", name: "PM Agent", role: "pm", team: "beauty-crm" },
  { id: "architect", name: "Architect", role: "architect", team: "beauty-crm" },
  { id: "backend-dev", name: "Backend Dev", role: "backend", team: "beauty-crm" },
  { id: "frontend-dev", name: "Frontend Dev", role: "frontend", team: "beauty-crm" },
  { id: "designer", name: "Designer", role: "designer", team: "beauty-crm" },
  { id: "qa-agent", name: "QA Agent", role: "qa", team: "beauty-crm" },
  { id: "devops-agent", name: "DevOps Agent", role: "devops", team: "beauty-crm" },
  { id: "cyber-agent", name: "Cyber Agent", role: "cyber", team: "beauty-crm" },
  { id: "research-agent", name: "Research Agent", role: "research", team: "beauty-crm" },
  { id: "michael-bot", name: "Michael Bot", role: "assistant", team: "personal" },
  { id: "email-calendar", name: "Email/Calendar", role: "assistant", team: "personal" },
  { id: "tech-support", name: "Tech Support", role: "support", team: "personal" },
  { id: "assistant", name: "Assistant", role: "assistant", team: "personal" },
  { id: "avatar-prompter", name: "Avatar Prompter", role: "executor", team: "herald" },
  { id: "profile-generator", name: "Profile Generator", role: "executor", team: "herald" },
];

// ── Role → Skill mapping ──

const ROLE_SKILL_MAP: Record<string, string[]> = {
  orchestrator: ["run-pipeline", "preflight", "retro"],
  pm: ["pm", "user-story", "acceptance-gen", "feature-scope"],
  architect: ["architect", "api-design", "tech-decision", "dependency-map"],
  backend: ["backend", "api-scaffold", "db-schema", "db-migration"],
  frontend: ["frontend", "frontend-designer", "form-builder", "table-builder", "dashboard-builder", "animation"],
  designer: ["designer", "theme-factory", "figma"],
  qa: ["qa", "test-plan", "edge-cases", "bug-report", "a11y-check"],
  devops: ["devops", "docker-compose", "monitoring-setup", "env-audit", "backup-plan"],
  cyber: ["cyber", "auth-review", "threat-model", "secret-scan", "data-privacy"],
  research: ["research", "market-scan", "competitor-dive", "tech-radar"],
};

// ── Build graph ──

export interface GraphNode {
  id: string;
  name: string;
  type: "skill" | "agent" | "kb";
  group: string; // scope for skills, team for agents, category for KB
  val: number;   // node size
  color?: string;
  meta?: Record<string, unknown>;
}

export interface GraphLink {
  source: string;
  target: string;
  type: "conflict" | "team" | "agent-skill" | "kb-agent" | "kb-tag" | "domain";
  label?: string;
}

export async function GET() {
  try {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // 1. Skills as nodes
    for (const s of SKILLS) {
      nodes.push({
        id: `skill:${s.id}`,
        name: s.id,
        type: "skill",
        group: s.scope[0],
        val: s.weight,
        meta: { domains: s.domains, role: s.defaultRole },
      });

      // Conflict links
      for (const c of s.conflictsWith) {
        if (s.id < c) { // avoid duplicates
          links.push({ source: `skill:${s.id}`, target: `skill:${c}`, type: "conflict" });
        }
      }

      // Domain links — connect skills sharing same domain (only within same scope to reduce noise)
      for (const other of SKILLS) {
        if (other.id <= s.id) continue;
        if (other.scope[0] !== s.scope[0]) continue;
        const shared = s.domains.filter((d) => d !== "*" && other.domains.includes(d));
        if (shared.length > 0) {
          links.push({ source: `skill:${s.id}`, target: `skill:${other.id}`, type: "domain", label: shared[0] });
        }
      }
    }

    // 2. Agents as nodes
    for (const a of AGENTS) {
      nodes.push({
        id: `agent:${a.id}`,
        name: a.name,
        type: "agent",
        group: a.team,
        val: 8,
        meta: { role: a.role },
      });

      // Agent → Skill links
      const skillIds = ROLE_SKILL_MAP[a.role] || [];
      for (const sid of skillIds) {
        if (SKILLS.some((s) => s.id === sid)) {
          links.push({ source: `agent:${a.id}`, target: `skill:${sid}`, type: "agent-skill" });
        }
      }
    }

    // Agent team links
    const teamMap = new Map<string, string[]>();
    for (const a of AGENTS) {
      const arr = teamMap.get(a.team) || [];
      arr.push(`agent:${a.id}`);
      teamMap.set(a.team, arr);
    }
    for (const members of teamMap.values()) {
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          links.push({ source: members[i], target: members[j], type: "team" });
        }
      }
    }

    // 3. KB entries as nodes
    const categories = await getAllCategories();
    const kbTagIndex = new Map<string, string[]>(); // tag → node IDs

    for (const cat of categories) {
      const file = await readKBFile(cat);
      if (!file) continue;
      for (const entry of file.entries) {
        const nodeId = `kb:${entry.id}`;
        nodes.push({
          id: nodeId,
          name: entry.title,
          type: "kb",
          group: cat,
          val: entry.severity === "critical" ? 6 : entry.severity === "high" ? 4 : 3,
          meta: { severity: entry.severity, confidence: entry.confidence, tags: entry.tags },
        });

        // KB → Agent link
        if (entry.agentId) {
          const agentNodeId = `agent:${entry.agentId}`;
          if (nodes.some((n) => n.id === agentNodeId)) {
            links.push({ source: nodeId, target: agentNodeId, type: "kb-agent" });
          }
        }

        // Index tags for KB↔KB links
        for (const tag of entry.tags) {
          const arr = kbTagIndex.get(tag) || [];
          arr.push(nodeId);
          kbTagIndex.set(tag, arr);
        }
      }
    }

    // KB tag links (connect entries sharing tags, limit to avoid explosion)
    for (const [, ids] of kbTagIndex) {
      if (ids.length > 10) continue; // skip overly common tags
      for (let i = 0; i < ids.length; i++) {
        for (let j = i + 1; j < ids.length; j++) {
          links.push({ source: ids[i], target: ids[j], type: "kb-tag" });
        }
      }
    }

    return NextResponse.json({
      success: true,
      nodes,
      links,
      stats: {
        skills: SKILLS.length,
        agents: AGENTS.length,
        kb: nodes.filter((n) => n.type === "kb").length,
        links: links.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("[GET /api/knowledge-map]", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
