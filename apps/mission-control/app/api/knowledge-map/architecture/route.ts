import { NextResponse } from "next/server";

// ── MC System Architecture Graph ──
// Static model of how Mission Control components connect

export interface ArchNode {
  id: string;
  name: string;
  type: "page" | "api" | "store" | "lib" | "data" | "external";
  group: string;
  val: number;
  description?: string;
}

export interface ArchLink {
  source: string;
  target: string;
  type: "calls" | "reads" | "writes" | "uses" | "feeds" | "proxies";
  label?: string;
}

// ── Pages ──
const PAGES: ArchNode[] = [
  { id: "p:home", name: "Home", type: "page", group: "ui", val: 8, description: "Dashboard home with pipeline execution" },
  { id: "p:dashboard", name: "Dashboard", type: "page", group: "ui", val: 7 },
  { id: "p:teams", name: "Teams", type: "page", group: "ui", val: 5 },
  { id: "p:teams-detail", name: "Team Detail", type: "page", group: "ui", val: 4 },
  { id: "p:logs", name: "Logs", type: "page", group: "ui", val: 5 },
  { id: "p:costs", name: "Costs", type: "page", group: "ui", val: 5 },
  { id: "p:analytics", name: "Analytics", type: "page", group: "ui", val: 6 },
  { id: "p:jira", name: "Jira", type: "page", group: "ui", val: 5 },
  { id: "p:projects", name: "Projects", type: "page", group: "ui", val: 6 },
  { id: "p:integrations", name: "Integrations", type: "page", group: "ui", val: 4 },
  { id: "p:knowledge", name: "Knowledge", type: "page", group: "ui", val: 5 },
  { id: "p:knowledge-map", name: "Knowledge Map", type: "page", group: "ui", val: 5 },
  { id: "p:settings", name: "Settings", type: "page", group: "ui", val: 4 },
  { id: "p:health", name: "Health", type: "page", group: "ui", val: 3 },
  { id: "p:guide", name: "Guide", type: "page", group: "ui", val: 3 },
  { id: "p:setup", name: "Setup", type: "page", group: "ui", val: 4, description: "Onboarding wizard — system readiness checks" },
];

