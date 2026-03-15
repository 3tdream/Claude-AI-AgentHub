"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plug,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  Save,
  RefreshCw,
  Server,
  Cpu,
  MemoryStick,
  Clock,
  RotateCcw,
} from "lucide-react";

interface IntegrationField {
  key: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  configured: boolean;
  keyPreview: string;
  fields: IntegrationField[];
  docs: string;
  steps: string[];
}

interface PM2Status {
  managed: boolean;
  status: string;
  pid?: number;
  cpu?: number;
  memoryMB?: number;
  uptimeHuman?: string;
  restarts?: number;
  nodeEnv?: string;
  port?: number;
  message?: string;
}

type TestStatus = "idle" | "testing" | "success" | "error";

// --- Validation rules per field key ---
const VALIDATORS: Record<string, { pattern: RegExp; hint: string }> = {
  ANTHROPIC_API_KEY: { pattern: /^sk-ant-/, hint: "Must start with sk-ant-" },
  OPENAI_API_KEY: { pattern: /^sk-/, hint: "Must start with sk-" },
  JIRA_BASE_URL: { pattern: /^https:\/\/.+\.atlassian\.net/, hint: "Must be https://xxx.atlassian.net" },
  JIRA_EMAIL: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, hint: "Must be a valid email" },
  JIRA_API_TOKEN: { pattern: /^.{10,}$/, hint: "Must be at least 10 characters" },
  AGENT_HUB_API_URL: { pattern: /^https?:\/\//, hint: "Must be a valid URL" },
  AGENT_HUB_API_KEY: { pattern: /^.{10,}$/, hint: "Must be at least 10 characters" },
};

