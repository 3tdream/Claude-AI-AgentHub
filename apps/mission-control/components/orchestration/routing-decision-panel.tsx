"use client";

import {
  Zap,
  Layers,
  GitBranch,
  Clock,
  Brain,
  CheckCircle2,
  XCircle,
  ChevronRight,
  AlertTriangle,
  Shield,
  TrendingUp,
  DollarSign,
  RefreshCw,
  ArrowUp,
} from "lucide-react";
import type { RoutingDecisionData, ExecutionMode } from "@/types";
import { MODE_CONFIG } from "@/lib/config";

const modeConfig: Record<
  ExecutionMode,
  { label: string; color: string; bg: string; icon: typeof Zap }
> = {
  quick: {
    label: "Quick",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    icon: Zap,
  },
  medium: {
    label: "Medium",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    icon: Layers,
  },
  full: {
    label: "Full Pipeline",
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    icon: GitBranch,
  },
};

const riskColors: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

const riskBg: Record<string, string> = {
  low: "bg-emerald-500/10",
  medium: "bg-amber-500/10",
  high: "bg-orange-500/10",
  critical: "bg-red-500/10",
};

interface Props {
  decision: RoutingDecisionData;
  onConfirm: () => void;
  onOverrideMode: (mode: ExecutionMode) => void;
  isExecuting: boolean;
}

