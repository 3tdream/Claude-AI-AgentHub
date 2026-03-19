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
      className="group flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-transparent hover:border-primary/50 text-transparent hover:text-primary transition-all mx-0.5"
      title={`Insert agent at position ${position + 1}`}
    >
      <Plus className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
