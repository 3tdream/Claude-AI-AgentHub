"use client";

import { Plus } from "lucide-react";

interface InsertStepButtonProps {
  position: number;
  onClick: (position: number) => void;
}

export function InsertStepButton({ position, onClick }: InsertStepButtonProps) {
  return (
    <button
      onClick={() => onClick(position)}
      aria-label={`Insert agent at position ${position + 1}`}
      className="
        group flex items-center justify-center w-5 h-5 rounded-full
        border border-dashed border-border/40 text-muted-foreground/30
        hover:border-primary/50 hover:text-primary hover:bg-primary/10 hover:scale-110
        transition-all duration-200 mx-0.5 flex-shrink-0
      "
    >
      <Plus className="w-2.5 h-2.5" />
    </button>
  );
}
