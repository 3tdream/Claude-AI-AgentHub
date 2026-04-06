"use client";

import { X, ArrowRight, Circle, Diamond, Hexagon, Square } from "lucide-react";

type ViewMode = "knowledge" | "architecture";

interface RelationsPanelProps {
  viewMode: ViewMode;
  onClose: () => void;
}

// ── Knowledge Graph model ──

const KB_NODES = [
  {
    letter: "S",
    label: "Skill",
    color: "#6366f1",
    description: "MC skill (slash command). Has domains, scope, weight, defaultRole.",
    examples: "architect, frontend, cyber, qa, run-pipeline",
  },
  {
    letter: "A",
    label: "Agent",
    color: "#10b981",
    description: "AI agent from Agent Hub. Belongs to a team, has a role that maps to skills.",
    examples: "Backend Dev, QA Agent, Orchestrator",
  },
  {
    letter: "K",
    label: "KB Entry",
    color: "#f59e0b",
    description: "Knowledge Base entry. Has severity, confidence, tags. Grouped by category.",
    examples: "failure-patterns, success-patterns, security-playbook",
  },
];

const KB_LINKS = [
  {
    label: "Agent → Skill",
    color: "#6366f1",
    style: "solid",
    rule: "Agent's role maps to skills via ROLE_SKILL_MAP.",
    example: "Backend Dev → backend, api-scaffold, db-schema, db-migration",
  },
  {
    label: "Team",
    color: "#10b981",
    style: "solid",
    rule: "Agents in the same team are connected (beauty-crm, personal, herald).",
    example: "Orchestrator ↔ PM ↔ Architect ↔ Backend Dev (all beauty-crm)",
  },
  {
    label: "Conflict",
    color: "#ef4444",
    style: "dashed",
    rule: "Skills that should NOT run together. Defined in conflictsWith[].",
    example: "architect ⚡ api-design, frontend ⚡ frontend-designer",
  },
  {
    label: "Domain",
    color: "#94a3b8",
    style: "solid",
    rule: "Skills sharing a domain within the same scope. Faint connection.",
    example: "backend + api-scaffold (both 'api' domain, 'implementation' scope)",
  },
  {
    label: "KB → Agent",
    color: "#f59e0b",
    style: "solid",
    rule: "KB entry linked to agent via agentId field (who triggered the learning).",
    example: "Failure pattern → QA Agent (QA discovered the issue)",
  },
  {
    label: "KB ↔ KB (tag)",
    color: "#fbbf24",
    style: "solid",
    rule: "KB entries sharing tags are connected. Common tags (>10 entries) excluded to reduce noise.",
    example: "Two failure patterns both tagged 'hydration' are linked",
  },
];

const KB_RULES = [
  { title: "Skill selection", desc: "skill-router scores: relevance + KB boost + project fit. Top 2-6 skills assigned roles (pre, primary, support, guard, post)." },
  { title: "Conflict resolution", desc: "If two conflicting skills both score high, the one with higher weight wins. The other is excluded." },
  { title: "KB boost", desc: "If KB has a failure pattern matching a skill's domain, that skill gets +2 relevance (guard skills especially)." },
  { title: "Agent assignment", desc: "agent-router maps task keywords to agentId. Each agent runs the skills matching its role." },
];

// ── Architecture model ──

const ARCH_NODES = [
  {
    letter: "P",
    shape: "circle",
    label: "Page",
    color: "#3b82f6",
    description: "Next.js page in app/(shell)/. Client component using SWR for data fetching.",
  },
  {
    letter: "A",
    shape: "circle",
    label: "API Route",
    color: "#8b5cf6",
    description: "Next.js API route in app/api/. Proxies to Agent Hub or processes locally.",
  },
  {
    letter: "S",
    shape: "hexagon",
    label: "Zustand Store",
    color: "#f59e0b",
    description: "Client-side state persisted across page navigations. 4 stores total.",
  },
  {
    letter: "L",
    shape: "circle",
    label: "Lib Module",
    color: "#10b981",
    description: "Server-side library. Core business logic — routing, execution, KB, quality.",
  },
  {
    letter: "D",
    shape: "rect",
    label: "Data File",
    color: "#6366f1",
    description: "JSON file or directory in data/. File-based storage (no DB yet).",
  },
  {
    letter: "X",
    shape: "diamond",
    label: "External Service",
    color: "#ef4444",
    description: "External API — Agent Hub MCP, Anthropic API, Jira Cloud, Figma.",
  },
];

