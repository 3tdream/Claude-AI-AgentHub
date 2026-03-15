"use client";

import { useState } from "react";
import { X, Clock, Cpu, Layers, RefreshCw, AlertTriangle, FileCode2, Check, XCircle, Loader2, BarChart3, Search, BookOpen, Pencil, FilePlus, Terminal } from "lucide-react";
import type { WorkflowStep, StepResult, QualityScore } from "@/types";
import { QualityScoreBadge } from "./quality-score-badge";
import { parseCodeBlocks, type ParsedCodeBlock } from "@/lib/code-block-parser";

interface StageDetailPanelProps {
  step: WorkflowStep;
  result?: StepResult;
  qualityScore?: QualityScore;
  onClose: () => void;
}

export function StageDetailPanel({ step, result, qualityScore, onClose }: StageDetailPanelProps) {
  const [applyStatus, setApplyStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [applyResult, setApplyResult] = useState<{ created: number; updated: number; errors: number } | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Set<number>>(new Set());

  const codeBlocks: ParsedCodeBlock[] = result?.output ? parseCodeBlocks(result.output) : [];

  async function handleApply() {
    if (codeBlocks.length === 0) return;
    setApplyStatus("loading");
    try {
      const res = await fetch("/api/orchestration/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: codeBlocks.map((b) => ({
            filePath: b.filePath,
            content: b.content,
            language: b.language,
          })),
          pipelineId: result?.stepId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setApplyStatus("success");
        setApplyResult(data.summary);
      } else {
        setApplyStatus("error");
        setApplyResult(data.summary);
      }
    } catch {
      setApplyStatus("error");
    }
  }

  function toggleBlock(idx: number) {
    setExpandedBlocks((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }
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

      {/* Token Analytics */}
      {result?.outputTokens !== undefined && result.outputTokens > 0 && (
        <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-muted/50 border border-border">
          <BarChart3 className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <div className="flex gap-4 font-mono text-[10px]">
            <span className="text-muted-foreground">
              In: <span className="text-foreground">{result.inputTokens?.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              Out: <span className="text-foreground">{result.outputTokens.toLocaleString()}</span>
            </span>
            <span className="text-muted-foreground">
              Chars: <span className="text-foreground">{result.outputChars?.toLocaleString()}</span>
            </span>
            {result.provider && (
              <span className="text-muted-foreground">
                Via: <span className="text-foreground">{result.provider}</span>
              </span>
            )}
          </div>
        </div>
      )}

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

      {/* Agent Activity Log (Tool Calls) */}
      {result?.toolCalls && result.toolCalls.length > 0 && (
        <div>
          <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
            <Terminal className="w-3 h-3" />
            Agent Activity ({result.toolCalls.length} tool calls)
          </p>
          <div className="space-y-1 max-h-[250px] overflow-y-auto">
            {result.toolCalls.map((tc, idx) => {
              const iconMap: Record<string, typeof Search> = {
                list_files: Search,
                read_file: BookOpen,
                edit_file: Pencil,
                create_file: FilePlus,
                run_command: Terminal,
              };
              const Icon = iconMap[tc.name] || Terminal;
              const colorMap: Record<string, string> = {
                list_files: "text-blue-400",
                read_file: "text-cyan-400",
                edit_file: "text-amber-400",
                create_file: "text-emerald-400",
                run_command: "text-purple-400",
              };
              const color = colorMap[tc.name] || "text-muted-foreground";
              const inputSummary = tc.input.path || tc.input.command || JSON.stringify(tc.input).substring(0, 60);

              return (
                <div key={idx} className={`flex items-start gap-2 px-2 py-1.5 rounded-lg ${tc.success ? "bg-muted/30" : "bg-red-500/5 border border-red-500/20"}`}>
                  <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] font-semibold ${color}`}>{tc.name}</span>
                      <span className="font-mono text-[9px] text-muted-foreground">{tc.durationMs}ms</span>
                      {!tc.success && <XCircle className="w-3 h-3 text-red-400" />}
                    </div>
                    <p className="font-mono text-[10px] text-foreground/60 truncate">{inputSummary}</p>
                    {!tc.success && tc.output && (
                      <p className="font-mono text-[9px] text-red-400 mt-0.5 truncate">{tc.output}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Output */}
      {result?.output && (
        <div>
          <p className="font-mono text-[9px] text-muted-foreground uppercase mb-1">Output</p>
          <div className="p-3 bg-background rounded-lg border border-border max-h-[300px] overflow-y-auto">
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

      {/* Auto-Apply: Parsed code blocks */}
      {codeBlocks.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[9px] text-muted-foreground uppercase flex items-center gap-1.5">
              <FileCode2 className="w-3 h-3" />
              {codeBlocks.length} file{codeBlocks.length > 1 ? "s" : ""} detected
            </p>
            <button
              onClick={handleApply}
              disabled={applyStatus === "loading" || applyStatus === "success"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all ${
                applyStatus === "success"
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                  : applyStatus === "error"
                  ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
                  : "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
              }`}
            >
              {applyStatus === "loading" && <Loader2 className="w-3 h-3 animate-spin" />}
              {applyStatus === "success" && <Check className="w-3 h-3" />}
              {applyStatus === "error" && <XCircle className="w-3 h-3" />}
              {applyStatus === "idle" && <FileCode2 className="w-3 h-3" />}
              {applyStatus === "success"
                ? `Applied (${applyResult?.created}+${applyResult?.updated})`
                : applyStatus === "error"
                ? "Retry Apply"
                : "Apply to Project"}
            </button>
          </div>

          <div className="space-y-1.5">
            {codeBlocks.map((block, idx) => (
              <div key={idx} className="rounded-lg border border-border overflow-hidden">
                <button
                  onClick={() => toggleBlock(idx)}
                  className="w-full flex items-center justify-between px-3 py-1.5 bg-muted/50 hover:bg-muted transition-colors"
                >
                  <span className="font-mono text-[10px] text-foreground/80 truncate">
                    {block.filePath}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0 ml-2">
                    {block.language} · {block.content.split("\n").length} lines
                  </span>
                </button>
                {expandedBlocks.has(idx) && (
                  <pre className="p-3 bg-background text-[10px] font-mono overflow-x-auto max-h-[200px] overflow-y-auto">
                    <code>{block.content}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
