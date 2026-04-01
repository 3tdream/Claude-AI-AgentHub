"use client";

import type { Agent } from "@/types";
import { getAgentIcon, providerColors } from "./constants";

export function AgentCard({ agent, stats, selected, onClick }: {
  agent: Agent;
  stats?: { runs: number; avgScore: number; successRate: number; failRate: number };
  selected?: boolean;
  onClick?: () => void;
}) {
  const successRate = stats?.successRate ?? 0;
  const status = stats ? (successRate > 70 ? "active" : successRate > 40 ? "busy" : "idle") : "idle";

  const statusConfig: Record<string, { color: string; bg: string }> = {
    active: { color: "text-emerald-700", bg: "bg-emerald-50" },
    busy: { color: "text-amber-700", bg: "bg-amber-50" },
    idle: { color: "text-slate-500", bg: "bg-slate-100" },
  };

  const sc = statusConfig[status];
  const barColor = successRate >= 70 ? "bg-emerald-500" : successRate >= 40 ? "bg-amber-500" : "bg-rose-400";
  const prov = providerColors[agent.llmProvider] || providerColors.anthropic;
  const icon = getAgentIcon(agent.name);
  const teamName = agent.teams[0] || "\u2014";

  return (
    <div
      role="button"
      onClick={onClick}
      className={`border rounded-lg p-3 transition-all cursor-pointer overflow-hidden min-w-0 ${
        selected
          ? "bg-indigo-50 border-indigo-300 shadow-sm"
          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
      }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0" title={agent.id}>{icon}</span>
          <span className="text-[13px] font-semibold text-slate-900 tracking-tight truncate">{agent.name}</span>
        </div>
        <span className={`font-mono text-xs px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.color} font-medium tracking-wide uppercase shrink-0`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`font-mono text-xs px-1.5 py-0.5 rounded-full border ${prov}`}>{agent.llmProvider}</span>
        <span className="font-mono text-xs text-slate-400 truncate">{agent.llmModel}</span>
        <span className="font-mono text-xs text-violet-500 ml-auto shrink-0">{teamName}</span>
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${successRate}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="font-mono text-[10px] text-slate-500">
          {stats ? `${stats.runs} runs \u00B7 ${stats.avgScore.toFixed(1)} avg` : "No runs yet"}
        </span>
        <span className="font-mono text-[10px] font-medium text-slate-600">
          {stats ? `${Math.round(successRate)}%` : "\u2014"}
        </span>
      </div>
    </div>
  );
}
