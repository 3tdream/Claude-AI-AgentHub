"use client";

import { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useAppStore } from "@/lib/stores/app-store";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useAgents } from "@/lib/hooks/use-agents";
import { Plus, GripVertical, Pencil, ChevronUp, ChevronDown, PanelLeftClose, PanelLeft, Activity, Layers } from "lucide-react";

import { fetcher, getAgentIcon } from "@/components/home/constants";
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
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;
  const [editMode, setEditMode] = useState(false);
  const [agentOrder, setAgentOrder] = useState<string[]>([]);
  const [fleetCollapsed, setFleetCollapsed] = useState(false);
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
      <div className={`flex-shrink-0 flex flex-col gap-2 overflow-y-auto transition-all duration-300 ${fleetCollapsed ? "w-14" : "w-64"}`}>

        {/* ── COLLAPSED: icons only ── */}
        {fleetCollapsed ? (
          <>
            <div className="flex flex-col items-center gap-1 pb-2 border-b border-slate-200">
              <button onClick={() => setFleetCollapsed(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Expand fleet" aria-label="Expand fleet">
                <PanelLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => setSelectedAgentId("__new__")} className="p-1 rounded text-indigo-400 hover:text-indigo-600 transition-colors" title="New agent" aria-label="New agent">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {orderedAgents.map(({ agent, stats }) => {
              const successRate = stats?.successRate ?? 0;
              const statusColor = successRate > 70 ? "bg-emerald-500" : successRate > 40 ? "bg-amber-500" : successRate > 0 ? "bg-rose-400" : "bg-slate-300";
              const icon = getAgentIcon(agent.name);
              return (
                <button
                  key={agent.id}
                  onClick={() => { setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id); setCenterView("pipeline"); }}
                  title={`${agent.name} — ${stats ? Math.round(successRate) + "%" : "idle"}`}
                  className={`flex flex-col items-center py-1.5 rounded-lg transition-all ${
                    selectedAgentId === agent.id
                      ? "bg-indigo-50 border border-indigo-300"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${statusColor}`} />
                </button>
              );
            })}
          </>
        ) : (
          <>
            {/* ── EXPANDED: full cards ── */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Agent Fleet</h2>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`p-1 rounded transition-colors ${editMode ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                  title={editMode ? "Done reordering" : "Reorder agents"}
                  aria-label={editMode ? "Done reordering" : "Reorder agents"}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSelectedAgentId("__new__")}
                  className="p-1 rounded text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                  title="New agent"
                  aria-label="New agent"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFleetCollapsed(true)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                  title="Collapse fleet"
                  aria-label="Collapse fleet"
                >
                  <PanelLeftClose className="w-3 h-3" />
                </button>
                <span className="font-mono text-[10px] text-slate-400 ml-0.5">{activeAgentCount}</span>
              </div>
            </div>

            {agentsLoading && <div className="text-center py-8 text-slate-400 text-sm">Loading agents...</div>}

            {orderedAgents.map(({ agent, stats }, idx) => (
              <div key={agent.id} className="flex items-stretch gap-1">
                {editMode && (
                  <div className="flex flex-col justify-center gap-0.5 shrink-0">
                    <button onClick={() => moveAgent(idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 transition-colors" aria-label="Move agent up">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <GripVertical className="w-3 h-3 text-slate-300 mx-auto" />
                    <button onClick={() => moveAgent(idx, 1)} disabled={idx === orderedAgents.length - 1} className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 transition-colors" aria-label="Move agent down">
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
                  />
                </div>
              </div>
            ))}

            {!agentsLoading && agents.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No agents found</div>
            )}
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
          </div>
          <span className="font-mono text-xs text-slate-500" suppressHydrationWarning>{clock}</span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-6 gap-3">
          <div onClick={() => { setCenterView(centerView === "health" ? "pipeline" : "health"); setSelectedAgentId(null); }} className="cursor-pointer">
            <MetricBox value={String(health?.overallScore || "\u2014")} label="Health" color={centerView === "health" ? "indigo" : "green"} />
          </div>
          <div onClick={() => { setCenterView(centerView === "knowledge" ? "pipeline" : "knowledge"); setSelectedAgentId(null); }} className="cursor-pointer">
            <MetricBox value={String(kbIndex?.totalEntries || "\u2014")} label="KB Entries" color={centerView === "knowledge" ? "indigo" : "purple"} />
          </div>
          <MetricBox value={String(stats?.totalRuns || "\u2014")} label="Total Runs" color="indigo" />
          <MetricBox value={stats ? `${Math.round((stats.completed / (stats.totalRuns || 1)) * 100)}%` : "\u2014"} label="Success Rate" color={stats && stats.completed / stats.totalRuns > 0.5 ? "green" : "amber"} />
          <MetricBox value={costsData?.data?.apiBalances ? `$${costsData.data.apiBalances.total?.toFixed(0)}` : "\u2014"} label="API Balance" color="amber" />
          <MetricBox value={costsData?.data?.pipelineSpend ? `$${costsData.data.pipelineSpend.total?.toFixed(2)}` : "\u2014"} label="Pipeline Spend" color={(costsData?.data?.pipelineSpend?.total ?? 0) > 50 ? "red" : "green"} />
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

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span>KB: {kbIndex?.integrityOk ? "OK" : "FAIL"}</span>
            <span>Contracts: 8</span>
            <span>Skills: 82</span>
            <span>Projects: 15</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>HEALTH</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health?.overallScore || 0}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>BALANCE</span>
              <span className={`font-semibold ${(costsData?.data?.apiBalances?.total || 0) < 20 ? "text-rose-500" : (costsData?.data?.apiBalances?.total || 0) < 50 ? "text-amber-500" : "text-emerald-500"}`}>
                ${costsData?.data?.apiBalances?.total?.toFixed(0) || "—"}
              </span>
            </div>
          </div>
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
            <div className="text-center py-8 text-slate-400 text-sm">No activity yet</div>
          )}
        </div>

        {/* Recent runs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mt-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Recent Runs</h2>
        </div>
        <div className="flex flex-col gap-2">
          {dedupedHistory.slice(0, 5).map((exec) => {
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
