"use client";

import { useState, useEffect } from "react";
import { DollarSign, Filter, FolderOpen, TrendingUp, CheckCircle2, BarChart3 } from "lucide-react";
import { useCostSummary, useDailyCosts } from "@/lib/hooks/use-costs";
import { useAppStore } from "@/lib/stores/app-store";
import { CostChart, filterByScale, type Scale } from "@/components/costs/cost-chart";
import { ProviderBreakdown } from "@/components/costs/provider-breakdown";

export default function CostsPage() {
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const [filterByProject, setFilterByProject] = useState(false);

  const [costScale, setCostScale] = useState<Scale>("all");

  const effectiveProjectId = filterByProject ? activeProjectId : undefined;
  const { costs, isLoading: costsLoading } = useCostSummary(undefined, effectiveProjectId);
  // Fetch 90 days so shorter scales have data to filter from
  const { dailyCosts, isLoading: dailyLoading } = useDailyCosts(90, effectiveProjectId);
  const filteredDailyCosts = filterByScale(dailyCosts, costScale);

  const totalTokens = costs
    ? (costs.totalInputTokens ?? 0) + (costs.totalOutputTokens ?? 0)
    : 0;

  // Pipeline stats for cost efficiency
  const [pipelineStats, setPipelineStats] = useState<{
    totalRuns: number; completed: number; failed: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/pipeline/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.totalRuns) setPipelineStats({ totalRuns: d.totalRuns, completed: d.completed, failed: d.failed });
      })
      .catch(() => {});
  }, []);

  const costPerRun = pipelineStats && costs ? costs.totalCost / (pipelineStats.totalRuns || 1) : 0;
  const costPerSuccess = pipelineStats && costs ? costs.totalCost / (pipelineStats.completed || 1) : 0;
  const pipelineSuccessRate = pipelineStats ? (pipelineStats.completed / (pipelineStats.totalRuns || 1)) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Cost Analytics</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            AI usage costs and metrics
          </p>
        </div>

        {activeProjectId && (
          <button
            onClick={() => setFilterByProject((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filterByProject
                ? "bg-violet-500/10 border-violet-500/20 text-violet-400"
                : "bg-card border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            {filterByProject ? (
              <FolderOpen className="w-3 h-3" />
            ) : (
              <Filter className="w-3 h-3" />
            )}
            {filterByProject ? `Showing: ${activeProjectId}` : "Showing: All Projects"}
          </button>
        )}
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
            <CostChart data={dailyCosts} scale={costScale} onScaleChange={setCostScale} />
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

      {/* Cost Efficiency */}
      {pipelineStats && costs && (
        <div className="space-y-3">
          <h2 className="font-bold text-sm">Cost Efficiency</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-chart-4/10 border border-chart-4/20 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-chart-4" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">$ per Pipeline Run</span>
              </div>
              <p className="text-3xl font-extrabold">${costPerRun.toFixed(2)}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">{pipelineStats.totalRuns} total runs</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">$ per Successful Run</span>
              </div>
              <p className="text-3xl font-extrabold">${costPerSuccess.toFixed(2)}</p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">{pipelineStats.completed} completed</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Pipeline Success Rate</span>
              </div>
              <p className={`text-3xl font-extrabold ${pipelineSuccessRate > 70 ? "text-emerald-400" : pipelineSuccessRate >= 40 ? "text-amber-400" : "text-red-400"}`}>
                {pipelineSuccessRate.toFixed(1)}%
              </p>
              <p className="font-mono text-[10px] text-muted-foreground mt-1">{pipelineStats.failed} failed</p>
            </div>
          </div>
        </div>
      )}

      {/* Daily costs table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="font-bold text-sm">
            Daily Breakdown ({costScale === "all" ? "All Time" : costScale === "30d" ? "Last 30 Days" : costScale === "7d" ? "Last 7 Days" : "Today"})
          </h2>
        </div>
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(20*2.75rem+3rem)]">
          <table className="w-full">
            <thead className="sticky top-0 z-10 bg-card">
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
              ) : filteredDailyCosts.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8 font-mono text-xs text-muted-foreground">No cost data for this period</td></tr>
              ) : (
                filteredDailyCosts.map((d) => (
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