const ARCH_LINKS = [
  {
    label: "Calls",
    color: "#8b5cf6",
    style: "solid",
    rule: "Direct function call or HTTP request. Page → API, Lib → Lib.",
    arrow: true,
  },
  {
    label: "Uses",
    color: "#10b981",
    style: "solid",
    rule: "Import dependency. Page → Store, API → Lib module.",
    arrow: true,
  },
  {
    label: "Reads",
    color: "#3b82f6",
    style: "solid",
    rule: "Reads data from file/service. Lib → Data, Lib → External.",
    arrow: true,
  },
  {
    label: "Writes",
    color: "#ef4444",
    style: "solid",
    rule: "Writes/mutates data. Execution Logger → pipeline-runs/, KB Evolution → knowledge-base/.",
    arrow: true,
  },
  {
    label: "Feeds",
    color: "#f59e0b",
    style: "dashed",
    rule: "Learning loop. Pipeline results feed back into KB. User feedback enriches patterns.",
    arrow: true,
  },
  {
    label: "Proxies",
    color: "#ec4899",
    style: "solid",
    rule: "Pass-through proxy with caching. Agent Hub APIs → External Agent Hub MCP.",
    arrow: true,
  },
];

const ARCH_FLOWS = [
  {
    title: "Pipeline execution flow",
    steps: [
      "Home (P) → Pipeline Route (A)",
      "→ Smart Router (L) classifies complexity",
      "→ Skill Router (L) assigns skills from KB",
      "→ Preflight Simulation (L) checks KB + analytics",
      "→ Pipeline Executor (L) runs steps via Agent Hub Client (L)",
      "→ Agent Hub Client → Agent Hub MCP (X)",
      "→ Quality Evaluator (L) + Confidence Gate (L) validate",
      "→ Execution Logger (L) → pipeline-runs/ (D)",
      "→ KB Storage (L) ← success/failure patterns (feeds)",
    ],
  },
  {
    title: "Chat flow",
    steps: [
      "Home (P) → Chat Store (S)",
      "→ Chat API (A) → Agent Hub Client (L)",
      "→ Agent Hub MCP (X)",
      "→ Activity Store (S) logs events",
    ],
  },
  {
    title: "KB learning loop",
    steps: [
      "Pipeline fails → failure-patterns/ (D)",
      "Pipeline succeeds → success-patterns/ (D)",
      "User feedback → KB Enrich (A) → KB Storage (L)",
      "KB Evolution (L) prunes stale entries nightly",
      "Next pipeline → Preflight reads KB → better routing",
    ],
  },
];

export function RelationsPanel({ viewMode, onClose }: RelationsPanelProps) {
  const isKb = viewMode === "knowledge";

  return (
    <div className="absolute top-0 right-0 h-full w-80 bg-card/95 backdrop-blur border-l border-border z-10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-mono text-xs font-bold uppercase tracking-wide">
          {isKb ? "Knowledge Graph Model" : "Architecture Model"}
        </h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Node types */}
        <section>
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Node Types</h4>
          <div className="space-y-2.5">
            {(isKb ? KB_NODES : ARCH_NODES).map((n) => (
              <div key={n.letter} className="flex gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: n.color }}
                >
                  <span className="text-white text-[10px] font-bold font-mono">{n.letter}</span>
                </div>
                <div>
                  <div className="font-mono text-xs font-semibold text-foreground">{n.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground leading-relaxed">{n.description}</div>
                  {"examples" in n && n.examples && (
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">e.g. {n.examples}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Link types */}
        <section>
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Link Types</h4>
          <div className="space-y-2.5">
            {(isKb ? KB_LINKS : ARCH_LINKS).map((l) => (
              <div key={l.label} className="flex gap-2.5">
                <div className="flex items-center shrink-0 mt-1.5 w-6 justify-center">
                  <div
                    className="w-5 h-0.5"
                    style={{
                      backgroundColor: l.color,
                      borderTop: l.style === "dashed" ? `2px dashed ${l.color}` : undefined,
                      height: l.style === "dashed" ? 0 : 2,
                    }}
                  />
                </div>
                <div>
                  <div className="font-mono text-xs font-semibold" style={{ color: l.color }}>{l.label}</div>
                  <div className="font-mono text-[10px] text-muted-foreground leading-relaxed">{l.rule}</div>
                  {"example" in l && l.example && (
                    <div className="font-mono text-[10px] text-slate-500 mt-0.5">{l.example}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Rules / Flows */}
        <section>
          <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
            {isKb ? "Selection Rules" : "Data Flows"}
          </h4>
          <div className="space-y-3">
            {isKb
              ? KB_RULES.map((r) => (
                  <div key={r.title}>
                    <div className="font-mono text-[11px] font-semibold text-foreground">{r.title}</div>
                    <div className="font-mono text-[10px] text-muted-foreground leading-relaxed">{r.desc}</div>
                  </div>
                ))
              : ARCH_FLOWS.map((f) => (
                  <div key={f.title}>
                    <div className="font-mono text-[11px] font-semibold text-foreground mb-1">{f.title}</div>
                    <div className="space-y-0.5">
                      {f.steps.map((s, i) => (
                        <div key={i} className="font-mono text-[10px] text-muted-foreground flex gap-1">
                          <span className="text-slate-600 shrink-0">{i === 0 ? "1." : `${i + 1}.`}</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
