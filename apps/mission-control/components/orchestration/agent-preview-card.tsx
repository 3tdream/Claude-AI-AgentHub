"use client";

import { Cpu, Shield, Headphones, Megaphone, Brain, BarChart3, Clock, Zap } from "lucide-react";
import type { AgentDepartment, PipelineExecution } from "@/types";
import { getAgentById } from "@/lib/agent-catalog";

interface AgentPreviewCardProps {
  agentId: string;
  executionHistory: PipelineExecution[];
  anchorRect?: { top: number; left: number; width: number; height: number } | null;
}

const departmentIcons: Record<AgentDepartment, React.ReactNode> = {
  Strategy: <Brain className="w-3.5 h-3.5" />,
  Engineering: <Cpu className="w-3.5 h-3.5" />,
  Security: <Shield className="w-3.5 h-3.5" />,
  Support: <Headphones className="w-3.5 h-3.5" />,
  Herald: <Megaphone className="w-3.5 h-3.5" />,
};

const departmentColors: Record<AgentDepartment, string> = {
  Strategy: "text-violet-400",
  Engineering: "text-blue-400",
  Security: "text-red-400",
  Support: "text-emerald-400",
  Herald: "text-amber-400",
};

function computeAgentStats(agentId: string, history: PipelineExecution[]) {
  let totalScore = 0;
  let scoreCount = 0;
  let totalDuration = 0;
  let durationCount = 0;
  let totalRuns = 0;
  let successRuns = 0;

  for (const exec of history) {
    for (const [stepId, result] of Object.entries(exec.stepResults)) {
      if (stepId.includes(agentId) || result.model?.includes(agentId)) {
        totalRuns++;
        if (result.status === "completed") successRuns++;
        if (result.duration) {
          totalDuration += result.duration;
          durationCount++;
        }
      }
      const score = exec.qualityScores?.[stepId];
      if (score && stepId.includes(agentId)) {
        totalScore += score.overall;
        scoreCount++;
      }
    }
  }

  return {
    avgScore: scoreCount > 0 ? totalScore / scoreCount : null,
    avgDuration: durationCount > 0 ? totalDuration / durationCount : null,
    successRate: totalRuns > 0 ? (successRuns / totalRuns) * 100 : null,
    totalRuns,
  };
}

export function AgentPreviewCard({ agentId, executionHistory, anchorRect }: AgentPreviewCardProps) {
  const agent = getAgentById(agentId);
  if (!agent) return null;

  const stats = computeAgentStats(agentId, executionHistory);

  const cardW = 220;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1920;

  let posStyle: React.CSSProperties;

  if (anchorRect) {
    // Place directly above the node with transform to push up from the anchor top edge
    let left = anchorRect.left + anchorRect.width / 2 - cardW / 2;
    left = Math.max(8, Math.min(left, vw - cardW - 8));

    posStyle = {
      position: "fixed",
      top: anchorRect.top - 2,
      left,
      width: cardW,
      transform: "translateY(-100%)",
    };
  } else {
    posStyle = { position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 2, width: cardW };
  }

  return (
    <div
      className="z-[60] bg-card border border-border rounded-lg shadow-xl p-3 pointer-events-none"
      style={posStyle}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={departmentColors[agent.department]}>
          {departmentIcons[agent.department]}
        </span>
        <span className="text-xs font-bold">{agent.agentName}</span>
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed mb-2">{agent.description}</p>

      <div className="flex items-center gap-1.5 mb-2">
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{agent.model}</span>
        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{agent.provider}</span>
      </div>

      {stats.totalRuns > 0 && (
        <div className="border-t border-border/50 pt-2 grid grid-cols-2 gap-1.5">
          {stats.avgScore !== null && (
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-muted-foreground" />
              <span className={`font-mono text-[10px] font-bold ${
                stats.avgScore >= 8 ? "text-emerald-400" :
                stats.avgScore >= 6 ? "text-amber-400" : "text-red-400"
              }`}>
                {stats.avgScore.toFixed(1)}/10
              </span>
            </div>
          )}
          {stats.avgDuration !== null && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">
                {(stats.avgDuration / 1000).toFixed(1)}s
              </span>
            </div>
          )}
          {stats.successRate !== null && (
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-muted-foreground" />
              <span className="font-mono text-[10px] text-muted-foreground">
                {stats.successRate.toFixed(0)}% ok
              </span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <span className="font-mono text-[10px] text-muted-foreground">
              {stats.totalRuns} runs
            </span>
          </div>
        </div>
      )}
      {stats.totalRuns === 0 && (
        <div className="border-t border-border/50 pt-2">
          <span className="font-mono text-[9px] text-muted-foreground/50">No execution data yet</span>
        </div>
      )}
    </div>
  );
}
