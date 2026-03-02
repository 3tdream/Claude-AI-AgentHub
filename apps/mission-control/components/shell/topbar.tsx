"use client";

import { Search, Command } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";

export function Topbar() {
  const { setCommandPaletteOpen } = useAppStore();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6">
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="font-mono text-xs">Search agents...</span>
        <kbd className="ml-4 flex items-center gap-0.5 font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card">
          <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse" />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            Connected
          </span>
        </div>
      </div>
    </header>
  );
}
