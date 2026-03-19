"use client";

import { Plus, X, Loader2, Pause, AlertTriangle } from "lucide-react";
import type { WorkflowSlot } from "@/types";

interface SlotBarProps {
  slots: [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
  activeSlotIndex: 0 | 1 | 2 | 3;
  onSelectSlot: (index: 0 | 1 | 2 | 3) => void;
  onClearSlot: (index: 0 | 1 | 2 | 3) => void;
  onAddToSlot: (index: 0 | 1 | 2 | 3) => void;
}

const statusIndicator: Record<string, { color: string; icon?: React.ReactNode }> = {
  empty: { color: "border-dashed border-border/50" },
  idle: { color: "border-border" },
  running: { color: "border-blue-500", icon: <Loader2 className="w-3 h-3 animate-spin text-blue-400" /> },
  paused: { color: "border-amber-500", icon: <Pause className="w-3 h-3 text-amber-400" /> },
  failed: { color: "border-red-500", icon: <AlertTriangle className="w-3 h-3 text-red-400" /> },
};

export function SlotBar({ slots, activeSlotIndex, onSelectSlot, onClearSlot, onAddToSlot }: SlotBarProps) {
  return (
    <div className="flex items-center gap-2">
      {slots.map((slot, i) => {
        const idx = i as 0 | 1 | 2 | 3;
        const isActive = activeSlotIndex === idx;
        const si = statusIndicator[slot.status] || statusIndicator.empty;

        if (slot.status === "empty") {
          return (
            <button
              key={idx}
              onClick={() => onAddToSlot(idx)}
              className={`
                flex items-center justify-center w-10 h-10 rounded-lg border-2 border-dashed border-border/40
                text-muted-foreground/40 hover:border-primary/40 hover:text-primary/60 transition-all
                ${isActive ? "ring-2 ring-primary/30" : ""}
              `}
              title={`Slot ${idx + 1} — empty`}
            >
              <Plus className="w-4 h-4" />
            </button>
          );
        }

        return (
          <button
            key={idx}
            onClick={() => onSelectSlot(idx)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all min-w-[120px] max-w-[200px]
              ${si.color}
              ${isActive
                ? "bg-primary/5 ring-2 ring-primary/30 border-primary/50"
                : "hover:bg-muted/50"
              }
            `}
            title={`Slot ${idx + 1}: ${slot.workflowName}`}
          >
            {si.icon && <span className="flex-shrink-0">{si.icon}</span>}
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-medium truncate">{slot.workflowName}</p>
              {slot.progress > 0 && slot.status === "running" && (
                <div className="w-full h-0.5 bg-border rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${slot.progress}%` }}
                  />
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearSlot(idx);
              }}
              className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-card border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
              title="Clear slot"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </button>
        );
      })}
    </div>
  );
}
