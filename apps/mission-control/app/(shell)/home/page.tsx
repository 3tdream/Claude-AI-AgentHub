"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAppStore } from "@/lib/stores/app-store";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTeams } from "@/lib/hooks/use-teams";
import { Plus, GripVertical, Pencil, ChevronUp, ChevronDown, PanelLeftClose, PanelLeft, Activity, Layers, Filter, Keyboard, Zap, GitBranch } from "lucide-react";

import { fetcher, getAgentIcon, getSuccessRateColor } from "@/components/home/constants";
import { StatusPill } from "@/components/home/status-pill";
import { MetricBox } from "@/components/home/metric-box";
import { AgentCard } from "@/components/home/agent-card";
import { LogEntry } from "@/components/home/log-entry";
import { AgentPanel } from "@/components/home/agent-panel";
import { NewAgentPanel } from "@/components/home/new-agent-panel";
import { PipelinePanel } from "@/components/home/pipeline-panel";
import { HealthPanel } from "@/components/home/health-panel";
import { KnowledgePanel } from "@/components/home/knowledge-panel";

// ══════════════════════════════════════════════
// MAIN HOME PAGE
// ══════════════════════════════════════════════

export default function HomePage() {
  const { activeProjectId, setActiveProject } = useAppStore();
  const executionHistory = useOrchestrationStore((s) => s.executionHistory);
  const activeExecution = useOrchestrationStore((s) => s.activeExecution);
  const activityEvents = useActivityStore((s) => s.events);
  const { agents, isLoading: agentsLoading, mutate: mutateAgents } = useAgents();
  const { teams } = useTeams();
  const teamNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of teams) map[t.id] = t.name;
    return map;
  }, [teams]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;
  const [editMode, setEditMode] = useState(false);
  const [agentOrder, setAgentOrder] = useState<string[]>([]);
  const [fleetCollapsed, setFleetCollapsed] = useState(false);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [centerView, setCenterView] = useState<"pipeline" | "health" | "knowledge">("pipeline");

  // Clock
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // API data
  const { data: healthData } = useSWR("/api/system/health", fetcher, { refreshInterval: 30000 });
  const { data: agentsData } = useSWR("/api/agents/performance", fetcher, { revalidateOnFocus: false });
  const { data: kbData } = useSWR("/api/knowledge-base/validate", fetcher, { revalidateOnFocus: false });
  const { data: statsData } = useSWR("/api/pipeline/stats", fetcher, { revalidateOnFocus: false });
  const { data: costsData } = useSWR("/api/costs/real", fetcher, { revalidateOnFocus: false });
  const { data: versionData } = useSWR("/api/system/version", fetcher, { revalidateOnFocus: false });
  const { data: projectsData } = useSWR("/api/projects/discover", fetcher, { revalidateOnFocus: false });
  const discoveredProjects = projectsData?.data || [];

  // Deduplicated execution history (memoized, used in History view + Recent Runs)
  const dedupedHistory = useMemo(() => {
    const seen = new Set<string>();
    return executionHistory.filter((exec) => {
      if (seen.has(exec.id)) return false;
      seen.add(exec.id);
      return true;
    });
  }, [executionHistory]);

  // Recent success rate (last 10 runs) for trend comparison
  const recentTrend = useMemo(() => {
    const recent = dedupedHistory.slice(0, 10);
    if (recent.length < 3) return null;
    const completed = recent.filter((e) => e.status === "completed").length;
    const rate = Math.round((completed / recent.length) * 100);
    return { rate, count: recent.length };
  }, [dedupedHistory]);

  const health = healthData;
  const agentStats = agentsData?.data || agentsData?.agentStats || {};
  const kbIndex = kbData;
  const stats = statsData?.data || statsData;
  const budget = costsData?.data?.budget;

  // Merge real agent data with performance stats
  const agentStatsMap = agentStats as Record<string, { runs: number; avgScore: number; successRate: number; failRate: number }>;
  const activeAgentCount = agents.length;
  const agentsWithStats = useMemo(() => agents.map((agent) => {
    const shortId = agent.name.toLowerCase().replace(/[-_\s]agent$/i, "").replace(/\s+/g, "-");
    const stats = agentStatsMap[shortId] || agentStatsMap[agent.id] || null;
    return { agent, stats };
  }), [agents, agentStatsMap]);

  // Init agent order from localStorage or default
  useEffect(() => {
    if (agents.length > 0 && agentOrder.length === 0) {
      try {
        const saved = localStorage.getItem("mc-agent-order");
        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          const existing = new Set(parsed);
          const newIds = agents.map((a) => a.id).filter((id) => !existing.has(id));
          setAgentOrder([...parsed.filter((id) => agents.some((a) => a.id === id)), ...newIds]);
          return;
        }
      } catch {}
      setAgentOrder(agents.map((a) => a.id));
    }
  }, [agents, agentOrder.length]);

  // Sort agentsWithStats by order, then bubble by status: active → busy → idle
  const orderedAgents = useMemo(() => {
    const base = agentOrder.length > 0
      ? agentOrder.map((id) => agentsWithStats.find((a) => a.agent.id === id)).filter(Boolean) as typeof agentsWithStats
      : agentsWithStats;
    return [...base].sort((a, b) => {
      const rank = (s: typeof a.stats) => {
        if (!s || s.runs === 0) return 0;          // idle
        if (s.successRate > 70) return 2;           // active
        if (s.successRate > 40) return 1;           // busy
        return 0;                                   // idle
      };
      return rank(b.stats) - rank(a.stats);
    });
  }, [agentOrder, agentsWithStats]);

  // Filter: active only hides idle agents
  const filteredAgents = useMemo(() => {
    if (!showActiveOnly) return orderedAgents;
    return orderedAgents.filter(({ stats }) => stats && stats.runs > 0);
  }, [orderedAgents, showActiveOnly]);
  const idleCount = orderedAgents.length - filteredAgents.length;

  const moveAgent = (fromIdx: number, dir: -1 | 1) => {
    const toIdx = fromIdx + dir;
    if (toIdx < 0 || toIdx >= agentOrder.length) return;
    const newOrder = [...agentOrder];
    [newOrder[fromIdx], newOrder[toIdx]] = [newOrder[toIdx], newOrder[fromIdx]];
    setAgentOrder(newOrder);
    localStorage.setItem("mc-agent-order", JSON.stringify(newOrder));
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* ── LEFT: Agent Fleet ── */}
      <div className={`flex-shrink-0 flex flex-col overflow-y-auto transition-all duration-300 bg-sidebar border-r border-sidebar-border rounded-xl ${fleetCollapsed ? "w-16" : "w-64"}`}>

        {/* ── COLLAPSED: icons only ── */}
        {fleetCollapsed ? (
          <>
            <div className="flex flex-col items-center gap-1 py-3 border-b border-sidebar-border">
              <button onClick={() => setFleetCollapsed(false)} className="p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors" title="Expand fleet" aria-label="Expand fleet">
                <PanelLeft className="w-4 h-4 text-muted-foreground" />
              </button>
              <button onClick={() => setSelectedAgentId("__new__")} className="p-1 rounded text-primary hover:text-primary/80 transition-colors" title="New agent" aria-label="New agent">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="py-2 px-1 space-y-1">
            {orderedAgents.map(({ agent, stats }) => {
              const successRate = stats?.successRate ?? 0;
              const statusColor = getSuccessRateColor(successRate);
              const icon = getAgentIcon(agent.name);
              return (
                <button
                  key={agent.id}
                  onClick={() => { setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id); setCenterView("pipeline"); }}
                  title={`${agent.name} — ${stats ? Math.round(successRate) + "%" : "idle"}`}
                  className={`w-full flex flex-col items-center py-1.5 rounded-lg transition-all duration-200 ${
                    selectedAgentId === agent.id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-sidebar-accent border border-transparent"
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${statusColor}`} />
                </button>
              );
            })}
            </div>
          </>
        ) : (
          <>
            {/* ── EXPANDED: full cards ── */}
            <div className="flex items-center justify-between px-3 py-3 border-b border-sidebar-border">
              <h2 className="text-xs font-semibold text-sidebar-foreground uppercase tracking-wide">Agent Fleet</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowActiveOnly(!showActiveOnly)}
                  className={`p-1 rounded-lg transition-colors duration-200 ${showActiveOnly ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-sidebar-foreground"}`}
                  title={showActiveOnly ? "Show all agents" : "Active only"}
                  aria-label={showActiveOnly ? "Show all agents" : "Show active agents only"}
                >
                  <Filter className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`p-1 rounded-lg transition-colors duration-200 ${editMode ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-sidebar-foreground"}`}
                  title={editMode ? "Done reordering" : "Reorder agents"}
                  aria-label={editMode ? "Done reordering" : "Reorder agents"}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSelectedAgentId("__new__")}
                  className="p-1 rounded-lg text-primary hover:text-primary/80 hover:bg-primary/10 transition-colors duration-200"
                  title="New agent"
                  aria-label="New agent"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFleetCollapsed(true)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-sidebar-foreground transition-colors duration-200"
                  title="Collapse fleet"
                  aria-label="Collapse fleet"
                >
                  <PanelLeftClose className="w-3 h-3" />
                </button>
                <span className="font-mono text-[10px] text-muted-foreground ml-0.5">{activeAgentCount}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {agentsLoading && <div className="text-center py-8 text-muted-foreground text-sm">Loading agents...</div>}

            {filteredAgents.map(({ agent, stats }, idx) => (
              <div key={agent.id} className="flex items-stretch gap-1">
                {editMode && (
                  <div className="flex flex-col justify-center gap-0.5 shrink-0">
                    <button onClick={() => moveAgent(idx, -1)} disabled={idx === 0} className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors" aria-label="Move agent up">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <GripVertical className="w-3 h-3 text-muted-foreground mx-auto" />
                    <button onClick={() => moveAgent(idx, 1)} disabled={idx === filteredAgents.length - 1} className="p-0.5 text-muted-foreground hover:text-primary disabled:opacity-20 transition-colors" aria-label="Move agent down">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <AgentCard
                    agent={agent}
                    stats={stats || undefined}
                    selected={selectedAgentId === agent.id}
                    onClick={() => { if (!editMode) { setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id); setCenterView("pipeline"); } }}
                    teamNameMap={teamNameMap}
                  />
                </div>
              </div>
            ))}

            {showActiveOnly && idleCount > 0 && (
              <button
                onClick={() => setShowActiveOnly(false)}
                className="w-full text-center py-2 text-xs text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                +{idleCount} idle agents
              </button>
            )}

            {!agentsLoading && agents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">No agents found</div>
            )}
            </div>
          </>
        )}
      </div>

      {/* ── CENTER: Main Area ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-6">
            <StatusPill
              color={health?.overall === "healthy" ? "green" : health?.overall === "degraded" ? "amber" : "red"}
              label={health ? `System ${health.overall}` : "Loading..."}
            />
            <StatusPill color="blue" label={`${activeAgentCount} agents`} />
            <StatusPill
              color={stats?.completed > 0 ? "green" : "amber"}
              label={stats ? `${stats.completed}/${stats.totalRuns} runs passed` : "\u2014"}
            />
            <button onClick={() => { setCenterView(centerView === "knowledge" ? "pipeline" : "knowledge"); setSelectedAgentId(null); }} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <StatusPill color={kbIndex?.integrityOk ? "purple" : "red"} label={`KB: ${kbIndex?.totalEntries || 0} entries`} />
            </button>
          </div>
          <span className="font-mono text-xs text-slate-500" suppressHydrationWarning>{clock}</span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-3">
          <div onClick={() => { setCenterView(centerView === "health" ? "pipeline" : "health"); setSelectedAgentId(null); }} className="cursor-pointer">
            <MetricBox
              value={String(health?.overallScore || "\u2014")}
              label="Health"
              color={centerView === "health" ? "indigo" : "green"}
              subtitle={health?.subsystems ? health.subsystems.map((s: { id: string; status: string }) => `${s.id} ${s.status === "healthy" ? "ok" : s.status}`).join(" · ") : undefined}
            />
          </div>
          <MetricBox
            value={stats ? `${Math.round((stats.completed / (stats.totalRuns || 1)) * 100)}%` : "\u2014"}
            label="Success Rate"
            color={recentTrend && recentTrend.rate > 50 ? "green" : stats && stats.completed / stats.totalRuns > 0.5 ? "green" : "amber"}
            subtitle={stats ? `${stats.completed}/${stats.totalRuns} runs${recentTrend ? ` · last ${recentTrend.count}: ${recentTrend.rate}%${recentTrend.rate > Math.round((stats.completed / (stats.totalRuns || 1)) * 100) ? " ↑" : ""}` : ""}` : undefined}
          />
          <MetricBox
            value={costsData?.data?.apiBalances ? `$${costsData.data.apiBalances.total?.toFixed(0)}` : "\u2014"}
            label="API Balance"
            color={(costsData?.data?.apiBalances?.total || 0) < 20 ? "red" : (costsData?.data?.apiBalances?.total || 0) < 50 ? "amber" : "green"}
            subtitle={budget ? `${Math.round(budget.usedPercent)}% of $${budget.monthly} monthly` : undefined}
          />
        </div>

        {/* Center content — agent panel, pipeline, or health */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl relative overflow-hidden">
          {selectedAgentId === "__new__" ? (
            <NewAgentPanel onClose={() => setSelectedAgentId(null)} onCreated={(id) => { mutateAgents(); setSelectedAgentId(id); }} />
          ) : selectedAgent ? (
            <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgentId(null)} onAgentUpdated={() => mutateAgents()} />
          ) : centerView === "health" ? (
            <HealthPanel />
          ) : centerView === "knowledge" ? (
            <KnowledgePanel />
          ) : (
            <PipelinePanel activeProjectId={activeProjectId} projects={discoveredProjects} onSelectProject={setActiveProject} />
          )}
        </div>

      </div>

      {/* ── RIGHT: Activity + Metrics ── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pl-1">
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Live Activity</h2>
        </div>
        <div className="flex flex-col gap-0.5 max-h-[50vh] overflow-y-auto">
          {activityEvents.slice(0, 20).map((e) => (
            <LogEntry
              key={e.id}
              type={e.type}
              text={e.label}
              time={new Date(e.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            />
          ))}
          {activityEvents.length === 0 && (
            <div className="space-y-2 py-2">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Quick Actions</div>
              <button onClick={() => setCenterView("health")} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                <Zap className="w-3 h-3" /> System Health Check
              </button>
              <button onClick={() => setCenterView("knowledge")} className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                <GitBranch className="w-3 h-3" /> Browse Knowledge Base
              </button>
              <div className="pt-1 border-t border-slate-100">
                <div className="text-[10px] text-slate-400 uppercase tracking-wide font-medium mb-1.5">Shortcuts</div>
                <div className="space-y-1 font-mono text-[10px] text-slate-400">
                  <div><kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px]">Cmd+K</kbd> Search agents</div>
                  <div><kbd className="px-1 py-0.5 bg-slate-100 rounded text-[9px]">Enter</kbd> Run task</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent runs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mt-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Recent Runs</h2>
        </div>
        <div className="flex flex-col gap-2">
          {dedupedHistory.slice(0, 8).map((exec) => {
            const isStale = (exec.status === "paused" || exec.status === "running") && activeExecution?.id !== exec.id;
            const displayStatus = isStale ? "interrupted" : exec.status;
            return (
              <div key={exec.id} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                <div className="font-mono text-xs text-slate-600 truncate">{exec.input?.substring(0, 40)}</div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className={`font-mono text-[10px] uppercase tracking-wide font-medium ${
                    displayStatus === "completed" ? "text-emerald-600" : displayStatus === "failed" ? "text-rose-600" : "text-amber-600"
                  }`}>
                    {displayStatus}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {exec.totalDuration ? `${Math.round(exec.totalDuration / 1000)}s` : "\u2014"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
