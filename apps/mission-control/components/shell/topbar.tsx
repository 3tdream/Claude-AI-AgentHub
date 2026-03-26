"use client";

import { Search, Command, DollarSign, Zap, Wallet, FolderOpen, ChevronDown } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useCostSummary } from "@/lib/hooks/use-costs";
import useSWR from "swr";
import { useState, useRef, useEffect } from "react";
import { ActivityToggle } from "@/components/shell/activity-sidebar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Topbar() {
  const { setCommandPaletteOpen, activeProjectId, setActiveProject } = useAppStore();
  const { costs } = useCostSummary();
  const { data: realCosts } = useSWR("/api/costs/real", fetcher, { revalidateOnFocus: false });
  const { data: projectsData } = useSWR("/api/projects/discover", fetcher, { revalidateOnFocus: false });

  const totalTokens = costs
    ? (costs.totalInputTokens ?? 0) + (costs.totalOutputTokens ?? 0)
    : 0;

  const formatTokens = (t: number) => {
    if (t > 1_000_000) return (t / 1_000_000).toFixed(1) + "M";
    if (t > 1_000) return (t / 1_000).toFixed(0) + "K";
    return String(t);
  };

  const budget = realCosts?.data?.budget;
  const spent = budget?.spent;
  const remaining = budget?.remaining;
  const usedPercent = budget?.usedPercent ?? 0;

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

      {/* Project Selector */}
      <ProjectSelector
        projects={projectsData?.data || []}
        activeId={activeProjectId}
        onSelect={setActiveProject}
      />

      <div className="flex items-center gap-2">
        {/* Tokens + API cost (from Agent Hub) */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg border border-border bg-card">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3 h-3 text-amber-500" />
            <span className="font-mono text-[10px] text-muted-foreground">
              {costs ? formatTokens(totalTokens) : "\u2014"}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/50">tok</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-emerald-500" />
            <span className="font-mono text-[10px] font-semibold text-emerald-500">
              {costs
                ? costs.totalCost < 1
                  ? costs.totalCost.toFixed(3)
                  : costs.totalCost.toFixed(2)
                : "\u2014"}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/50">api</span>
          </div>
        </div>

        {/* Real total spend + budget */}
        {spent != null && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-card ${
              usedPercent > 90 ? "border-red-500/30" : usedPercent > 70 ? "border-amber-500/30" : "border-border"
            }`}
            title={`Budget: $${budget.monthly} | Spent: $${spent} | Remaining: $${remaining}`}
          >
            <Wallet className={`w-3 h-3 ${usedPercent > 90 ? "text-red-400" : usedPercent > 70 ? "text-amber-400" : "text-blue-400"}`} />
            <span className={`font-mono text-[10px] font-semibold ${usedPercent > 90 ? "text-red-400" : usedPercent > 70 ? "text-amber-400" : "text-blue-400"}`}>
              ${spent.toFixed(0)}
            </span>
            <span className="font-mono text-[9px] text-muted-foreground/50">/</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              ${budget.monthly}
            </span>
          </div>
        )}

        <ActivityToggle />
      </div>
    </header>
  );
}

/** Project Selector dropdown */
function ProjectSelector({
  projects,
  activeId,
  onSelect,
}: {
  projects: { id: string; name: string; framework: string; status: string; port: number }[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeProject = projects.find((p) => p.id === activeId);
  const activeProjects = projects.filter((p) => p.status === "active");

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${
          activeId
            ? "bg-primary/5 border-primary/30 text-foreground"
            : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
        }`}
      >
        <FolderOpen className={`w-4 h-4 ${activeId ? "text-primary" : ""}`} />
        <span className="font-mono text-xs max-w-[120px] truncate">
          {activeProject?.name || "No project"}
        </span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-64 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Clear selection */}
          <button
            onClick={() => { onSelect(null); setOpen(false); }}
            className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-muted ${
              !activeId ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            No project (global view)
          </button>
          <div className="border-t border-border" />

          {/* Active projects first */}
          {activeProjects.length > 0 && (
            <>
              <div className="px-3 py-1.5 font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest">
                Active
              </div>
              {activeProjects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onSelect(p.id); setOpen(false); }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors hover:bg-muted ${
                    activeId === p.id ? "bg-primary/5 text-primary" : "text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${activeId === p.id ? "bg-primary" : "bg-emerald-500"}`} />
                    <span className="text-xs font-medium truncate">{p.name}</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground shrink-0">:{p.port}</span>
                </button>
              ))}
            </>
          )}

          {/* Inactive projects */}
          {projects.filter((p) => p.status !== "active").length > 0 && (
            <>
              <div className="border-t border-border" />
              <div className="px-3 py-1.5 font-mono text-[9px] text-muted-foreground/50 uppercase tracking-widest">
                Inactive
              </div>
              {projects.filter((p) => p.status !== "active").slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  onClick={() => { onSelect(p.id); setOpen(false); }}
                  className="w-full px-3 py-2 text-left flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                  <span className="truncate">{p.name}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
