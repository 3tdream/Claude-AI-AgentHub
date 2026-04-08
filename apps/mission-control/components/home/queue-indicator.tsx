"use client";

import { ListOrdered, X } from "lucide-react";
import type { QueuedTask } from "@/types";

export function QueueIndicator({ queue, onClear }: {
  queue: QueuedTask[];
  onClear: () => void;
}) {
  if (queue.length === 0) return null;

  return (
    <div className="px-4 py-2 border-b border-slate-200 bg-indigo-50/50">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <ListOrdered className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-xs font-medium text-indigo-700">{queue.length} task{queue.length > 1 ? "s" : ""} queued</span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-indigo-400 hover:text-indigo-600 transition-colors"
          aria-label="Clear queue"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      </div>
      <div className="flex flex-col gap-0.5">
        {queue.map((task, i) => (
          <div key={task.id} className="flex items-center gap-2 font-mono text-[10px] text-indigo-600">
            <span className="text-indigo-400">{i + 1}.</span>
            <span className="truncate">{task.input.substring(0, 60)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
