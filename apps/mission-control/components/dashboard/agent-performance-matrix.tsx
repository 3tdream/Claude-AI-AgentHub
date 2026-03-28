"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, AlertTriangle, CheckCircle2, Minus } from "lucide-react";

interface AgentStat {
  runs: number;
  avgScore: number;
  successRate: number;
  failRate: number;
  avgTokens: number;
  avgDuration: number;
}

type SortKey = "agent" | "runs" | "avgScore" | "successRate" | "failRate" | "avgTokens" | "avgDuration";

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

export function AgentPerformanceMatrix() {
  const [stats, setStats] = useState<Record<string, AgentStat>>({});
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("successRate");
  const [sortAsc, setSortAsc] = useState(true); // worst first by default

  useEffect(() => {
    fetch("/api/agents/performance")
      .then((r) => r.json())
      .then((d) => {
        if (d.agentStats) setStats(d.agentStats);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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

  if (entries.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-bold text-sm mb-2">Agent Performance Matrix</h2>
        <p className="font-mono text-xs text-muted-foreground">No pipeline analytics data available</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <h2 className="font-bold text-sm">Agent Performance Matrix</h2>
        <span className="font-mono text-[10px] text-muted-foreground">{entries.length} agents tracked</span>
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
            {entries.map((row) => (
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