function validateField(key: string, value: string): { valid: boolean; hint?: string } {
  if (!value.trim()) return { valid: false };
  const rule = VALIDATORS[key];
  if (!rule) return { valid: true };
  return rule.pattern.test(value) ? { valid: true } : { valid: false, hint: rule.hint };
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { status: TestStatus; message?: string }>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [pm2, setPm2] = useState<PM2Status | null>(null);
  const [pm2Loading, setPm2Loading] = useState(true);
  const [restarting, setRestarting] = useState(false);

  const fetchPm2Status = useCallback(async () => {
    try {
      const res = await fetch("/api/system/pm2-status");
      const data = await res.json();
      setPm2(data);
    } catch {
      setPm2({ managed: false, status: "fetch-error", message: "Failed to fetch status" });
    } finally {
      setPm2Loading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrations();
    fetchPm2Status();
    // Poll PM2 status every 30s
    const interval = setInterval(fetchPm2Status, 30000);
    return () => clearInterval(interval);
  }, [fetchPm2Status]);

  async function fetchIntegrations() {
    try {
      const res = await fetch("/api/integrations");
      const data = await res.json();
      setIntegrations(data.integrations || []);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function testConnection(integrationId: string) {
    setTestResults((prev) => ({ ...prev, [integrationId]: { status: "testing" } }));

    // Pass form values directly to test (not saved yet)
    const formKeys: Record<string, string> = {};
    for (const [k, v] of Object.entries(fieldValues)) {
      if (v.trim()) formKeys[k] = v.trim();
    }

    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId, keys: formKeys }),
      });
      const data = await res.json();

      setTestResults((prev) => ({
        ...prev,
        [integrationId]: {
          status: data.success ? "success" : "error",
          message: data.message || data.error,
        },
      }));
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [integrationId]: { status: "error", message: "Network error" },
      }));
    }
  }

  async function saveAndActivate(integrationId: string, fields: IntegrationField[]) {
    const keys: Record<string, string> = {};
    for (const field of fields) {
      const val = fieldValues[field.key];
      if (val?.trim()) keys[field.key] = val.trim();
    }
    if (Object.keys(keys).length === 0) return;

    setSaving(integrationId);
    try {
      await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      // Clear form values for this integration's fields
      setFieldValues((prev) => {
        const next = { ...prev };
        for (const field of fields) delete next[field.key];
        return next;
      });
      await fetchIntegrations();
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  }

  async function handleRestart() {
    setRestarting(true);
    try {
      await fetch("/api/system/pm2-restart", { method: "POST" });
      // Wait a bit for restart to take effect
      setTimeout(() => {
        fetchPm2Status();
        setRestarting(false);
      }, 3000);
    } catch {
      setRestarting(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  const categories = [
    { key: "infra", label: "Infrastructure", description: "Process management and system health" },
    { key: "ai", label: "AI Providers", description: "LLM API keys for Smart Router and agent execution" },
    { key: "platform", label: "Platform", description: "Agent Hub backend connection" },
    { key: "project", label: "Project Management", description: "Issue tracking and pipeline sync" },
  ];

  const configuredCount = integrations.filter((i) => i.configured).length;
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    online: "text-emerald-400",
    stopped: "text-red-400",
    errored: "text-red-400",
    "not-managed": "text-amber-400",
    "pm2-unavailable": "text-muted-foreground",
  };

  const statusBg: Record<string, string> = {
    online: "bg-emerald-500/10 border-emerald-500/20",
    stopped: "bg-red-500/10 border-red-500/20",
    errored: "bg-red-500/10 border-red-500/20",
    "not-managed": "bg-amber-500/10 border-amber-500/20",
    "pm2-unavailable": "bg-muted border-border",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Integrations</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Step-by-step setup for all services
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
          <Plug className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-mono">
            <span className="text-emerald-400 font-bold">{configuredCount}</span>
            <span className="text-muted-foreground">/{integrations.length}</span>
          </span>
        </div>
      </div>

      {/* Setup progress */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-4 mb-3">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-sm">Setup Progress</h2>
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-3">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(configuredCount / integrations.length) * 100}%` }}
          />
        </div>
        <div className="flex gap-6">
          {integrations.map((i) => (
            <div key={i.id} className="flex items-center gap-1.5">
              {i.configured ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <XCircle className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <span className={`text-xs ${i.configured ? "text-foreground" : "text-muted-foreground"}`}>
                {i.name.split(" (")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PM2 System Status Card */}
      <div className="space-y-3">
        <div>
          <h2 className="font-bold text-lg">Infrastructure</h2>
          <p className="text-xs text-muted-foreground">Process management and system health</p>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                  statusBg[pm2?.status || "pm2-unavailable"] || statusBg["pm2-unavailable"]
                }`}>
                  <Server className={`w-5 h-5 ${statusColor[pm2?.status || "pm2-unavailable"] || ""}`} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">PM2 Process Manager</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Background process management for Mission Control
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {pm2Loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    statusBg[pm2?.status || "pm2-unavailable"] || ""
                  } ${statusColor[pm2?.status || "pm2-unavailable"] || ""}`}>
                    {pm2?.status || "unknown"}
                  </span>
                )}
              </div>
            </div>

            {/* Stats row */}
            {pm2?.managed && (
              <div className="mt-4 grid grid-cols-5 gap-3">
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                    <Cpu className="w-3 h-3" /> CPU
                  </div>
                  <p className="text-sm font-mono font-bold">{pm2.cpu ?? 0}%</p>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                    <MemoryStick className="w-3 h-3" /> RAM
                  </div>
                  <p className="text-sm font-mono font-bold">{pm2.memoryMB ?? 0} MB</p>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                    <Clock className="w-3 h-3" /> Uptime
                  </div>
                  <p className="text-sm font-mono font-bold">{pm2.uptimeHuman || "—"}</p>
                </div>
                <div className="bg-muted/50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1">
                    <RotateCcw className="w-3 h-3" /> Restarts
                  </div>
                  <p className="text-sm font-mono font-bold">{pm2.restarts ?? 0}</p>
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleRestart}
                    disabled={restarting}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-xs hover:border-primary/50 disabled:opacity-50 transition-colors"
                  >
                    {restarting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Restart
                  </button>
                </div>
              </div>
            )}

            {/* Not managed hint */}
            {pm2 && !pm2.managed && (
              <div className="mt-4 bg-muted/50 rounded-lg px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  Mission Control is running in terminal mode. To run in background:
                </p>
                <code className="block mt-2 text-xs font-mono text-primary bg-background rounded px-3 py-2 border border-border">
                  npm run pm2:dev
                </code>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration cards by category (AI, Platform, Project) */}
      {categories.filter((c) => c.key !== "infra").map((cat) => {
        const items = integrations.filter((i) => i.category === cat.key);
        if (items.length === 0) return null;

        return (
          <div key={cat.key} className="space-y-3">
            <div>
              <h2 className="font-bold text-lg">{cat.label}</h2>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
            </div>

            <div className="space-y-3">
              {items.map((integration) => {
                const isExpanded = expandedId === integration.id;
                const testResult = testResults[integration.id];

                return (
                  <div
                    key={integration.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Card header */}
                    <button
                      onClick={() => toggleExpand(integration.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                            integration.configured
                              ? "bg-emerald-500/10 border-emerald-500/20"
                              : "bg-muted border-border"
                          }`}
                        >
                          {integration.configured ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Plug className="w-5 h-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="text-left">
                          <h3 className="font-bold text-sm">{integration.name}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {integration.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {integration.configured && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {integration.keyPreview}
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            integration.configured
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {integration.configured ? "Connected" : "Setup Required"}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </button>

                    {/* Expanded setup panel */}
                    {isExpanded && (
                      <div className="border-t border-border px-5 py-5 space-y-5">
                        {/* Step-by-step guide */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                            Setup Steps
                          </h4>
                          <ol className="space-y-2">
                            {integration.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                  {idx + 1}
                                </span>
                                <span className="text-sm text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ol>
                          {integration.docs && (
                            <a
                              href={integration.docs}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Open docs
                            </a>
                          )}
                        </div>

                        {/* Input fields with validation */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Credentials
                          </h4>
                          {integration.fields.map((field) => {
                            const isPassword = field.type === "password";
                            const showPw = showPasswords[field.key];
                            const value = fieldValues[field.key] || "";
                            const validation = value ? validateField(field.key, value) : null;
                            return (
                              <div key={field.key} className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  {field.label}
                                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                                </label>
                                <div className="relative">
                                  <input
                                    type={isPassword && !showPw ? "password" : "text"}
                                    value={value}
                                    onChange={(e) => {
                                      setFieldValues((prev) => ({
                                        ...prev,
                                        [field.key]: e.target.value,
                                      }));
                                      // Reset test result when field changes
                                      setTestResults((prev) => {
                                        const next = { ...prev };
                                        delete next[integration.id];
                                        return next;
                                      });
                                    }}
                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                    className={`w-full bg-background border rounded-lg px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground focus:outline-none transition-colors pr-10 ${
                                      validation && !validation.valid
                                        ? "border-red-500/50 focus:border-red-500"
                                        : validation?.valid
                                        ? "border-emerald-500/50 focus:border-emerald-500"
                                        : "border-border focus:border-primary"
                                    }`}
                                  />
                                  {isPassword && (
                                    <button
                                      onClick={() =>
                                        setShowPasswords((prev) => ({
                                          ...prev,
                                          [field.key]: !prev[field.key],
                                        }))
                                      }
                                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      {showPw ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </button>
                                  )}
                                </div>
                                {validation && !validation.valid && validation.hint && (
                                  <p className="text-[10px] text-red-400 font-mono">{validation.hint}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Actions: Test → Save */}
                        {(() => {
                          const allFieldsFilled = integration.fields
                            .filter((f) => f.required)
                            .every((f) => fieldValues[f.key]?.trim());
                          const allFieldsValid = integration.fields
                            .filter((f) => f.required)
                            .every((f) => {
                              const val = fieldValues[f.key];
                              return val && validateField(f.key, val).valid;
                            });
                          const testPassed = testResult?.status === "success";
                          const isTesting = testResult?.status === "testing";
                          const isSaving = saving === integration.id;

                          return (
                            <div className="space-y-3 pt-3 border-t border-border">
                              {/* Test result message */}
                              {testResult?.status === "success" && (
                                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-xs text-emerald-400 font-medium">{testResult.message}</span>
                                </div>
                              )}
                              {testResult?.status === "error" && (
                                <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                                  <span className="text-xs text-red-400 font-medium">{testResult.message}</span>
                                </div>
                              )}

                              {/* Buttons row */}
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  onClick={() => testConnection(integration.id)}
                                  disabled={!allFieldsFilled || !allFieldsValid || isTesting}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:border-primary/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                  {isTesting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <RefreshCw className="w-4 h-4" />
                                  )}
                                  Test Connection
                                </button>
                                <button
                                  onClick={() => saveAndActivate(integration.id, integration.fields)}
                                  disabled={!testPassed || isSaving}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-mono text-xs uppercase tracking-wider"
                                >
                                  {isSaving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                  Save & Activate
                                </button>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Tip */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl px-5 py-4">
        <p className="text-xs text-muted-foreground">
          <span className="font-bold text-foreground">Tip:</span> Keys saved here are stored in{" "}
          <code className="bg-muted px-1 py-0.5 rounded text-[10px]">data/api-keys.json</code> (gitignored).
          Keys from <code className="bg-muted px-1 py-0.5 rounded text-[10px]">.env.local</code> take priority.
          For the Smart Router to work, you need at minimum the Anthropic key configured.
        </p>
      </div>
    </div>
  );
}
