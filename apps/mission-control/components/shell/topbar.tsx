"use client";

import { Search, Command, DollarSign, Zap, Wallet } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useCostSummary } from "@/lib/hooks/use-costs";
import useSWR from "swr";
import { ActivityToggle } from "@/components/shell/activity-sidebar";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function Topbar() {
  const { setCommandPaletteOpen } = useAppStore();
  const { costs } = useCostSummary();
  const { data: realCosts } = useSWR("/api/costs/real", fetcher, { revalidateOnFocus: false });

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