// ── API Routes (grouped by domain) ──
const APIS: ArchNode[] = [
  // Pipeline
  { id: "a:pipeline/route", name: "Pipeline Route", type: "api", group: "pipeline", val: 9, description: "Smart routing + simulation + auto-replan" },
  { id: "a:pipeline/simulate", name: "Simulate", type: "api", group: "pipeline", val: 7 },
  { id: "a:pipeline/replan", name: "Replan", type: "api", group: "pipeline", val: 6 },
  { id: "a:pipeline/execute", name: "Execute", type: "api", group: "pipeline", val: 8 },
  { id: "a:pipeline/history", name: "History", type: "api", group: "pipeline", val: 5 },
  { id: "a:pipeline/stats", name: "Stats", type: "api", group: "pipeline", val: 4 },
  { id: "a:pipeline/contracts", name: "Contracts", type: "api", group: "pipeline", val: 5 },
  { id: "a:pipeline/analytics", name: "Analytics", type: "api", group: "pipeline", val: 5 },
  { id: "a:pipeline/evolution", name: "Evolution", type: "api", group: "pipeline", val: 4 },
  { id: "a:pipeline/baselines", name: "Baselines", type: "api", group: "pipeline", val: 4 },
  // KB
  { id: "a:knowledge-base", name: "KB Read", type: "api", group: "kb", val: 7 },
  { id: "a:knowledge-base/sync", name: "KB Sync", type: "api", group: "kb", val: 5 },
  { id: "a:knowledge/enrich", name: "KB Enrich", type: "api", group: "kb", val: 5 },
  { id: "a:knowledge/evolve", name: "KB Evolve", type: "api", group: "kb", val: 5 },
  { id: "a:knowledge/feedback", name: "KB Feedback", type: "api", group: "kb", val: 4 },
  { id: "a:knowledge/success", name: "KB Success", type: "api", group: "kb", val: 4 },
  { id: "a:knowledge-map", name: "KB Map", type: "api", group: "kb", val: 5 },
  // Agent Hub
  { id: "a:agent-hub/agents", name: "Agents", type: "api", group: "agents", val: 7 },
  { id: "a:agent-hub/teams", name: "Teams", type: "api", group: "agents", val: 6 },
  { id: "a:agent-hub/sessions", name: "Sessions", type: "api", group: "agents", val: 6 },
  { id: "a:agent-hub/execute", name: "Agent Execute", type: "api", group: "agents", val: 8 },
  { id: "a:agent-hub/models", name: "Models", type: "api", group: "agents", val: 4 },
  { id: "a:agent-hub/costs", name: "Agent Costs", type: "api", group: "agents", val: 5 },
  // Projects
  { id: "a:projects/list", name: "Project List", type: "api", group: "projects", val: 5 },
  { id: "a:projects/context", name: "Project Context", type: "api", group: "projects", val: 5 },
  { id: "a:projects/discover", name: "Project Discover", type: "api", group: "projects", val: 4 },
  // System
  { id: "a:health", name: "Health", type: "api", group: "system", val: 5, description: "System health endpoint — data dir, API keys, Docker HEALTHCHECK" },
  { id: "a:system/health", name: "System Health (legacy)", type: "api", group: "system", val: 3 },
  { id: "a:system/config", name: "System Config", type: "api", group: "system", val: 4 },
  { id: "a:system/deploy-check", name: "Deploy Check", type: "api", group: "system", val: 3 },
  // Execution
  { id: "a:command", name: "Command", type: "api", group: "execution", val: 7 },
  { id: "a:chat", name: "Chat", type: "api", group: "execution", val: 7 },
  { id: "a:ai/execute", name: "AI Execute", type: "api", group: "execution", val: 6 },
  { id: "a:skills/route", name: "Skill Route", type: "api", group: "execution", val: 6 },
  // Jira
  { id: "a:jira/issues", name: "Jira Issues", type: "api", group: "jira", val: 5 },
  { id: "a:jira/sync", name: "Jira Sync", type: "api", group: "jira", val: 4 },
  { id: "a:jira/config", name: "Jira Config", type: "api", group: "jira", val: 4 },
  // Costs
  { id: "a:costs/anthropic", name: "Anthropic Costs", type: "api", group: "costs", val: 5 },
  // Notifications
  { id: "a:notifications", name: "Notifications", type: "api", group: "system", val: 5, description: "Pipeline event alerts — GET list, POST create, PATCH read" },
];

// ── Stores ──
const STORES: ArchNode[] = [
  { id: "s:orchestration", name: "Orchestration Store", type: "store", group: "state", val: 9, description: "Workflows, execution history, slots, core pipelines" },
  { id: "s:chat", name: "Chat Store", type: "store", group: "state", val: 7, description: "Sessions, messages, agent selection" },
  { id: "s:activity", name: "Activity Store", type: "store", group: "state", val: 6, description: "Event log with 14+ event types" },
  { id: "s:app", name: "App Store", type: "store", group: "state", val: 6, description: "Sidebar, theme, settings, active project" },
];

