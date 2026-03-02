"use client";

import { useState, useMemo } from "react";
import { Download, Search, Loader2 } from "lucide-react";
import { ScoreBar } from "./score-bar";
import { ScoreCircle } from "./score-circle";
import { StatPill } from "./stat-pill";
import { FilterTabs } from "./filter-tabs";
import { useAgents } from "@/lib/hooks/use-agents";
import { useCostSummary } from "@/lib/hooks/use-costs";
import { useTeams } from "@/lib/hooks/use-teams";
import type { Agent, LLMProvider, AssistantCost, Team } from "@/types";

const agentIcons: Record<string, string> = {
  orchestrator: "\u{1F9E0}", "pm-agent": "\u{1F4CB}", "architect-agent": "\u{1F3D7}\uFE0F",
  "backend-agent": "\u2699\uFE0F", "frontend-agent": "\u{1F5A5}\uFE0F", "designer-agent": "\u{1F3A8}",
  "qa-agent": "\u{1F50D}", "devops-agent": "\u{1F680}", "cyber-agent": "\u{1F6E1}\uFE0F",
  "research-agent": "\u{1F52C}", "michael-personal-bot": "\u{1F4AC}",
  "email & calendar manager": "\u{1F4E7}", "tech-support-agent": "\u{1F527}",
  assistant: "\u{1F916}", "herald-avatar-prompter": "\u{1F5BC}\uFE0F", "herald-profile-generator": "\u{1F4DD}",
};

function getIcon(name: string): string {
  const key = name.toLowerCase();
  return agentIcons[key] || "\u{1F916}";
}

const providerColors: Record<LLMProvider, string> = {
  anthropic: "border-orange-500/30 text-orange-400 bg-orange-500/5",
  openai: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  google: "border-blue-500/30 text-blue-400 bg-blue-500/5",
  openrouter: "border-purple-500/30 text-purple-400 bg-purple-500/5",
};

function getActivityStatus(lastAccessed: string | undefined): "active" | "standby" | "offline" {
  if (!lastAccessed) return "offline";
  const daysAgo = (Date.now() - new Date(lastAccessed).getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo <= 3) return "active";
  if (daysAgo <= 14) return "standby";
  return "offline";
}

function getTeamGroup(agent: Agent, teamMap: Map<string, Team>): string {
  if (agent.teams.length === 0) {
    // classify by name pattern
    if (agent.name.startsWith("herald-")) return "herald";
    return "personal";
  }
  const team = teamMap.get(agent.teams[0]);
  if (team?.name.includes("Orchestrator") || team?.name.includes("CRM")) return "crm-pipeline";
  return team?.id || "other";
}

interface AgentRow {
  agent: Agent;
  icon: string;
  group: string;
  teamName: string;
  cost: number;
  requests: number;
  tokens: number;
  costShare: number; // 0-100
  status: "active" | "standby" | "offline";
}

