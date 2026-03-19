"use client";

import { Plus, X, Loader2, Pause, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { WorkflowSlot, SlotStatus } from "@/types";

interface SlotBarProps {
  slots: [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
  activeSlotIndex: 0 | 1 | 2 | 3;
  onSelectSlot: (index: 0 | 1 | 2 | 3) => void;
  onClearSlot: (index: 0 | 1 | 2 | 3) => void;
  onAddToSlot: (index: 0 | 1 | 2 | 3) => void;
}

const statusConfig: Record<SlotStatus, { border: string; bg: string; icon?: React.ReactNode; dot?: string }> = {
  empty: { border: "border-dashed border-border/40", bg: "" },
  idle: { border: "border-border", bg: "", dot: "bg-muted-foreground/40" },
  running: {
    border: "border-blue-500/60",
    bg: "bg-blue-500/5",
    icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />,
  },
  paused: {
    border: "border-amber-500/60",
    bg: "bg-amber-500/5",
    icon: <Pause className="w-3.5 h-3.5 text-amber-400" />,
  },
  failed: {
    border: "border-red-500/60",
    bg: "bg-red-500/5",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />,
  },
};

export function SlotBar({ slots, activeSlotIndex, onSelectSlot, onClearSlot, onAddToSlot }: SlotBarProps) {
  return (
    <div className="flex items-center gap-1.5">
      {slots.map((slot, i) => {
        const idx = i as 0 | 1 | 2 | 3;
        const isActive = activeSlotIndex === idx;
        const cfg = statusConfig[slot.status] || statusConfig.empty;

        if (slot.status === "empty") {
          return (
            <button
              key={slot.id}
              onClick={() => onAddToSlot(idx)}
              aria-label={`Slot ${idx + 1} — empty, click to add workflow`}
              className={`
                relative flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all duration-200
                ${cfg.border}
                text-muted-foreground/30 hover:border-primary/40 hover:text-primary/60 hover:bg-primary/5
                ${isActive ? "ring-2 ring-primary/20 border-primary/30 text-primary/50" : ""}
              `}
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="absolute -bottom-3.5 font-mono text-[8px] text-muted-foreground/40">{idx + 1}</span>
            </button>
          );
        }

        return (
          <button
            key={slot.id}
            onClick={() => onSelectSlot(idx)}
            aria-label={`Slot ${idx + 1}: ${slot.workflowName} — ${slot.status}`}
            className={`
              group relative flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg border-2 transition-all duration-200
              min-w-[100px] max-w-[180px]
              ${cfg.border} ${cfg.bg}
              ${isActive
                ? "ring-2 ring-primary/20 border-primary/50 bg-primary/5 shadow-sm"
                : "hover:bg-muted/50 hover:border-border"
              }
            `}
          >
            {/* Status icon or slot number */}
            <span className="flex-shrink-0 w-4 flex items-center justify-center">
              {cfg.icon || (
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot || "bg-muted-foreground/30"}`} />
              )}
            </span>

            <div className="flex-1 min-w-0 text-left">
              <p className="text-[11px] font-medium truncate leading-tight">{slot.workflowName}</p>
              {/* Progress bar */}
              {slot.progress > 0 && slot.status === "running" && (
                <div className="w-full h-[3px] bg-border/50 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${slot.progress}%` }}
                  />
                </div>
              )}
            </div>

            {/* Close — div instead of button to avoid nested <button> hydration error */}
            <div
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onClearSlot(idx); }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); onClearSlot(idx); } }}
              aria-label={`Clear slot ${idx + 1}`}
              className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive transition-all cursor-pointer"
            >
              <X className="w-2.5 h-2.5" />
            </div>

            {/* Slot number */}
            <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 font-mono text-[8px] text-muted-foreground/40">{idx + 1}</span>
          </button>
        );
      })}
    </div>
  );
}
