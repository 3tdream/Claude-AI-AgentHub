"use client";

import { DollarSign } from "lucide-react";
import { useCostSummary, useDailyCosts } from "@/lib/hooks/use-costs";
import { CostChart } from "@/components/costs/cost-chart";
import { ProviderBreakdown } from "@/components/costs/provider-breakdown";

export default function CostsPage() {
  const { costs, isLoading: costsLoading } = useCostSummary();
  const { dailyCosts, isLoading: dailyLoading } = useDailyCosts(30);

  const totalTokens = costs
    ? (costs.totalInputTokens ?? 0) + (costs.totalOutputTokens ?? 0)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Cost Analytics</h1>
        <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
          AI usage costs and metrics
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Total Cost</span>
          </div>
          <p className="text-3xl font-extrabold">
            {costsLoading ? "\u2014" : costs ? `$${costs.totalCost.toFixed(2)}` : "$0.00"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center">
              <span className="text-secondary font-bold">#</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Total Requests</span>
          </div>
          <p className="text-3xl font-extrabold">
            {costsLoading ? "\u2014" : costs ? costs.totalRequests.toLocaleString() : "0"}
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-chart-3/10 border border-chart-3/20 flex items-center justify-center">
              <span className="text-chart-3 font-bold font-mono text-sm">T</span>
            </div>
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Total Tokens</span>
          </div>
          <p className="text-3xl font-extrabold">
            {costsLoading ? "\u2014" : totalTokens ? (totalTokens / 1000000).toFixed(2) + "M" : "0"}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {dailyLoading ? (
            <div className="bg-card border border-border rounded-xl p-6 h-80 animate-pulse" />
          ) : dailyCosts.length > 0 ? (
            <CostChart data={dailyCosts} />
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center h-80">
              <p className="font-mono text-xs text-muted-foreground">No daily cost data</p>
            </div>
          )}
        </div>
        <div>
          {costsLoading ? (
            <div className="bg-card border border-border rounded-xl p-6 h-80 animate-pulse" />
          ) : costs?.byProvider ? (
            <ProviderBreakdown data={costs.byProvider} />
          ) : (
            <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center h-80">
              <p className="font-mono text-xs text-muted-foreground">No provider data</p>
            </div>
          )}
        </div>
      </div>

      {/* Daily costs table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-sm">Daily Breakdown (Last 30 Days)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 text-left">Date</th>
                <th className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 text-left">Cost</th>
                <th className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 text-left">Requests</th>
                <th className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-5 py-3 text-left">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {dailyLoading ? (
                <tr><td colSpan={4} className="text-center py-8 font-mono text-xs text-muted-foreground">Loading...</td></tr>
              ) : dailyCosts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 font-mono text-xs text-muted-foreground">No cost data available</td></tr>
              ) : (
                dailyCosts.map((d) => (
                  <tr key={d.date} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs">{d.date}</td>
                    <td className="px-5 py-3 font-mono text-xs text-chart-4">${d.cost.toFixed(4)}</td>
                    <td className="px-5 py-3 font-mono text-xs">{d.requests}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{d.tokens.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
