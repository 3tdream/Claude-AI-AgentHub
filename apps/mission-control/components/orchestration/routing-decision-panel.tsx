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
            Complexity: {decision.complexity}/10
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {decision.estimatedDuration}
          </span>
        </div>
      </div>

      {/* Agent list */}
      <div className="flex flex-wrap gap-2">
        {decision.selectedAgents.map((agent) => (
          <span
            key={agent}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-xs font-medium"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            {agent}
          </span>
        ))}
        {decision.skippedStepIds.length > 0 && (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs text-muted-foreground">
            <XCircle className="w-3 h-3" />
            {decision.skippedStepIds.length} skipped
          </span>
        )}
      </div>

      {/* Mode selector with estimates */}
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
                <div>{conf.evalScope === "none" ? "No eval" : conf.evalScope === "final-only" ? "Final step eval (≥7)" : "All steps eval (≥8.5)"}</div>
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
      </div>
    </div>
  );
}
