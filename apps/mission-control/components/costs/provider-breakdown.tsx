"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { ProviderCost } from "@/types";

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "#f97316",
  openai: "#10b981",
  google: "#3b82f6",
  openrouter: "#a855f7",
};

interface ProviderBreakdownProps {
  data: Record<string, ProviderCost>;
}

export function ProviderBreakdown({ data }: ProviderBreakdownProps) {
  const chartData = Object.entries(data)
    .filter(([, v]) => v.cost > 0)
    .map(([provider, values]) => ({
      name: provider.charAt(0).toUpperCase() + provider.slice(1),
      value: Number(values.cost.toFixed(4)),
      requests: values.requests,
      color: PROVIDER_COLORS[provider] || "#64748b",
    }));

  if (chartData.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-bold text-sm mb-4">Cost by Provider</h3>
        <p className="font-mono text-xs text-muted-foreground text-center py-8">No provider data</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      <h3 className="font-bold text-sm mb-4">Cost by Provider</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
            >
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
              ))}
            </Pie>
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
            <Legend
              wrapperStyle={{
                fontFamily: "Space Mono, monospace",
                fontSize: "11px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
