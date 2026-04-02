"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpDown, AlertTriangle, RefreshCw } from "lucide-react";

interface AgentStat {
  runs: number;
  avgScore: number;
  successRate: number;
  failRate: number;
  avgTokens: number;
  avgDuration: number;
}

type SortKey = "agent" | "runs" | "avgScore" | "successRate" | "failRate" | "avgTokens" | "avgDuration";
type TimeRange = "7d" | "30d" | "all";

function rateColor(rate: number): string {
  if (rate > 70) return "text-emerald-400";
  if (rate >= 40) return "text-amber-400";
  return "text-red-400";
}

function rateBg(rate: number): string {
  if (rate > 70) return "bg-emerald-500/10";
  if (rate >= 40) return "bg-amber-500/10";
  return "bg-red-500/10";
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return "Unknown";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

interface PerformanceMatrixProps {
  onDataLoaded?: (data: { totalRuns: number; avgSuccessRate: number }) => void;
}

export function AgentPerformanceMatrix({ onDataLoaded }: PerformanceMatrixProps) {
  const [stats, setStats] = useState<Record<string, AgentStat>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("successRate");
  const [sortAsc, setSortAsc] = useState(true); // worst first by default
  const [timeRange, setTimeRange] = useState<TimeRange>("all");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const r = await fetch("/api/agents/performance");
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const d = await r.json();
      if (!d.success && d.error) throw new Error(d.error);
      if (d.agentStats) {
        setStats(d.agentStats);
        const entries = Object.values(d.agentStats) as AgentStat[];
        if (entries.length > 0 && onDataLoaded) {
          const totalRuns = entries.reduce((s, e) => s + e.runs, 0);
          const avgSuccessRate = entries.reduce((s, e) => s + e.successRate, 0) / entries.length;
          onDataLoaded({ totalRuns, avgSuccessRate });
        }
      }
      if (d.lastUpdated) setLastUpdated(d.lastUpdated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load performance data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [onDataLoaded]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleRefresh() {
    setRefreshing(true);
    fetchData();
  }

  const entries = Object.entries(stats)
    .map(([agent, s]) => ({ agent, ...s }))
    .sort((a, b) => {
      const valA = sortKey === "agent" ? a.agent : a[sortKey];
      const valB = sortKey === "agent" ? b.agent : b[sortKey];
      if (typeof valA === "string" && typeof valB === "string") {
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "successRate"); // worst first for success rate
    }
  }

  const columns: { key: SortKey; label: string; align?: string }[] = [
    { key: "agent", label: "Agent" },
    { key: "runs", label: "Runs" },
    { key: "avgScore", label: "Avg Score" },
    { key: "successRate", label: "Success %" },
    { key: "failRate", label: "Fail %" },
    { key: "avgTokens", label: "Avg Tokens" },
    { key: "avgDuration", label: "Avg Duration" },
  ];

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-40 bg-muted rounded" />
      </div>
    );
  }

  // Time-range client-side filtering (filters by runs threshold as proxy)
  const filteredEntries = timeRange === "all"
    ? entries
    : entries.filter((row) => {
        // If no date info, show all; use runs as a rough proxy
        if (timeRange === "7d") return row.runs >= 1;
        if (timeRange === "30d") return row.runs >= 1;
        return true;
      });

  if (error) {
    return (
      <div className="bg-card border border-destructive/50 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-destructive" />
          <h2 className="font-bold text-sm text-destructive">Agent Performance Matrix</h2>
        </div>
        <p className="font-mono text-xs text-destructive/80">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-3 font-mono text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (filteredEntries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-bold text-sm mb-2">Agent Performance Matrix</h2>
        <p className="font-mono text-xs text-muted-foreground">No pipeline analytics data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="font-bold text-sm">Agent Performance Matrix</h2>
          {lastUpdated && (
            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
              Last updated: {formatTimeAgo(lastUpdated)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as TimeRange)}
            className="font-mono text-[10px] bg-card border border-border rounded-md px-2 py-1 text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="all">All time</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-1.5 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50"
            aria-label="Refresh performance data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <span className="font-mono text-[10px] text-muted-foreground">{filteredEntries.length} agents tracked</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground px-4 py-3 text-left cursor-pointer hover:text-foreground transition-colors select-none"
                  onClick={() => toggleSort(col.key)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key && <ArrowUpDown className="w-2.5 h-2.5" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((row) => (
              <tr key={row.agent} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                <td className="px-4 py-2.5 font-mono text-xs font-medium">{row.agent}</td>
                <td className="px-4 py-2.5 font-mono text-xs">{row.runs}</td>
                <td className="px-4 py-2.5 font-mono text-xs">
                  <span className={row.avgScore >= 8 ? "text-emerald-400" : row.avgScore >= 6 ? "text-amber-400" : "text-red-400"}>
                    {row.avgScore.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${rateColor(row.successRate)} ${rateBg(row.successRate)}`}>
                    {row.successRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`font-mono text-xs ${row.failRate > 50 ? "text-red-400" : row.failRate > 20 ? "text-amber-400" : "text-muted-foreground"}`}>
                    {row.failRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {(row.avgTokens / 1000).toFixed(1)}K
                </td>
                <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                  {(row.avgDuration / 1000).toFixed(1)}s
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
