"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useAppStore } from "@/lib/stores/app-store";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useAgents } from "@/lib/hooks/use-agents";
import type { Agent } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Status pill component ──
function StatusPill({ color, label }: { color: string; label: string }) {
  const dotColors: Record<string, string> = {
    green: "bg-emerald-500 shadow-[0_0_8px_rgba(0,255,136,0.6)]",
    cyan: "bg-cyan-400 shadow-[0_0_8px_rgba(0,245,255,0.6)]",
    amber: "bg-amber-500 shadow-[0_0_8px_rgba(255,170,0,0.6)]",
    red: "bg-red-500 shadow-[0_0_8px_rgba(255,51,85,0.6)]",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[color] || dotColors.cyan}`} />
      <span className="font-mono text-[9px] tracking-[2px] uppercase text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Metric box ──
function MetricBox({ value, label, color = "" }: { value: string; label: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    green: "text-emerald-400",
    red: "text-red-400",
  };

  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-center">
      <div className={`font-['Rajdhani',sans-serif] text-2xl font-bold leading-none ${colorClasses[color] || "text-foreground"}`}>
        {value}
      </div>
      <div className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground/60 mt-1">{label}</div>
    </div>
  );
}

// ── Provider badge colors ──
const providerColors: Record<string, string> = {
  anthropic: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  openai: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  google: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  openrouter: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

// ── Agent card ──
function AgentCard({ agent, stats }: {
  agent: Agent;
  stats?: { runs: number; avgScore: number; successRate: number; failRate: number };
}) {
  const successRate = stats?.successRate ?? 0;
  const status = stats ? (successRate > 70 ? "active" : successRate > 40 ? "busy" : "idle") : "idle";

  const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
    active: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    busy: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    idle: { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border" },
  };

  const sc = statusConfig[status];
  const barColor = successRate >= 70 ? "bg-emerald-500" : successRate >= 40 ? "bg-amber-500" : "bg-red-500";
  const prov = providerColors[agent.llmProvider] || providerColors.anthropic;

  return (
    <div className="bg-cyan-500/[0.03] border border-cyan-500/10 rounded-lg p-2.5 hover:bg-cyan-500/[0.07] hover:border-cyan-400/20 hover:shadow-[0_0_18px_rgba(0,120,255,0.08)] transition-all cursor-pointer">
      <div className="flex items-center justify-between mb-1">
        <span className="font-['Rajdhani',sans-serif] text-[13px] font-semibold tracking-wide truncate">{agent.name}</span>
        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${sc.bg} ${sc.color} ${sc.border} border tracking-wider shrink-0`}>
          {status.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`font-mono text-[8px] px-1 py-0.5 rounded border ${prov}`}>{agent.llmProvider}</span>
        <span className="font-mono text-[8px] text-muted-foreground/40 truncate">{agent.llmModel}</span>
      </div>
      <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} animate-pulse`} style={{ width: `${successRate}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="font-mono text-[9px] text-muted-foreground/50">
          {stats ? `${stats.runs} runs · ${stats.avgScore.toFixed(1)} avg` : "No runs yet"}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/40">
          {stats ? `${Math.round(successRate)}%` : "—"}
        </span>
      </div>
    </div>
  );
}

