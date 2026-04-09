"use client";

import { Play, Pause, Square } from "lucide-react";
import type { PipelineExecution } from "@/types";

export interface ExecutionBarProps {
  activeExecution: PipelineExecution;
  completedSteps: number;
  totalSteps: number;
  pauseRequested: boolean;
  stopRequested: boolean;
  onResume: () => void;
  onPause: () => void;
  onStop: () => void;
}

export function ExecutionBar({
  activeExecution,
  completedSteps,
  totalSteps,
  pauseRequested,
  stopRequested,
  onResume,
  onPause,
  onStop,
}: ExecutionBarProps) {
  if (activeExecution.status === "completed" || activeExecution.status === "failed") return null;

  return (
    <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            activeExecution.status === "running" ? "bg-emerald-500 animate-pulse" :
            activeExecution.status === "paused" ? "bg-amber-500" : "bg-slate-400"
          }`} />
          <span className="text-xs font-medium text-slate-700">{activeExecution.workflowName}</span>
          <span className="font-mono text-[10px] text-slate-400">
            {completedSteps}/{totalSteps} steps
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Resume button (#11) */}
          {(pauseRequested || activeExecution.status === "paused") && (
            <button
              onClick={onResume}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
            >
              <Play className="w-3 h-3" />
              Resume
            </button>
          )}
          {/* Pause */}
          {activeExecution.status === "running" && !pauseRequested && (
            <button
              onClick={onPause}
              className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
              title="Pause pipeline"
            >
              <Pause className="w-3.5 h-3.5" />
            </button>
          )}
          {/* Stop */}
          {activeExecution.status === "running" && !stopRequested && (
            <button
              onClick={onStop}
              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              title="Stop pipeline"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            pauseRequested ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
        />
      </div>
    </div>
  );
}
