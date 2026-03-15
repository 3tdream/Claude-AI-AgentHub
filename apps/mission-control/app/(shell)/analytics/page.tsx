"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Activity,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Brain,
  Shield,
} from "lucide-react";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import type { PipelineExecution, QualityScore } from "@/types";
import { CRM_PIPELINE_STAGES } from "@/lib/pipeline-templates";

// --- Helpers ---

function avgScore(scores: QualityScore[]): number {
  if (scores.length === 0) return 0;
  return +(scores.reduce((s, q) => s + q.overall, 0) / scores.length).toFixed(1);
}

function formatDuration(ms: number): string {
  if (ms < 60_000) return `${(ms / 1000).toFixed(0)}s`;
  if (ms < 3_600_000) return `${(ms / 60_000).toFixed(1)}m`;
  return `${(ms / 3_600_000).toFixed(1)}h`;
}

const STAGE_COLORS: Record<string, string> = {
  "Research-Agent": "#7c3aed",
  "Orchestrator": "#6366f1",
  "PM-Agent": "#3b82f6",
  "Architect-Agent": "#0ea5e9",
  "Cyber-Agent": "#ef4444",
  "Backend-Agent": "#f59e0b",
  "Frontend-Agent": "#10b981",
  "Designer-Agent": "#ec4899",
  "QA-Agent": "#f97316",
  "DevOps-Agent": "#8b5cf6",
  "Human Checkpoint": "#eab308",
};

function getColor(name: string) {
  return STAGE_COLORS[name] || "#6b7280";
}

const tooltipStyle = {
  background: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "8px",
  fontFamily: "Space Mono, monospace",
  fontSize: "12px",
};

// --- Data derivation ---