// ── Activity entry ──
function LogEntry({ type, text, time }: { type: string; text: string; time: string }) {
  const colors: Record<string, string> = {
    kb_read: "border-l-purple-400 text-purple-400/80",
    contract_validate: "border-l-emerald-400 text-emerald-400/80",
    simulation: "border-l-amber-400 text-amber-400/80",
    routing: "border-l-cyan-400 text-cyan-400/80",
    agent: "border-l-blue-400 text-blue-400/80",
    system: "border-l-muted-foreground text-muted-foreground/60",
  };

  return (
    <div className={`font-mono text-[9px] py-1 px-2 border-l-2 leading-relaxed animate-in fade-in slide-in-from-top-1 ${colors[type] || colors.system}`}>
      <span className="text-muted-foreground/40 mr-1.5">{time}</span>{text}
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN HOME PAGE
// ══════════════════════════════════════════════

export default function HomePage() {
  const { activeProjectId } = useAppStore();
  const executionHistory = useOrchestrationStore((s) => s.executionHistory);
  const activityEvents = useActivityStore((s) => s.events);
  const { agents, isLoading: agentsLoading } = useAgents();

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

  const health = healthData;
  const agentStats = agentsData?.data || {};
  const kbIndex = kbData;
  const stats = statsData?.data;
  const budget = costsData?.data?.budget;

  // Merge real agent data with performance stats
  const agentStatsMap = agentStats as Record<string, { runs: number; avgScore: number; successRate: number; failRate: number }>;
  const activeAgentCount = agents.length;
  const agentsWithStats = agents.map((agent) => {
    const shortId = agent.name.toLowerCase().replace(/[-_\s]agent$/i, "").replace(/\s+/g, "-");
    const stats = agentStatsMap[shortId] || agentStatsMap[agent.id] || null;
    return { agent, stats };
  });

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* ── LEFT: Agent Fleet ── */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
        <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
          <span className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase">Agent Fleet</span>
          <span className="font-mono text-[9px] text-muted-foreground/40">{activeAgentCount}</span>
        </div>
        {agentsLoading && <div className="text-center py-8 text-muted-foreground/30 text-xs animate-pulse">Loading agents...</div>}
        {agentsWithStats.map(({ agent, stats }) => (
          <AgentCard key={agent.id} agent={agent} stats={stats || undefined} />
        ))}
        {!agentsLoading && agents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground/30 text-xs">No agents found</div>
        )}
      </div>

      {/* ── CENTER: Main Area ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/20 border border-white/5 rounded-lg">
          <div className="flex items-center gap-6">
            <StatusPill
              color={health?.overall === "healthy" ? "green" : health?.overall === "degraded" ? "amber" : "red"}
              label={health ? `System ${health.overall}` : "Loading..."}
            />
            <StatusPill color="cyan" label={`${activeAgentCount} agents`} />
            <StatusPill
              color={stats?.completed > 0 ? "green" : "amber"}
              label={stats ? `${stats.completed}/${stats.totalRuns} runs passed` : "—"}
            />
          </div>
          <span className="font-mono text-[12px] tracking-[2px] text-cyan-400">{clock}</span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-6 gap-2">
          <MetricBox value={String(health?.overallScore || "—")} label="Health" color="green" />
          <MetricBox value={String(kbIndex?.totalEntries || "—")} label="KB Entries" color="purple" />
          <MetricBox value={String(stats?.totalRuns || "—")} label="Total Runs" color="cyan" />
          <MetricBox value={stats ? `${Math.round((stats.completed / (stats.totalRuns || 1)) * 100)}%` : "—"} label="Success Rate" color={stats && stats.completed / stats.totalRuns > 0.5 ? "green" : "amber"} />
          <MetricBox value={budget ? `$${budget.spent?.toFixed(0)}` : "—"} label="Spent" color="amber" />
          <MetricBox value={budget ? `$${Math.round(budget.remaining)}` : "—"} label="Remaining" color={budget && budget.remaining < 50 ? "red" : "green"} />
        </div>

        {/* Center content — pipeline visualization placeholder */}
        <div className="flex-1 bg-black/10 border border-white/5 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,120,255,0.04),transparent_70%)]" />
          <div className="text-center z-10">
            <div className="font-['Rajdhani',sans-serif] text-4xl font-bold tracking-tight text-foreground/20">
              Mission Control
            </div>
            <div className="font-mono text-[10px] tracking-[4px] uppercase text-cyan-400/40 mt-1">
              AI Software Factory · {versionData?.version || "v0.1.0"}
            </div>
            {activeProjectId && (
              <div className="mt-3 font-mono text-[11px] text-purple-400/60 tracking-wider">
                Active: {activeProjectId}
              </div>
            )}
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-black/20 border border-white/5 rounded-lg">
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-wider text-muted-foreground/40">
            <span>KB: {kbIndex?.integrityOk ? "OK" : "FAIL"}</span>
            <span>Contracts: 8</span>
            <span>Skills: 82</span>
            <span>Projects: 15</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground/40">
            <div className="flex items-center gap-1.5">
              <span>HEALTH</span>
              <div className="w-14 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health?.overallScore || 0}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span>BUDGET</span>
              <div className="w-14 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${budget && budget.usedPercent > 80 ? "bg-red-500" : "bg-cyan-400"}`} style={{ width: `${budget?.usedPercent || 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Activity + Metrics ── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pl-1">
        <div className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase border-b border-cyan-500/15 pb-2">
          Live Activity
        </div>
        <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
          {activityEvents.slice(0, 20).map((e) => (
            <LogEntry
              key={e.id}
              type={e.type}
              text={e.label}
              time={new Date(e.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            />
          ))}
          {activityEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground/30 text-xs">No activity yet</div>
          )}
        </div>

        {/* Recent runs */}
        <div className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase border-b border-cyan-500/15 pb-2 mt-2">
          Recent Runs
        </div>
        <div className="flex flex-col gap-1.5">
          {executionHistory.slice(0, 5).map((exec, i) => (
            <div key={`${exec.id}-${i}`} className="bg-black/20 border border-white/5 rounded-md p-2">
              <div className="font-mono text-[9px] text-foreground/60 truncate">{exec.input?.substring(0, 40)}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`font-mono text-[8px] uppercase tracking-wider ${
                  exec.status === "completed" ? "text-emerald-400" : exec.status === "failed" ? "text-red-400" : "text-amber-400"
                }`}>
                  {exec.status}
                </span>
                <span className="font-mono text-[8px] text-muted-foreground/30">
                  {exec.totalDuration ? `${Math.round(exec.totalDuration / 1000)}s` : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
