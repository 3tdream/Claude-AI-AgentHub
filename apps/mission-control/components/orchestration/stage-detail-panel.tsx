"use client";

import { X, Clock, Cpu, Layers, RefreshCw, AlertTriangle } from "lucide-react";
import type { WorkflowStep, StepResult, QualityScore } from "@/types";
import { QualityScoreBadge } from "./quality-score-badge";

interface StageDetailPanelProps {
  step: WorkflowStep;
  result?: StepResult;
  qualityScore?: QualityScore;
  onClose: () => void;
}

export function StageDetailPanel({ step, result, qualityScore, onClose }: StageDetailPanelProps) {
  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Pending", color: "text-muted-foreground" },
    running: { label: "Running", color: "text-blue-500" },
    completed: { label: "Completed", color: "text-emerald-500" },
    failed: { label: "Failed", color: "text-red-500" },
    skipped: { label: "Skipped", color: "text-muted-foreground" },
    awaiting_approval: { label: "Awaiting Approval", color: "text-amber-500" },
    retrying: { label: "Retrying", color: "text-orange-500" },
  };

  const status = result?.status || "pending";
  const statusInfo = statusLabels[status] || statusLabels.pending;

  return (
    <div className="border-t border-border bg-card/50 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="font-bold text-sm">{step.agentName}</h3>
            <span className={`font-mono text-xs font-semibold ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
            {qualityScore && <QualityScoreBadge score={qualityScore} />}
          </div>
          {step.metadata?.stageNumber && (
            <span className="font-mono text-[10px] text-muted-foreground">
              Stage {step.metadata.stageNumber}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <p className="font-mono text-[9px] text-muted-foreground uppercase">Agent</p>
            <p className="font-mono text-xs">{step.agentId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <p className="font-mono text-[9px] text-muted-foreground uppercase">Model</p>
            <p className="font-mono text-xs">{step.metadata?.model || "—"}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <div>
            <p className="font-mono text-[9px] text-muted-foreground uppercase">Duration</p>
            <p className="font-mono text-xs">
              {result?.duration ? `${(result.duration / 1000).toFixed(1)}s` : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-2 flex-wrap">
        {step.metadata?.isParallel && (
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-mono text-[9px]">
            Parallel
          </span>
        )}
        {step.metadata?.isCheckpoint && (
          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 font-mono text-[9px]">
            Checkpoint
          </span>
        )}
        {step.metadata?.conditional && (
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 font-mono text-[9px]">
            Conditional: {step.metadata.conditional}
          </span>
        )}
        {step.metadata?.group && (
          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-500 font-mono text-[9px]">
            Group: {step.metadata.group}
          </span>
        )}
      </div>

      {/* Retry info */}
      {result?.retryCount !== undefined && result.retryCount > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-500/5 border border-orange-500/20">
          <RefreshCw className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
          <p className="font-mono text-[11px] text-orange-500">
            Retried {result.retryCount} time{result.retryCount > 1 ? "s" : ""} — Orchestrator requested improvements
          </p>
        </div>
      )}

      {/* Escalation warning */}
      {result?.escalated && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/5 border border-red-500/20">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
          <p className="font-mono text-[11px] text-red-500">
            Escalated to user — quality score critically low after max retries
          </p>
        </div>
      )}

      {/* Evaluation feedback */}
      {result?.evaluationFeedback && (
        <div>
          <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Orchestrator Feedback</p>
          <div className="p-3 bg-background rounded-lg border border-border">
            <p className="font-mono text-[11px] text-foreground/80 whitespace-pre-wrap">
              {result.evaluationFeedback}
            </p>
          </div>
        </div>
      )}

      {/* Output */}
      {result?.output && (
        <div>
          <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Output</p>
          <div className="p-3 bg-background rounded-lg border border-border max-h-[120px] overflow-y-auto">
            <p className="font-mono text-[11px] text-foreground/80 whitespace-pre-wrap">
              {result.output}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {result?.error && (
        <div>
          <p className="font-mono text-[9px] text-destructive uppercase mb-1">Error</p>
          <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/20">
            <p className="font-mono text-[11px] text-red-500">{result.error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