// ── Core Lib Modules ──
const LIBS: ArchNode[] = [
  // Pipeline core
  { id: "l:pipeline-executor", name: "Pipeline Executor", type: "lib", group: "pipeline-core", val: 10, description: "Main execution engine with retries, quality, confidence" },
  { id: "l:smart-router", name: "Smart Router", type: "lib", group: "pipeline-core", val: 8, description: "Task complexity classification" },
  { id: "l:skill-router", name: "Skill Router", type: "lib", group: "pipeline-core", val: 8, description: "Adaptive skill orchestration" },
  { id: "l:agent-router", name: "Agent Router", type: "lib", group: "pipeline-core", val: 6, description: "Map task to best agent" },
  { id: "l:preflight-sim", name: "Preflight Simulation", type: "lib", group: "pipeline-core", val: 7, description: "Simulate against KB + analytics" },
  { id: "l:strategy-architect", name: "Strategy Architect", type: "lib", group: "pipeline-core", val: 6, description: "Auto-replan on low confidence" },
  // Quality
  { id: "l:quality-evaluator", name: "Quality Evaluator", type: "lib", group: "quality", val: 6 },
  { id: "l:stage-contracts", name: "Stage Contracts", type: "lib", group: "quality", val: 6 },
  { id: "l:confidence-gate", name: "Confidence Gate", type: "lib", group: "quality", val: 5 },
  { id: "l:design-validator", name: "Design Validator", type: "lib", group: "quality", val: 4 },
  { id: "l:eval-baselines", name: "Eval Baselines", type: "lib", group: "quality", val: 4 },
  // KB
  { id: "l:kb-storage", name: "KB Storage", type: "lib", group: "kb-core", val: 8, description: "Read, write, search across categories" },
  { id: "l:kb-evolution", name: "KB Evolution", type: "lib", group: "kb-core", val: 5 },
  { id: "l:kb-agent-context", name: "KB Agent Context", type: "lib", group: "kb-core", val: 5 },
  { id: "l:kb-multi-project", name: "KB Multi-Project", type: "lib", group: "kb-core", val: 5 },
  // Agent integration
  { id: "l:agent-hub-client", name: "Agent Hub Client", type: "lib", group: "agent-core", val: 8, description: "Agent Hub API integration" },
  { id: "l:direct-ai-client", name: "Direct AI Client", type: "lib", group: "agent-core", val: 6, description: "Bypass Agent Hub for direct Claude calls" },
  { id: "l:agent-prompt-loader", name: "Prompt Loader", type: "lib", group: "agent-core", val: 5 },
  // Resources
  { id: "l:budget-manager", name: "Budget Manager", type: "lib", group: "resources", val: 6, description: "Token budget, cost calc, mode downgrade" },
  { id: "l:notifications", name: "Notifications Storage", type: "lib", group: "resources", val: 5, description: "Pipeline event notifications with read/unread state" },
  // System
  { id: "l:config", name: "Config", type: "lib", group: "system-core", val: 5, description: "Central configuration constants" },
  { id: "l:monitoring", name: "Monitoring", type: "lib", group: "system-core", val: 4 },
  { id: "l:execution-logger", name: "Execution Logger", type: "lib", group: "system-core", val: 5 },
  // Context
  { id: "l:project-context", name: "Project Context Loader", type: "lib", group: "context", val: 5 },
  { id: "l:project-discovery", name: "Project Discovery", type: "lib", group: "context", val: 4 },
  { id: "l:intent-classifier", name: "Intent Classifier", type: "lib", group: "context", val: 5 },
];

// ── Data Files ──
const DATA: ArchNode[] = [
  { id: "d:active-projects", name: "active-projects.json", type: "data", group: "data", val: 4 },
  { id: "d:pipeline-analytics", name: "pipeline-analytics.json", type: "data", group: "data", val: 5 },
  { id: "d:eval-baselines", name: "eval-baselines.json", type: "data", group: "data", val: 4 },
  { id: "d:logs", name: "logs.json", type: "data", group: "data", val: 4 },
  { id: "d:pipeline-runs", name: "pipeline-runs/", type: "data", group: "data", val: 6 },
  { id: "d:kb-dir", name: "knowledge-base/", type: "data", group: "data", val: 7 },
  { id: "d:jira-config", name: "jira-config.json", type: "data", group: "data", val: 3 },
  { id: "d:costs-config", name: "costs-config.json", type: "data", group: "data", val: 3 },
  { id: "d:agent-overrides", name: "agent-overrides.json", type: "data", group: "data", val: 3 },
];

// ── External Services ──
const EXTERNALS: ArchNode[] = [
  { id: "x:agent-hub", name: "Agent Hub (claude.ai)", type: "external", group: "external", val: 10, description: "AI Agent Hub MCP" },
  { id: "x:anthropic-api", name: "Anthropic API", type: "external", group: "external", val: 8 },
  { id: "x:jira-cloud", name: "Jira Cloud", type: "external", group: "external", val: 6 },
  { id: "x:figma", name: "Figma", type: "external", group: "external", val: 4 },
];

