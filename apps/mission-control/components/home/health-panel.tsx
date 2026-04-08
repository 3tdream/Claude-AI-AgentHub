"use client";

import { useState, useRef, useEffect } from "react";
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
  Info,
} from "lucide-react";
import { fetcher } from "./constants";

// ── Data-source map: subsystem → metric label → source description ──────────
const DATA_SOURCES: Record<string, Record<string, string>> = {
  agents: {
    "Active agents":    "GET /api/agents — live agent registry count",
    "Avg response":     "GET /api/agents — mean latency over last 5 min",
    "Error rate":       "GET /api/agents — failed tool calls / total calls",
    "Queue depth":      "GET /api/agents — pending tasks in agent queue",
    "Memory usage":     "GET /api/agents — RSS heap reported by each agent",
    "Uptime":           "GET /api/agents — time since last agent restart",
  },
  kb: {
    "Documents":        "GET /api/kb/stats — total indexed document count",
    "Index size":       "GET /api/kb/stats — vector store disk usage",
    "Query latency":    "GET /api/kb/stats — p95 retrieval time (last 100 queries)",
    "Cache hit rate":   "GET /api/kb/stats — embedding cache hits / total lookups",
    "Last indexed":     "GET /api/kb/stats — timestamp of most recent ingestion",
    "Chunks":           "GET /api/kb/stats — total vector chunks stored",
  },
  pipeline: {
    "Active runs":      "GET /api/pipelines — currently executing pipeline count",
    "Completed today":  "GET /api/pipelines — runs finished since midnight UTC",
    "Avg duration":     "GET /api/pipelines — mean wall-clock time per run",
    "Failure rate":     "GET /api/pipelines — failed / total runs (rolling 24 h)",
    "Queued":           "GET /api/pipelines — runs waiting for executor slot",
    "Tokens used":      "GET /api/pipelines — cumulative LLM tokens (today)",
  },
  dependencies: {
    "OpenAI":           "GET /api/system/health — latency probe to api.openai.com",
    "Anthropic":        "GET /api/system/health — latency probe to api.anthropic.com",
    "Supabase":         "GET /api/system/health — Supabase REST ping",
    "Redis":            "GET /api/system/health — Redis PING round-trip",
    "Response time":    "GET /api/system/health — avg external dependency RTT",
    "Availability":     "GET /api/system/health — uptime % over last 24 h",
  },
};

/** Fallback when a label isn't in the map */
function getDataSource(subsystemId: string, label: string): string {
  return DATA_SOURCES[subsystemId]?.[label]
    ?? `GET /api/system/health — subsystem: ${subsystemId}`;
}

