"use client";

import type { Agent } from "@/types";
import { providerColors, getSuccessRateColor, getAgentStatus, agentStatusConfig, getAgentLucideIcon } from "./constants";

export function AgentCard({ agent, stats, selected, onClick, teamNameMap }: {
  agent: Agent;
  stats?: { runs: number; avgScore: number; successRate: number; failRate: number };
  selected?: boolean;
  onClick?: () => void;
  teamNameMap?: Record<string, string>;
}) {
  const successRate = stats?.successRate ?? 0;
  const status = getAgentStatus(successRate, !!stats);
  const sc = agentStatusConfig[status];
  const barColor = getSuccessRateColor(successRate);
  const Icon = getAgentLucideIcon(agent.name);
  const teamId = agent.teams[0];
  const teamName = (teamId && teamNameMap?.[teamId]) || "\u2014";

  return (
    <div
      role="button"
      onClick={onClick}
      className={`border rounded-lg px-3 py-2.5 transition-all duration-200 cursor-pointer overflow-hidden min-w-0 ${
        selected
          ? "bg-primary/10 border-primary/20 text-primary"
          : "border-transparent text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
      }`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <Icon className={`w-4 h-4 shrink-0 ${selected ? "text-primary" : "text-muted-foreground"}`} />
          <span className={`text-sm font-medium tracking-tight truncate ${selected ? "text-primary" : "text-sidebar-foreground"}`}>{agent.name}</span>
        </div>
        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.color} font-medium tracking-wide uppercase shrink-0`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5 pl-7">
        <span className="font-mono text-[10px] text-muted-foreground truncate">{agent.llmProvider}</span>
        <span className="font-mono text-[10px] text-muted-foreground/60 truncate">{teamName}</span>
      </div>
      <div className="h-1 bg-sidebar-accent rounded-full overflow-hidden ml-7">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${successRate}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1 pl-7">
        <span className="font-mono text-[10px] text-muted-foreground">
          {stats ? `${stats.runs} runs \u00B7 ${stats.avgScore.toFixed(1)} avg` : "No runs yet"}
        </span>
        <span className="font-mono text-xs font-medium text-muted-foreground">
          {stats ? `${Math.round(successRate)}%` : "\u2014"}
        </span>
      </div>
    </div>
  );
}
