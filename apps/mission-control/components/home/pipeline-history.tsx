"use client";

import { useState } from "react";
import { History, FileText, Layers, ExternalLink, Play, FileDown, Filter } from "lucide-react";
import { toast } from "sonner";
import type { PipelineExecution } from "@/types";

export interface PipelineHistoryProps {
  executionHistory: PipelineExecution[];
  activeExecution: PipelineExecution | null;
  viewingExecution: PipelineExecution | null;
  executing: boolean;
  onViewExecution: (exec: PipelineExecution | null) => void;
  onSelectStage: (stageId: string | null) => void;
  onSetPipelineView: (view: "input" | "history") => void;
  onResumeExecution: (exec: PipelineExecution) => void;
  /** Available projectIds for filter dropdown */
  projectIds?: string[];
}

export function PipelineHistory({
  executionHistory,
  activeExecution,
  viewingExecution,
  executing,
  onViewExecution,
  onSelectStage,
  onSetPipelineView,
  onResumeExecution,
  projectIds = [],
}: PipelineHistoryProps) {
  const [projectFilter, setProjectFilter] = useState<string>("");

  const filtered = projectFilter
    ? executionHistory.filter((e) => (e as any).projectId === projectFilter)
    : executionHistory;

  // Deduplicate by ID
  const deduplicated = filtered.filter((exec, idx, arr) => arr.findIndex((e) => e.id === exec.id) === idx);

  if (executionHistory.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <History className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <div className="text-sm text-slate-400">No executions yet</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Project filter */}
      {projectIds.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-3 h-3 text-slate-400" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs font-mono bg-white border border-slate-200 rounded px-2 py-1 text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-300"
          >
            <option value="">All projects ({executionHistory.length})</option>
            {projectIds.map((pid) => (
              <option key={pid} value={pid}>{pid}</option>
            ))}
          </select>
          {projectFilter && (
            <span className="text-[10px] text-slate-400">{deduplicated.length} runs</span>
          )}
        </div>
      )}

      <div className="space-y-2">
        {deduplicated.map((exec, index) => {
          const rowNumber = deduplicated.length - index;
          const shortId = (exec as any).shortId || `#${rowNumber}`;
          const steps = Object.values(exec.stepResults);
          const done = steps.filter((s) => s.status === "completed").length;
          const failed = steps.filter((s) => s.status === "failed").length;
          const elapsed = exec.totalDuration ? `${Math.round(exec.totalDuration / 1000)}s` : "\u2014";
          const isStale = (exec.status === "paused" || exec.status === "running") && activeExecution?.id !== exec.id;
          const displayStatus = isStale ? "interrupted" : exec.status;
          const stepsWithOutput = steps.filter((s) => s.output);
          const hasFiles = stepsWithOutput.some((s) => s.output && (s.output.includes('```') || s.output.includes('"files"')));
          const isViewing = viewingExecution?.id === exec.id;
          return (
            <div key={exec.id} className={`bg-white border rounded-lg p-3 transition-all cursor-pointer ${isViewing ? "border-indigo-300 shadow-md ring-1 ring-indigo-200" : "border-slate-200 hover:shadow-sm hover:border-slate-300"}`}>
              {/* Clickable card body */}
              <div
                onClick={() => {
                  if (isViewing) {
                    onViewExecution(null);
                    onSelectStage(null);
                  } else {
                    onViewExecution(exec);
                    onSelectStage(null);
                    onSetPipelineView("input");
                  }
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Jira key (primary) or shortId fallback */}
                    <div className="flex items-center gap-2 mb-1">
                      {exec.jiraKey ? (
                        <a
                          href={(exec as any).jiraUrl || `#${exec.jiraKey}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        >
                          {exec.jiraKey}
                        </a>
                      ) : (
                        <span className="font-mono text-xs font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {shortId}
                        </span>
                      )}
                      <span className="font-mono text-[10px] text-slate-300">#{rowNumber}</span>
                      {(exec as any).projectId && (
                        <span className="font-mono text-[10px] text-teal-500 bg-teal-50 px-1.5 rounded">
                          {(exec as any).projectId}
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-slate-700 truncate">{exec.input?.substring(0, 400)}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`font-mono text-[10px] uppercase tracking-wide font-medium ${
                        displayStatus === "completed" ? "text-emerald-600" : displayStatus === "failed" ? "text-rose-600" : displayStatus === "interrupted" || displayStatus === "paused" || displayStatus === "stopped" ? "text-amber-600" : "text-indigo-600"
                      }`}>
                        {displayStatus}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{done}/{steps.length} steps</span>
                      {failed > 0 && <span className="font-mono text-[10px] text-rose-400">{failed} failed</span>}
                      <span className="font-mono text-[10px] text-slate-400">{elapsed}</span>
                      {hasFiles && (
                        <span className="font-mono text-[10px] text-violet-500 bg-violet-50 px-1.5 rounded flex items-center gap-0.5">
                          <FileText className="w-2.5 h-2.5" />
                          files
                        </span>
                      )}
                      {stepsWithOutput.length > 0 && (
                        <span className="font-mono text-[10px] text-slate-400">{stepsWithOutput.length} outputs</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5 shrink-0 ml-2">
                    <span className="font-mono text-[10px] text-slate-300">
                      {new Date(exec.startedAt).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span className="font-mono text-[10px] text-slate-300">
                      {new Date(exec.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                </div>
                {/* Step results mini bar */}
                <div className="flex gap-0.5 mt-2">
                  {steps.map((step) => (
                    <div
                      key={step.stepId}
                      className={`h-1 flex-1 rounded-full ${
                        step.status === "completed" ? "bg-emerald-400" :
                        step.status === "failed" ? "bg-rose-400" :
                        step.status === "running" ? "bg-indigo-400 animate-pulse" :
                        "bg-slate-200"
                    }`}
                    title={`${step.stepId}: ${step.status}`}
                  />
                ))}
              </div>
              </div>{/* end clickable body */}

              {/* Action buttons row */}
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                {/* View stages */}
                {stepsWithOutput.length > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewExecution(exec);
                      onSelectStage(null);
                      onSetPipelineView("input");
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                  >
                    <Layers className="w-3 h-3" />
                    View Stages
                  </button>
                )}
                {/* Deploy */}
                {hasFiles && exec.status === "completed" && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const stepWithFiles = stepsWithOutput.find((s) => s.output && (s.output.includes('```') || s.output.includes('"files"')));
                      if (stepWithFiles) {
                        onViewExecution(exec);
                        onSelectStage(stepWithFiles.stepId);
                        onSetPipelineView("input");
                      }
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Deploy Files
                  </button>
                )}
                {/* Resume */}
                {(isStale || exec.status === "stopped" || exec.status === "failed") && exec.input && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onResumeExecution(exec);
                    }}
                    disabled={executing}
                    className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    <Play className="w-3 h-3" />
                    {done > 0 ? `Resume (skip ${done} done)` : "Re-run"}
                  </button>
                )}
                {/* Export */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const blob = new Blob([JSON.stringify(exec, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `pipeline-${shortId}.json`;
                    a.click();
                    setTimeout(() => URL.revokeObjectURL(url), 200);
                    toast.success(`Exported ${shortId}`);
                  }}
                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors ml-auto"
                >
                  <FileDown className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