// ── Tooltip component ────────────────────────────────────────────────────────
function MetricTooltip({ source }: { source: string }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [visible]);

  return (
    <div ref={ref} className="relative inline-flex items-center ml-0.5">
      <button
        type="button"
        aria-label="Data source"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        className="text-slate-300 hover:text-indigo-400 transition-colors focus:outline-none"
      >
        <Info className="w-2.5 h-2.5" />
      </button>
      {visible && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50
                     w-52 px-2.5 py-1.5 rounded-md shadow-lg
                     bg-slate-800 text-white text-[10px] leading-snug
                     pointer-events-none whitespace-normal"
        >
          <p className="font-semibold text-slate-300 mb-0.5">Data source</p>
          <p className="font-mono text-slate-100 break-all">{source}</p>
          {/* Arrow */}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}

type Status = "healthy" | "degraded" | "down";
type AlertSeverity = "critical" | "warning" | "info";

interface Metric { label: string; value: string; status: "ok" | "warn" | "error" }
interface Alert { id: string; severity: AlertSeverity; title: string; detail: string }
interface Subsystem { id: string; label: string; status: Status; score: number; alerts: Alert[]; metrics: Metric[] }
interface HealthReport { overall: Status; overallScore: number; subsystems: Subsystem[]; activeAlerts: number; criticalAlerts: number; checkedAt: string }

const statusColors: Record<Status, { text: string; bg: string; border: string; dot: string }> = {
  healthy: { text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  degraded: { text: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-500" },
  down: { text: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", dot: "bg-rose-500" },
};

const severityColors: Record<AlertSeverity, string> = {
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

const subsystemIcons: Record<string, typeof Bot> = {
  agents: Bot, kb: BookMarked, pipeline: GitBranch, dependencies: Plug,
};

export function HealthPanel() {
  const { data, error, isLoading, mutate } = useSWR<HealthReport>("/api/system/health", fetcher, { refreshInterval: 30000 });
  const [expandedSub, setExpandedSub] = useState<string | null>(null);

  const report = data;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartPulse className={`w-4 h-4 ${report ? statusColors[report.overall].text : "text-slate-400"}`} />
          <span className="text-sm font-semibold text-slate-900">System Health</span>
          {report && (
            <span className={`font-mono text-xs font-bold ${statusColors[report.overall].text}`}>
              {report.overallScore}/100
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {report && (
            <span className="font-mono text-[10px] text-slate-400">
              {report.activeAlerts} alerts · {report.criticalAlerts} critical
            </span>
          )}
          <button
            onClick={() => mutate()}
            disabled={isLoading}
            className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
            aria-label="Refresh health"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {!report && isLoading && (
          <div className="text-center py-8 text-slate-400 text-sm">Loading health data...</div>
        )}
        {error && !report && (
          <div className="text-center py-8">
            <div className="text-sm text-rose-500 mb-2">Failed to load health data</div>
            <button onClick={() => mutate()} className="text-xs text-indigo-600 hover:underline">Retry</button>
          </div>
        )}

        {/* Overall score bar */}
        {report && (
          <div className={`rounded-lg border p-3 ${statusColors[report.overall].bg} ${statusColors[report.overall].border}`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold ${statusColors[report.overall].text}`}>
                {report.overall.toUpperCase()}
              </span>
              <div className="flex items-center gap-3">
                {report.subsystems.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${statusColors[sub.status].dot}`} />
                    <span className="font-mono text-[9px] text-slate-500">{sub.id}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-1.5 bg-white/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  report.overallScore >= 70 ? "bg-emerald-500"
                    : report.overallScore >= 45 ? "bg-amber-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${report.overallScore}%` }}
              />
            </div>
          </div>
        )}

        {/* Subsystems */}
        {report?.subsystems.map((sub) => {
          const sc = statusColors[sub.status];
          const Icon = subsystemIcons[sub.id] || Plug;
          const isExpanded = expandedSub === sub.id;

          return (
            <div key={sub.id} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedSub(isExpanded ? null : sub.id)}
                className="w-full px-3 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                aria-label={`Toggle ${sub.label} details`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md border ${sc.bg} ${sc.border}`}>
                    <Icon className={`w-3.5 h-3.5 ${sc.text}`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-xs text-slate-800">{sub.label}</h3>
                    <p className={`font-mono text-[10px] ${sc.text}`}>{sub.score}/100</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {sub.alerts.length > 0 && (
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                      sub.alerts.some(a => a.severity === "critical") ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {sub.alerts.length}
                    </span>
                  )}
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                </div>
              </button>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-slate-100 pt-2">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {sub.metrics.map((m) => (
                      <div key={m.label} className="flex items-center justify-between px-2 py-1 rounded bg-slate-50">
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                          {m.label}
                          <MetricTooltip source={getDataSource(sub.id, m.label)} />
                        </span>
                        <span className={`font-mono text-[10px] font-medium ${
                          m.status === "ok" ? "text-emerald-600" : m.status === "warn" ? "text-amber-600" : "text-rose-600"
                        }`}>
                          {m.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Alerts */}
                  {sub.alerts.length > 0 && (
                    <div className="space-y-1">
                      {sub.alerts.slice(0, 5).map((alert) => (
                        <div key={alert.id} className={`flex items-start gap-1.5 px-2 py-1.5 rounded border text-[10px] ${severityColors[alert.severity]}`}>
                          {alert.severity === "critical" ? <XCircle className="w-3 h-3 shrink-0 mt-0.5" />
                            : alert.severity === "warning" ? <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
                            : <CheckCircle2 className="w-3 h-3 shrink-0 mt-0.5" />}
                          <div>
                            <p className="font-medium">{alert.title}</p>
                            <p className="opacity-70">{alert.detail}</p>
                          </div>
                        </div>
                      ))}
                      {sub.alerts.length > 5 && (
                        <p className="text-[10px] text-slate-400 text-center">+{sub.alerts.length - 5} more alerts</p>
                      )}
                    </div>
                  )}
                  {sub.alerts.length === 0 && (
                    <p className="text-[10px] text-slate-400 text-center py-1">No alerts</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
