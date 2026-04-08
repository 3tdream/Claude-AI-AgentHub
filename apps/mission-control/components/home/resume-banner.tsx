"use client";

import { AlertTriangle, Play, X } from "lucide-react";
import type { PipelineExecution } from "@/types";

export function ResumeBanner({ execution, onResume, onDiscard }: {
  execution: PipelineExecution;
  onResume: () => void;
  onDiscard: () => void;
}) {
  const completedSteps = Object.values(execution.stepResults).filter((r) => r.status === "completed").length;
  const totalSteps = Object.keys(execution.stepResults).length;
  const taskPreview = execution.input?.substring(0, 60) || "Unknown task";
  const isInterrupted = execution.status === "interrupted";

  return (
    <div className="mx-4 mt-2 flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-amber-200 bg-amber-50">
      <div className="flex items-center gap-2.5 min-w-0">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <div className="min-w-0">
          <div className="text-xs font-medium text-amber-800 truncate">
            {isInterrupted ? "Interrupted pipeline" : "Paused pipeline"}: {taskPreview}
          </div>
          <div className="font-mono text-[10px] text-amber-600">
            {completedSteps}/{totalSteps} steps completed
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={onResume}
          className="flex items-center gap-1 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-md hover:bg-amber-700 transition-colors"
        >
          <Play className="w-3 h-3" />
          Resume
        </button>
        <button
          onClick={onDiscard}
          className="p-1.5 text-amber-400 hover:text-amber-600 transition-colors"
          aria-label="Discard execution"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