export function RoutingDecisionPanel({
  decision,
  onConfirm,
  onOverrideMode,
  isExecuting,
}: Props) {
  const config = modeConfig[decision.mode];
  const ModeIcon = config.icon;
  const sim = decision.simulation;
  const replan = decision.replan;

  return (
    <div className="bg-card border border-border rounded-xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${config.bg}`}>
            <ModeIcon className={`w-5 h-5 ${config.color}`} />
          </div>
          <div>
            <h3 className="font-bold text-sm">
              Smart Router:{" "}
              <span className={config.color}>{config.label}</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {decision.reasoning}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Brain className="w-3.5 h-3.5" />
            {decision.complexity}/10
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {sim?.estimates.totalDuration || decision.estimatedDuration}
          </span>
          {sim && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              {sim.estimates.estimatedCost}
            </span>
          )}
        </div>
      </div>

      {/* Simulation prediction bar */}
      {sim && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Preflight Simulation
            </span>
            <span className={`text-xs font-bold ${riskColors[sim.overallRisk]}`}>
              {sim.overallProbability}% success · {sim.overallRisk}
            </span>
          </div>
          {/* Probability bar */}
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                sim.overallProbability >= 70
                  ? "bg-emerald-500"
                  : sim.overallProbability >= 45
                    ? "bg-amber-500"
                    : sim.overallProbability >= 25
                      ? "bg-orange-500"
                      : "bg-red-500"
              }`}
              style={{ width: `${sim.overallProbability}%` }}
            />
          </div>
          {/* Bottlenecks */}
          {sim.bottlenecks.length > 0 && (
            <div className="space-y-1">
              {sim.bottlenecks.map((b) => (
                <div
                  key={b.stageId}
                  className="flex items-start gap-1.5 text-[10px] text-muted-foreground"
                >
                  <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                  <span>
                    <span className="font-medium text-foreground/80">{b.stageId}</span>{" "}
                    {b.probability}% — {b.reason.length > 80 ? b.reason.slice(0, 80) + "..." : b.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
          {/* Adjustments */}
          {sim.adjustments.filter((a) => a.type === "mode_upgrade" || a.type === "guard_added").length > 0 && (
            <div className="space-y-1">
              {sim.adjustments
                .filter((a) => a.type === "mode_upgrade" || a.type === "guard_added")
                .map((a, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-[10px]"
                  >
                    <Shield className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-blue-400 font-medium">{a.description}</span>
                    <span className="text-muted-foreground">— {a.reason.length > 60 ? a.reason.slice(0, 60) + "..." : a.reason}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* S0.2 Replan results */}
      {replan?.needed && replan.initialScore != null && (
        <div className="space-y-2 px-3 py-2.5 rounded-lg bg-violet-500/5 border border-violet-500/20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-medium text-violet-300">
              <RefreshCw className="w-3.5 h-3.5" />
              S0.2 Strategy Architect
            </span>
            <span className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
              <span>{replan.iterations} iteration{replan.iterations !== 1 ? "s" : ""}</span>
              <span>{replan.durationMs ? `${replan.durationMs}ms` : ""}</span>
              <span className="text-violet-400">{replan.stopReason?.replace(/_/g, " ")}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{replan.initialScore}%</span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-muted-foreground/20 rounded-full" style={{ width: `${replan.initialScore}%` }} />
              <div
                className="absolute inset-y-0 left-0 bg-violet-500 rounded-full transition-all"
                style={{ width: `${replan.finalScore}%` }}
              />
            </div>
            <span className="text-xs font-bold text-violet-400">{replan.finalScore}%</span>
            <span className="flex items-center gap-0.5 text-[10px] font-mono text-emerald-400">
              <ArrowUp className="w-3 h-3" />
              +{replan.totalLift} ({replan.liftRate}%)
            </span>
          </div>
          {replan.actions && replan.actions.length > 0 && (
            <div className="space-y-0.5">
              {replan.actions.slice(0, 4).map((a, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="w-1 h-1 rounded-full bg-violet-400 shrink-0" />
                  <span className="text-violet-300/80">{a.type.replace(/_/g, " ")}</span>
                  <span className="font-mono text-muted-foreground/60">{a.stageId}</span>
                  <span className="truncate">{a.description}</span>
                </div>
              ))}
              {replan.actions.length > 4 && (
                <span className="text-[9px] text-muted-foreground/50 pl-3">+{replan.actions.length - 4} more actions</span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Agent list */}
      <div className="flex flex-wrap gap-2">
        {decision.selectedAgents.map((agent) => {
          // Find simulation risk for this agent's stage
          const agentStage = sim?.bottlenecks.find(
            (b) => decision.selectedStepIds.some((sid) => sid.includes(agent.replace("-agent", "")) && sid === b.stageId),
          );
          return (
            <span
              key={agent}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium ${
                agentStage
                  ? "bg-orange-500/10 border-orange-500/20 text-orange-300"
                  : "bg-primary/10 border-primary/20"
              }`}
            >
              <CheckCircle2 className={`w-3 h-3 ${agentStage ? "text-orange-400" : "text-emerald-400"}`} />
              {agent.replace("-agent", "")}
              {agentStage && (
                <span className="text-[9px] text-orange-400">{agentStage.probability}%</span>
              )}
            </span>
          );
        })}
        {decision.skippedStepIds.length > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
            <XCircle className="w-3 h-3" />
            {decision.skippedStepIds.length} skipped
          </span>
        )}
      </div>

      {/* Mode selector */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border">
        {(["quick", "medium", "full"] as ExecutionMode[]).map((m) => {
          const mc = modeConfig[m];
          const conf = MODE_CONFIG[m];
          const isActive = decision.mode === m;
          return (
            <button
              key={m}
              onClick={() => onOverrideMode(m)}
              disabled={isExecuting}
              className={`p-3 rounded-lg border text-left transition-all ${
                isActive
                  ? `${mc.bg} border ${mc.color}`
                  : "border-border hover:border-primary/30 hover:bg-muted"
              }`}
            >
              <div className={`text-xs font-mono font-bold uppercase tracking-wider ${isActive ? mc.color : "text-muted-foreground"}`}>
                {mc.label}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                <div>{conf.evalScope === "none" ? "No eval" : conf.evalScope === "final-only" ? "Final eval" : "All steps eval"}</div>
                <div>{conf.estimatedTokens} · {conf.estimatedTime}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Confirm */}
      <div className="flex items-center justify-between">
        <button
          onClick={onConfirm}
          disabled={isExecuting}
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all font-mono text-xs uppercase tracking-wider"
        >
          Confirm & Execute
          <ChevronRight className="w-4 h-4" />
        </button>
        {sim && (
          <span className={`text-[10px] font-mono ${riskColors[sim.overallRisk]}`}>
            {sim.overallProbability}% predicted · {sim.estimates.totalTokens.toLocaleString()} tok · {sim.inputComplexity}
          </span>
        )}
      </div>
    </div>
  );
}