// ── Links (data flow) ──
const LINKS: ArchLink[] = [
  // Pages → APIs
  { source: "p:home", target: "a:pipeline/route", type: "calls" },
  { source: "p:home", target: "a:pipeline/history", type: "calls" },
  { source: "p:home", target: "a:pipeline/stats", type: "calls" },
  { source: "p:home", target: "a:projects/list", type: "calls" },
  { source: "p:dashboard", target: "a:agent-hub/agents", type: "calls" },
  { source: "p:dashboard", target: "a:pipeline/stats", type: "calls" },
  { source: "p:dashboard", target: "a:system/health", type: "calls" },
  { source: "p:teams", target: "a:agent-hub/teams", type: "calls" },
  { source: "p:teams-detail", target: "a:agent-hub/agents", type: "calls" },
  { source: "p:logs", target: "a:pipeline/history", type: "calls" },
  { source: "p:costs", target: "a:costs/anthropic", type: "calls" },
  { source: "p:costs", target: "a:agent-hub/costs", type: "calls" },
  { source: "p:analytics", target: "a:pipeline/analytics", type: "calls" },
  { source: "p:analytics", target: "a:pipeline/baselines", type: "calls" },
  { source: "p:jira", target: "a:jira/issues", type: "calls" },
  { source: "p:jira", target: "a:jira/sync", type: "calls" },
  { source: "p:projects", target: "a:projects/list", type: "calls" },
  { source: "p:projects", target: "a:projects/discover", type: "calls" },
  { source: "p:integrations", target: "a:system/config", type: "calls" },
  { source: "p:knowledge", target: "a:knowledge-base", type: "calls" },
  { source: "p:knowledge-map", target: "a:knowledge-map", type: "calls" },
  { source: "p:settings", target: "a:system/config", type: "calls" },
  { source: "p:health", target: "a:system/health", type: "calls" },
  { source: "p:health", target: "a:system/deploy-check", type: "calls" },
  { source: "p:setup", target: "a:health", type: "calls" },
  { source: "p:setup", target: "a:jira/config", type: "calls" },

  // Pages → Stores
  { source: "p:home", target: "s:orchestration", type: "uses" },
  { source: "p:home", target: "s:chat", type: "uses" },
  { source: "p:home", target: "s:activity", type: "uses" },
  { source: "p:dashboard", target: "s:app", type: "uses" },
  { source: "p:analytics", target: "s:orchestration", type: "uses" },
  { source: "p:projects", target: "s:app", type: "uses", label: "activeProjectId" },

  // APIs → Libs (pipeline flow)
  { source: "a:pipeline/route", target: "l:smart-router", type: "uses" },
  { source: "a:pipeline/route", target: "l:skill-router", type: "uses" },
  { source: "a:pipeline/route", target: "l:preflight-sim", type: "uses" },
  { source: "a:pipeline/simulate", target: "l:preflight-sim", type: "uses" },
  { source: "a:pipeline/replan", target: "l:strategy-architect", type: "uses" },
  { source: "a:pipeline/execute", target: "l:pipeline-executor", type: "uses" },
  { source: "a:pipeline/contracts", target: "l:stage-contracts", type: "uses" },
  { source: "a:pipeline/baselines", target: "l:eval-baselines", type: "uses" },
  { source: "a:command", target: "l:intent-classifier", type: "uses" },
  { source: "a:command", target: "l:smart-router", type: "uses" },
  { source: "a:chat", target: "l:agent-hub-client", type: "uses" },
  { source: "a:ai/execute", target: "l:direct-ai-client", type: "uses" },
  { source: "a:skills/route", target: "l:skill-router", type: "uses" },
  { source: "a:agent-hub/execute", target: "l:agent-hub-client", type: "proxies" },
  { source: "a:agent-hub/agents", target: "l:agent-hub-client", type: "proxies" },
  { source: "a:agent-hub/teams", target: "l:agent-hub-client", type: "proxies" },
  { source: "a:agent-hub/sessions", target: "l:agent-hub-client", type: "proxies" },
  { source: "a:agent-hub/costs", target: "l:agent-hub-client", type: "proxies" },

  // KB APIs → KB libs
  { source: "a:knowledge-base", target: "l:kb-storage", type: "uses" },
  { source: "a:knowledge/enrich", target: "l:kb-storage", type: "uses" },
  { source: "a:knowledge/evolve", target: "l:kb-evolution", type: "uses" },
  { source: "a:knowledge-map", target: "l:kb-storage", type: "reads" },

  // Project APIs → libs
  { source: "a:projects/list", target: "l:project-discovery", type: "uses" },
  { source: "a:projects/context", target: "l:project-context", type: "uses" },
  { source: "a:costs/anthropic", target: "l:budget-manager", type: "uses" },

  // Jira
  { source: "a:jira/issues", target: "x:jira-cloud", type: "proxies" },
  { source: "a:jira/sync", target: "x:jira-cloud", type: "proxies" },
  { source: "a:jira/config", target: "d:jira-config", type: "reads" },

  // Lib → Lib (core pipeline flow)
  { source: "l:pipeline-executor", target: "l:agent-hub-client", type: "calls", label: "execute step" },
  { source: "l:pipeline-executor", target: "l:quality-evaluator", type: "calls", label: "evaluate" },
  { source: "l:pipeline-executor", target: "l:confidence-gate", type: "calls", label: "check confidence" },
  { source: "l:pipeline-executor", target: "l:budget-manager", type: "calls", label: "check budget" },
  { source: "l:pipeline-executor", target: "l:stage-contracts", type: "calls", label: "validate" },
  { source: "l:pipeline-executor", target: "l:kb-agent-context", type: "reads", label: "KB context" },
  { source: "l:pipeline-executor", target: "l:execution-logger", type: "writes" },
  { source: "l:smart-router", target: "l:agent-hub-client", type: "calls", label: "classify" },
  { source: "l:skill-router", target: "l:kb-storage", type: "reads", label: "KB boost" },
  { source: "l:preflight-sim", target: "l:kb-storage", type: "reads" },
  { source: "l:preflight-sim", target: "l:stage-contracts", type: "reads" },
  { source: "l:strategy-architect", target: "l:agent-hub-client", type: "calls", label: "replan" },
  { source: "l:quality-evaluator", target: "l:eval-baselines", type: "reads" },
  { source: "l:kb-evolution", target: "l:kb-storage", type: "writes" },
  { source: "l:kb-agent-context", target: "l:kb-storage", type: "reads" },
  { source: "l:kb-multi-project", target: "l:kb-storage", type: "reads" },

  // Lib → External
  { source: "l:agent-hub-client", target: "x:agent-hub", type: "calls", label: "MCP proxy" },
  { source: "l:direct-ai-client", target: "x:anthropic-api", type: "calls", label: "direct API" },
  { source: "l:budget-manager", target: "x:anthropic-api", type: "reads", label: "usage" },

  // Lib → Data
  { source: "l:kb-storage", target: "d:kb-dir", type: "reads" },
  { source: "l:kb-evolution", target: "d:kb-dir", type: "writes" },
  { source: "l:execution-logger", target: "d:pipeline-runs", type: "writes" },
  { source: "l:execution-logger", target: "d:logs", type: "writes" },
  { source: "l:eval-baselines", target: "d:eval-baselines", type: "reads" },
  { source: "l:config", target: "d:costs-config", type: "reads" },
  { source: "l:agent-prompt-loader", target: "d:agent-overrides", type: "reads" },

  // Stores → APIs (hydration)
  { source: "s:orchestration", target: "a:pipeline/route", type: "calls" },
  { source: "s:orchestration", target: "a:pipeline/execute", type: "calls" },
  { source: "s:chat", target: "a:chat", type: "calls" },
  { source: "s:chat", target: "a:agent-hub/sessions", type: "calls" },

  // Notifications
  { source: "p:home", target: "a:notifications", type: "calls", label: "bell icon" },
  { source: "a:notifications", target: "l:notifications", type: "uses" },
  { source: "l:pipeline-executor", target: "l:notifications", type: "writes", label: "pipeline events" },

  // Learning loop
  { source: "l:pipeline-executor", target: "l:kb-storage", type: "feeds", label: "success/failure" },
  { source: "a:knowledge/feedback", target: "l:kb-storage", type: "feeds", label: "user feedback" },
  { source: "a:pipeline/evolution", target: "l:kb-evolution", type: "feeds" },
];

export async function GET() {
  const nodes = [...PAGES, ...APIS, ...STORES, ...LIBS, ...DATA, ...EXTERNALS];
  const nodeIds = new Set(nodes.map((n) => n.id));
  const validLinks = LINKS.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target));

  return NextResponse.json({
    success: true,
    nodes,
    links: validLinks,
    stats: {
      pages: PAGES.length,
      apis: APIS.length,
      stores: STORES.length,
      libs: LIBS.length,
      data: DATA.length,
      externals: EXTERNALS.length,
      links: validLinks.length,
    },
  });
}
