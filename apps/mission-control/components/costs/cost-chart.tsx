"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { DailyCost } from "@/types";

interface CostChartProps {
  data: DailyCost[];
}

export function CostChart({ data }: CostChartProps) {
  const chartData = data.map((d) => ({
    date: d.date.slice(5), // MM-DD
    cost: Number(d.cost.toFixed(4)),
    requests: d.requests,
  }));

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-bold text-sm mb-4">Daily Cost Trend (30 Days)</h3>
      <div className="h-64">
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
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontFamily: "Space Mono, monospace",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`$${value.toFixed(4)}`, "Cost"]}
            />
            <Line
              type="monotone"
              dataKey="cost"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#7c3aed" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
