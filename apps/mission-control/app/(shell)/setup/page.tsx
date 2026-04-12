"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw, ExternalLink } from "lucide-react";

interface Check {
  id: string;
  label: string;
  status: "pending" | "checking" | "pass" | "fail";
  detail?: string;
}

const INITIAL_CHECKS: Check[] = [
  { id: "health", label: "System health", status: "pending" },
  { id: "data", label: "Data directory writable", status: "pending" },
  { id: "anthropic", label: "Anthropic API key", status: "pending" },
  { id: "openai", label: "OpenAI API key", status: "pending" },
  { id: "jira", label: "Jira connection", status: "pending" },
];

export default function SetupPage() {
  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const updateCheck = useCallback(
    (id: string, update: Partial<Check>) =>
      setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...update } : c))),
    [],
  );

  const runChecks = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setChecks(INITIAL_CHECKS.map((c) => ({ ...c, status: "checking" })));

    // 1. Health endpoint
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      updateCheck("health", {
        status: data.status === "healthy" ? "pass" : "fail",
        detail: `Status: ${data.status}, uptime: ${Math.round(data.uptime)}s`,
      });
      updateCheck("data", {
        status: data.checks?.dataDir ? "pass" : "fail",
        detail: data.checks?.dataDir ? "Writable" : "Cannot write to data/",
      });
      updateCheck("anthropic", {
        status: data.checks?.anthropicKey ? "pass" : "fail",
        detail: data.checks?.anthropicKey ? "Configured" : "Missing ANTHROPIC_API_KEY",
      });
      updateCheck("openai", {
        status: data.checks?.openaiKey ? "pass" : "fail",
        detail: data.checks?.openaiKey ? "Configured" : "Missing OPENAI_API_KEY (optional)",
      });
    } catch {
      updateCheck("health", { status: "fail", detail: "Cannot reach /api/health" });
      updateCheck("data", { status: "fail", detail: "Health check failed" });
      updateCheck("anthropic", { status: "fail", detail: "Health check failed" });
      updateCheck("openai", { status: "fail", detail: "Health check failed" });
    }

    // 2. Jira
    try {
      const res = await fetch("/api/jira/settings");
      if (res.ok) {
        const data = await res.json();
        updateCheck("jira", {
          status: data.baseUrl ? "pass" : "fail",
          detail: data.baseUrl ? `Connected: ${data.baseUrl}` : "Not configured",
        });
      } else {
        updateCheck("jira", { status: "fail", detail: "Jira settings endpoint error" });
      }
    } catch {
      updateCheck("jira", { status: "fail", detail: "No Jira integration (optional)" });
    }

    setRunning(false);
    setDone(true);
  }, [updateCheck]);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  const passCount = checks.filter((c) => c.status === "pass").length;
  const failCount = checks.filter((c) => c.status === "fail").length;
  const allPass = passCount === checks.length;
  const criticalFail = checks.some((c) => c.id === "health" && c.status === "fail");

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Setup</h1>
        <p className="text-stone-500 mt-1">
          System readiness check — verify environment and connections.
        </p>
      </div>

      {/* Checks */}
      <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden">
        {checks.map((check, i) => (
          <div
            key={check.id}
            className={`flex items-center gap-3 px-5 py-4 ${
              i < checks.length - 1 ? "border-b border-stone-200 dark:border-stone-800" : ""
            }`}
          >
            <StatusIcon status={check.status} />
            <div className="flex-1">
              <p className="font-medium text-sm">{check.label}</p>
              {check.detail && (
                <p className="text-xs text-stone-500 mt-0.5">{check.detail}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {done && (
        <div
          className={`rounded-xl p-5 ${
            allPass
              ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800"
              : criticalFail
                ? "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          }`}
        >
          <p className="font-semibold text-sm">
            {allPass
              ? "All checks passed — Mission Control is ready."
              : criticalFail
                ? "Critical: system health check failed."
                : `${passCount}/${checks.length} checks passed. ${failCount} need attention.`}
          </p>
          {!allPass && (
            <p className="text-xs mt-2 text-stone-600 dark:text-stone-400">
              Run <code className="bg-stone-200 dark:bg-stone-700 px-1 rounded">bash scripts/setup-env.sh</code> to
              configure missing keys, then re-check.
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={runChecks}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-stone-300 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${running ? "animate-spin" : ""}`} />
          Re-check
        </button>
        {allPass && (
          <a
            href="/home"
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </a>
        )}
        <a
          href="https://github.com/your-org/mission-control#quick-start"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 text-sm text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
        >
          Docs
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: Check["status"] }) {
  switch (status) {
    case "pass":
      return <CheckCircle className="w-5 h-5 text-emerald-500" />;
    case "fail":
      return <XCircle className="w-5 h-5 text-red-500" />;
    case "checking":
      return <Loader2 className="w-5 h-5 text-stone-400 animate-spin" />;
    default:
      return <div className="w-5 h-5 rounded-full border-2 border-stone-300" />;
  }
}
