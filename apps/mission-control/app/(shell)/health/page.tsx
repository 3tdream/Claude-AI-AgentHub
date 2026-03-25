"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  HeartPulse,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Bot,
  BookMarked,
  GitBranch,
  Plug,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Status = "healthy" | "degraded" | "down";
type AlertSeverity = "critical" | "warning" | "info";

interface Metric { label: string; value: string; status: "ok" | "warn" | "error" }
interface Alert { id: string; severity: AlertSeverity; title: string; detail: string; metric?: { name: string; value: number; threshold: number } }
interface Subsystem { id: string; label: string; status: Status; score: number; alerts: Alert[]; metrics: Metric[]; lastChecked: string }
interface HealthReport { overall: Status; overallScore: number; subsystems: Subsystem[]; activeAlerts: number; criticalAlerts: number; checkedAt: string }

const statusColors: Record<Status, { text: string; bg: string; dot: string }> = {
  healthy: { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", dot: "bg-emerald-500" },
  degraded: { text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", dot: "bg-amber-500" },
  down: { text: "text-red-400", bg: "bg-red-500/10 border-red-500/20", dot: "bg-red-500" },
};

const severityColors: Record<AlertSeverity, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

const subsystemIcons: Record<string, typeof Bot> = {
  agents: Bot, kb: BookMarked, pipeline: GitBranch, dependencies: Plug,
};

export default function HealthPage() {
  const { data, isLoading, mutate } = useSWR<HealthReport>("/api/system/health", fetcher, { refreshInterval: 30000 });
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const report = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">System Health</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            {report ? `${report.activeAlerts} alerts · ${report.criticalAlerts} critical · checked ${new Date(report.checkedAt).toLocaleTimeString()}` : "Loading..."}
          </p>
        </div>
        <button
          onClick={() => mutate()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Overall status */}
      {report && (
        <div className={`rounded-xl border p-6 ${statusColors[report.overall].bg}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <HeartPulse className={`w-10 h-10 ${statusColors[report.overall].text}`} />
                <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full ${statusColors[report.overall].dot} ${report.overall === "healthy" ? "animate-pulse" : ""}`} />
              </div>
              <div>
                <h2 className={`text-2xl font-extrabold ${statusColors[report.overall].text}`}>
                  {report.overall.toUpperCase()}
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Overall score: {report.overallScore}/100
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              {report.subsystems.map((sub) => {
                const sc = statusColors[sub.status];
                return (
                  <div key={sub.id} className="text-center">
                    <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${sc.dot}`} />
                    <span className="font-mono text-[9px] text-muted-foreground">{sub.id}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Score bar */}
          <div className="mt-4 h-2 bg-black/20 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                report.overallScore >= 70 ? "bg-emerald-500"
                  : report.overallScore >= 45 ? "bg-amber-500"
                  : "bg-red-500"
              }`}
              style={{ width: `${report.overallScore}%` }}
            />
          </div>
        </div>
      )}

      {/* Subsystems */}
      {report && (
        <div className="grid grid-cols-2 gap-4">
          {report.subsystems.map((sub) => {
            const sc = statusColors[sub.status];
            const Icon = subsystemIcons[sub.id] || Plug;
            const isExpanded = expandedSub === sub.id;

            return (
              <div key={sub.id} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg border ${sc.bg}`}>
                      <Icon className={`w-5 h-5 ${sc.text}`} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-sm">{sub.label}</h3>
                      <p className={`font-mono text-[10px] ${sc.text}`}>{sub.status} · {sub.score}/100</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {sub.alerts.length > 0 && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {sub.alerts.length} alert{sub.alerts.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3 border-t border-border pt-3">
                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2">
                      {sub.metrics.map((m) => (
                        <div key={m.label} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-muted/30">
                          <span className="text-[10px] text-muted-foreground">{m.label}</span>
                          <span className={`font-mono text-[10px] font-medium ${
                            m.status === "ok" ? "text-emerald-400" : m.status === "warn" ? "text-amber-400" : "text-red-400"
                          }`}>
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Alerts */}
                    {sub.alerts.length > 0 && (
                      <div className="space-y-1.5">
                        {sub.alerts.map((alert) => (
                          <div key={alert.id} className={`flex items-start gap-2 px-3 py-2 rounded-lg border ${severityColors[alert.severity]}`}>
                            {alert.severity === "critical" ? <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              : alert.severity === "warning" ? <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                              : <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />}
                            <div>
                              <p className="text-[11px] font-medium">{alert.title}</p>
                              <p className="text-[10px] opacity-70">{alert.detail}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    {sub.alerts.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center py-2">No alerts</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