function deriveAnalytics(executions: PipelineExecution[]) {
  const completed = executions.filter((e) => e.status === "completed");
  const failed = executions.filter((e) => e.status === "failed");
  const total = executions.length;
  const successRate = total > 0 ? +((completed.length / total) * 100).toFixed(0) : 0;

  // Average duration
  const durations = completed.filter((e) => e.totalDuration).map((e) => e.totalDuration!);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

  // Quality trend per stage (across all executions)
  const stageQuality: Record<string, { scores: number[]; name: string }> = {};
  for (const exec of executions) {
    if (!exec.qualityScores) continue;
    for (const [stepId, score] of Object.entries(exec.qualityScores)) {
      const step = CRM_PIPELINE_STAGES.find((s) => s.id === stepId);
      const name = step?.agentName || stepId;
      if (!stageQuality[name]) stageQuality[name] = { scores: [], name };
      stageQuality[name].scores.push(score.overall);
    }
  }
  const qualityByStage = Object.values(stageQuality).map((sq) => ({
    name: sq.name.replace("-Agent", "").replace("-agent", ""),
    avg: avgScore(sq.scores.map((o) => ({ completeness: 0, specificity: 0, actionability: 0, overall: o }))),
    min: Math.min(...sq.scores),
    max: Math.max(...sq.scores),
    count: sq.scores.length,
  }));

  // Retry distribution by agent
  const retryByAgent: Record<string, { retries: number; total: number }> = {};
  for (const exec of executions) {
    for (const [stepId, result] of Object.entries(exec.stepResults)) {
      const step = CRM_PIPELINE_STAGES.find((s) => s.id === stepId);
      const name = step?.agentName || stepId;
      if (!retryByAgent[name]) retryByAgent[name] = { retries: 0, total: 0 };
      retryByAgent[name].total++;
      if (result.retryCount && result.retryCount > 0) {
        retryByAgent[name].retries += result.retryCount;
      }
    }
  }
  const retryData = Object.entries(retryByAgent)
    .map(([name, d]) => ({
      name: name.replace("-Agent", "").replace("-agent", ""),
      retries: d.retries,
      runs: d.total,
      rate: d.total > 0 ? +((d.retries / d.total) * 100).toFixed(0) : 0,
    }))
    .filter((d) => d.runs > 0)
    .sort((a, b) => b.retries - a.retries);

  // Status distribution (pie)
  const statusDist = [
    { name: "Completed", value: completed.length, color: "#10b981" },
    { name: "Failed", value: failed.length, color: "#ef4444" },
    { name: "Paused", value: executions.filter((e) => e.status === "paused").length, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  // Escalation count
  const escalationCount = executions.reduce(
    (sum, e) => sum + (e.escalatedSteps?.length || 0),
    0,
  );

  // Timeline (chronological, last 20)
  const timeline = executions
    .slice(0, 20)
    .map((e, i) => ({
      run: `#${executions.length - i}`,
      duration: e.totalDuration ? +(e.totalDuration / 60_000).toFixed(1) : 0,
      stages: Object.keys(e.stepResults).length,
      quality: e.qualityScores
        ? avgScore(Object.values(e.qualityScores))
        : 0,
      status: e.status,
    }))
    .reverse();

  return {
    total,
    completed: completed.length,
    failed: failed.length,
    successRate,
    avgDuration,
    escalationCount,
    qualityByStage,
    retryData,
    statusDist,
    timeline,
  };
}

// --- Components ---

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-primary",
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono">{label}</p>
        <p className="text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { executionHistory } = useOrchestrationStore();

  const data = useMemo(() => deriveAnalytics(executionHistory), [executionHistory]);

  const hasData = executionHistory.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pipeline performance, quality trends, and system health
        </p>
      </div>

      {!hasData ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center">
          <Activity className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <h3 className="font-semibold text-lg">No pipeline data yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Run a pipeline from the Orchestration page to see analytics here.
          </p>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Activity}
              label="Total Runs"
              value={data.total}
              sub={`${data.completed} completed`}
            />
            <StatCard
              icon={CheckCircle2}
              label="Success Rate"
              value={`${data.successRate}%`}
              sub={`${data.failed} failed`}
              color="text-emerald-500"
            />
            <StatCard
              icon={Clock}
              label="Avg Duration"
              value={data.avgDuration > 0 ? formatDuration(data.avgDuration) : "—"}
              sub="per pipeline"
            />
            <StatCard
              icon={AlertTriangle}
              label="Escalations"
              value={data.escalationCount}
              sub="user interventions"
              color="text-amber-500"
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality by Stage */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Average Quality Score by Stage</h3>
              </div>
              {data.qualityByStage.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.qualityByStage} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        domain={[0, 10]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => [v, "Avg Score"]} />
                      <Bar dataKey="avg" radius={[0, 4, 4, 0]}>
                        {data.qualityByStage.map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.avg >= 8 ? "#10b981" : entry.avg >= 6 ? "#f59e0b" : "#ef4444"}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No quality data yet</p>
              )}
            </div>

            {/* Retry Distribution */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <RotateCcw className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-sm">Retry Distribution by Agent</h3>
              </div>
              {data.retryData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.retryData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        type="number"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={90}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={tooltipStyle}
                        formatter={(v: number, name: string) => [v, name === "retries" ? "Retries" : "Runs"]}
                      />
                      <Bar dataKey="retries" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No retries recorded</p>
              )}
            </div>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pipeline Timeline */}
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Pipeline Run Timeline</h3>
              </div>
              {data.timeline.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.timeline}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="run"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="quality"
                        domain={[0, 10]}
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                        orientation="left"
                        label={{ value: "Quality", angle: -90, position: "insideLeft", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
                      />
                      <YAxis
                        yAxisId="duration"
                        tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10, fontFamily: "Space Mono, monospace" }}
                        axisLine={{ stroke: "hsl(var(--border))" }}
                        tickLine={false}
                        orientation="right"
                        label={{ value: "Min", angle: 90, position: "insideRight", style: { fontSize: 10, fill: "hsl(var(--muted-foreground))" } }}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Line
                        yAxisId="quality"
                        type="monotone"
                        dataKey="quality"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#7c3aed" }}
                        name="Avg Quality"
                      />
                      <Line
                        yAxisId="duration"
                        type="monotone"
                        dataKey="duration"
                        stroke="#06b6d4"
                        strokeWidth={2}
                        dot={{ r: 3, fill: "#06b6d4" }}
                        name="Duration (min)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No timeline data</p>
              )}
            </div>

            {/* Status Distribution */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm">Status Distribution</h3>
              </div>
              {data.statusDist.length > 0 ? (
                <div className="h-64 flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="80%">
                    <PieChart>
                      <Pie
                        data={data.statusDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="value"
                        paddingAngle={3}
                        strokeWidth={0}
                      >
                        {data.statusDist.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 text-xs">
                    {data.statusDist.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="font-mono font-bold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-12">No data</p>
              )}
            </div>
          </div>

          {/* Execution History Table */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="font-bold text-sm mb-4">Recent Executions</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs text-muted-foreground uppercase tracking-wider">
                    <th className="pb-3 pr-4 font-medium">Pipeline</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">Duration</th>
                    <th className="pb-3 pr-4 font-medium">Stages</th>
                    <th className="pb-3 pr-4 font-medium">Avg Quality</th>
                    <th className="pb-3 font-medium">Jira</th>
                  </tr>
                </thead>
                <tbody>
                  {executionHistory.slice(0, 15).map((exec) => {
                    const scores = exec.qualityScores ? Object.values(exec.qualityScores) : [];
                    const avg = avgScore(scores);
                    const stageCount = Object.keys(exec.stepResults).length;
                    const completedStages = Object.values(exec.stepResults).filter(
                      (r) => r.status === "completed",
                    ).length;

                    return (
                      <tr key={exec.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4">
                          <span className="font-medium">{exec.workflowName}</span>
                          <br />
                          <span className="text-xs text-muted-foreground font-mono">
                            {new Date(exec.startedAt).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              exec.status === "completed"
                                ? "bg-emerald-500/10 text-emerald-500"
                                : exec.status === "failed"
                                  ? "bg-red-500/10 text-red-500"
                                  : exec.status === "paused"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : "bg-blue-500/10 text-blue-500"
                            }`}
                          >
                            {exec.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">
                          {exec.totalDuration ? formatDuration(exec.totalDuration) : "—"}
                        </td>
                        <td className="py-3 pr-4 font-mono text-xs">
                          {completedStages}/{stageCount}
                        </td>
                        <td className="py-3 pr-4">
                          {avg > 0 ? (
                            <span
                              className={`font-mono text-xs font-bold ${
                                avg >= 8 ? "text-emerald-500" : avg >= 6 ? "text-amber-500" : "text-red-500"
                              }`}
                            >
                              {avg}/10
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3">
                          {exec.jiraKey ? (
                            <a
                              href={exec.jiraUrl || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary hover:underline font-mono"
                            >
                              {exec.jiraKey}
                            </a>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
