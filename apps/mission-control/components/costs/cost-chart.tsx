"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { DailyCost } from "@/types";

/** System economy milestones — annotated on the chart */
const MILESTONES: { date: string; label: string; color: string }[] = [
  { date: "2026-04-03", label: "Direct exec", color: "#10b981" },
  { date: "2026-04-08", label: "Rerun/Resume", color: "#3b82f6" },
];

export type Scale = "all" | "30d" | "7d" | "today";

const SCALES: { key: Scale; label: string }[] = [
  { key: "all",   label: "All Time" },
  { key: "30d",   label: "30 Days"  },
  { key: "7d",    label: "7 Days"   },
  { key: "today", label: "Today"    },
];

/** Returns a local-timezone YYYY-MM-DD string (avoids UTC-offset "yesterday" bug) */
function localDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function filterByScale(data: DailyCost[], scale: Scale): DailyCost[] {
  if (scale === "all") return data;

  const now = new Date();
  const today = localDateStr(now);

  if (scale === "today") {
    return data.filter((d) => d.date.slice(0, 10) === today);
  }

  const days = scale === "30d" ? 30 : 7;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const cutoffStr = localDateStr(cutoff);

  return data.filter((d) => d.date.slice(0, 10) >= cutoffStr);
}

interface CostChartProps {
  data: DailyCost[];
  scale?: Scale;
  onScaleChange?: (scale: Scale) => void;
}

export function CostChart({ data, scale: controlledScale, onScaleChange }: CostChartProps) {
  const [internalScale, setInternalScale] = useState<Scale>("all");
  const scale = controlledScale ?? internalScale;
  const handleScaleChange = (s: Scale) => {
    setInternalScale(s);
    onScaleChange?.(s);
  };

  const filtered = filterByScale(data, scale);

  const chartData = filtered.map((d) => ({
    date: scale === "today" ? d.date.slice(0, 10) : d.date.slice(5), // MM-DD or full date for today
    fullDate: d.date.slice(0, 10),
    cost: Number(d.cost.toFixed(4)),
    requests: d.requests,
  }));

  // Find which milestones fall within the visible data range
  const visibleMilestones = MILESTONES.filter((m) => {
    const mKey = scale === "today" ? m.date.slice(0, 10) : m.date.slice(5);
    return chartData.some((d) => d.date === mKey);
  }).map((m) => ({
    ...m,
    dateKey: scale === "today" ? m.date.slice(0, 10) : m.date.slice(5),
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm">Daily Cost Trend</h3>

        {/* Scale selector */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {SCALES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => handleScaleChange(key)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                scale === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        {chartData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
            <span>No data for this period</span>
            {scale !== "all" && (
              <button
                onClick={() => handleScaleChange("all")}
                className="text-primary hover:underline"
              >
                Show All Time
              </button>
            )}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontFamily: "Space Mono, monospace",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [`${value.toFixed(4)}`, "Cost"]}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#7c3aed" }}
              />
              {visibleMilestones.map((m) => (
                <ReferenceLine
                  key={m.date}
                  x={m.dateKey}
                  stroke={m.color}
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Milestone legend */}
      {visibleMilestones.length > 0 && (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Milestones:</span>
          {visibleMilestones.map((m) => (
            <div key={m.date} className="flex items-center gap-1.5">
              <div className="w-4 h-0 border-t-2 border-dashed" style={{ borderColor: m.color }} />
              <span className="text-xs font-mono font-semibold" style={{ color: m.color }}>
                {m.label}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                ({m.date.slice(5)})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