export function AgentKPITable() {
  const { agents, isLoading: agentsLoading } = useAgents();
  const { costs, isLoading: costsLoading } = useCostSummary();
  const { teams, isLoading: teamsLoading } = useTeams();

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState(-1);
  const [sortDir, setSortDir] = useState(1);

  const isLoading = agentsLoading || costsLoading || teamsLoading;

  // Build lookup maps
  const teamMap = useMemo(() => {
    const m = new Map<string, Team>();
    for (const t of teams) m.set(t.id, t);
    return m;
  }, [teams]);

  const costByAgent = useMemo(() => {
    const m = new Map<string, AssistantCost>();
    if (costs?.byAssistant) {
      for (const ac of costs.byAssistant) {
        m.set(ac.assistantId, ac);
      }
    }
    return m;
  }, [costs]);

  // Build rows from real data
  const rows = useMemo<AgentRow[]>(() => {
    const totalCost = costs?.totalCost || 1;
    return agents.map((agent) => {
      const ac = costByAgent.get(agent.id);
      const cost = ac?.cost ?? 0;
      const requests = ac?.requests ?? 0;
      const tokens = ac?.tokens ?? 0;
      const group = getTeamGroup(agent, teamMap);
      const teamId = agent.teams[0];
      const teamObj = teamId ? teamMap.get(teamId) : null;

      return {
        agent,
        icon: getIcon(agent.name),
        group,
        teamName: teamObj?.name || (agent.name.startsWith("herald-") ? "Herald" : "Personal"),
        cost,
        requests,
        tokens,
        costShare: Math.round((cost / totalCost) * 100),
        status: getActivityStatus(agent.lastAccessedAt),
      };
    });
  }, [agents, costs, costByAgent, teamMap]);

  // Build filter tabs dynamically
  const filterItems = useMemo(() => {
    const groups = new Set(rows.map((r) => r.group));
    const items = [{ value: "all", label: "All" }];
    if (groups.has("crm-pipeline")) items.push({ value: "crm-pipeline", label: "CRM Pipeline" });
    if (groups.has("personal")) items.push({ value: "personal", label: "Personal" });
    if (groups.has("herald")) items.push({ value: "herald", label: "Herald" });
    return items;
  }, [rows]);

  // Filter + sort
  const filtered = useMemo(() => {
    let data = [...rows];
    if (filter !== "all") data = data.filter((r) => r.group === filter);
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.agent.name.toLowerCase().includes(q) ||
        r.agent.llmModel.toLowerCase().includes(q) ||
        r.teamName.toLowerCase().includes(q)
      );
    }
    if (sortCol >= 0) {
      data.sort((a, b) => {
        const keys = ["name", "provider", "status", "team", "cost", "requests", "tokens", "costShare"] as const;
        const key = keys[sortCol];
        let va: number | string, vb: number | string;
        if (key === "name") { va = a.agent.name; vb = b.agent.name; }
        else if (key === "provider") { va = a.agent.llmProvider; vb = b.agent.llmProvider; }
        else if (key === "status") { va = a.status; vb = b.status; }
        else if (key === "team") { va = a.teamName; vb = b.teamName; }
        else { va = a[key]; vb = b[key]; }
        if (typeof va === "number" && typeof vb === "number") return (va - vb) * sortDir;
        return String(va).localeCompare(String(vb)) * sortDir;
      });
    }
    return data;
  }, [rows, filter, search, sortCol, sortDir]);

  const activeCount = rows.filter((r) => r.status === "active").length;
  const totalCost = costs?.totalCost ?? 0;
  const totalRequests = costs?.totalRequests ?? 0;

  function handleSort(col: number) {
    if (sortCol === col) setSortDir((d) => d * -1);
    else { setSortCol(col); setSortDir(-1); }
  }

  function exportCSV() {
    const headers = ["Agent", "Model", "Provider", "Status", "Team", "Cost ($)", "Requests", "Tokens", "Cost Share (%)"];
    const csvRows = rows.map((r) => [
      r.agent.name, r.agent.llmModel, r.agent.llmProvider, r.status,
      r.teamName, r.cost.toFixed(4), r.requests, r.tokens, r.costShare + "%",
    ]);
    const csv = [headers, ...csvRows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "agent-kpi-2026.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const thClass = "font-mono text-xs tracking-widest uppercase text-muted-foreground px-5 py-4 text-left whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors";

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="w-8 h-8 animate-spin mb-4 opacity-40" />
        <p className="font-mono text-sm">Loading agent data from Agent Hub...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ background: "linear-gradient(135deg, #fff 0%, #06b6d4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Agent KPI Dashboard
          </h1>
          <p className="font-mono text-sm text-muted-foreground mt-2 tracking-widest uppercase">
            AI Orchestrator Squad &middot; {agents.length} Agents &middot; Live Data
          </p>
        </div>
        <div className="flex gap-4">
          <StatPill value={agents.length} label="Agents" />
          <StatPill value={`$${totalCost.toFixed(2)}`} label="Total Cost" />
          <StatPill value={totalRequests} label="Requests" />
          <StatPill value={activeCount} label="Active" color="#10b981" />
        </div>
      </div>

      {/* Filters + Search */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FilterTabs items={filterItems} active={filter} onChange={setFilter} />
        <div className="flex gap-2.5 items-center">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card border border-border rounded-lg pl-9 pr-4 py-2 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none w-56 transition-colors"
            />
          </div>
          <button onClick={exportCSV} className="font-mono text-xs px-4 py-2 rounded-lg border border-primary bg-primary/10 text-secondary hover:bg-primary/20 transition-all uppercase tracking-wider flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border" style={{ background: "linear-gradient(90deg, rgba(124,58,237,0.15), rgba(6,182,212,0.05))" }}>
                <th className={thClass} onClick={() => handleSort(0)}>Agent{sortCol === 0 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
                <th className={thClass} onClick={() => handleSort(1)}>Provider{sortCol === 1 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
                <th className={thClass} onClick={() => handleSort(2)}>Status{sortCol === 2 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
                <th className={thClass} onClick={() => handleSort(3)}>Team{sortCol === 3 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
                <th className={thClass} onClick={() => handleSort(4)}>Cost{sortCol === 4 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
                <th className={thClass} onClick={() => handleSort(5)}>Requests{sortCol === 5 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
                <th className={thClass} onClick={() => handleSort(6)}>Tokens{sortCol === 6 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
                <th className={thClass} onClick={() => handleSort(7)}>Cost Share{sortCol === 7 && (sortDir === 1 ? " \u2191" : " \u2193")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const statusColors = {
                  active: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
                  standby: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
                  offline: "bg-muted text-muted-foreground border border-border",
                };
                const dotColors = {
                  active: "bg-emerald-400 shadow-[0_0_6px] shadow-emerald-400 animate-pulse",
                  standby: "bg-yellow-400",
                  offline: "bg-muted-foreground",
                };

                return (
                  <tr key={row.agent.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-lg flex-shrink-0">
                          {row.icon}
                        </div>
                        <div>
                          <div className="font-bold text-base text-foreground">{row.agent.name}</div>
                          <div className="font-mono text-xs text-muted-foreground mt-0.5">{row.agent.llmModel}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`font-mono text-xs px-2.5 py-1 rounded border ${providerColors[row.agent.llmProvider]}`}>
                        {row.agent.llmProvider}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wider ${statusColors[row.status]}`}>
                        <span className={`w-2 h-2 rounded-full ${dotColors[row.status]}`} />
                        {row.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-muted-foreground">{row.teamName}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm font-bold text-chart-4">
                        ${row.cost.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div>
                        <span className="font-bold text-base">{row.requests}</span>
                        <span className="font-mono text-xs text-muted-foreground ml-1">req</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-sm text-secondary">
                        {row.tokens > 1000000
                          ? (row.tokens / 1000000).toFixed(1) + "M"
                          : row.tokens > 1000
                          ? (row.tokens / 1000).toFixed(0) + "K"
                          : row.tokens}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {row.costShare > 0 ? (
                        <ScoreBar value={row.costShare} />
                      ) : (
                        <span className="font-mono text-xs text-muted-foreground">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 font-mono text-xs text-muted-foreground">
                    No agents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provider breakdown */}
      {costs?.byProvider && (
        <div className="flex gap-6 flex-wrap px-5 py-4 bg-card border border-border rounded-xl">
          {Object.entries(costs.byProvider).map(([provider, data]) => (
            <LegendItem
              key={provider}
              color={provider === "anthropic" ? "#fb923c" : provider === "openai" ? "#34d399" : "#60a5fa"}
              label={`${provider}: $${data.cost.toFixed(2)} (${data.requests} req)`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
      <div className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </div>
  );
}
