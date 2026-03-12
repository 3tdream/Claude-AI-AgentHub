"use client";

import { useState, useEffect } from "react";
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

type TestStatus = "idle" | "testing" | "success" | "error";

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<Record<string, { status: TestStatus; message?: string }>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchIntegrations();
  }, []);

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

    try {
      const res = await fetch("/api/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId }),
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

  async function saveKeys() {
    // Only save non-empty values
    const keys: Record<string, string> = {};
    for (const [k, v] of Object.entries(fieldValues)) {
      if (v.trim()) keys[k] = v.trim();
    }

    if (Object.keys(keys).length === 0) return;

    setSaving(true);
    try {
      await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys }),
      });
      setFieldValues({});
      await fetchIntegrations();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(expandedId === id ? null : id);
  }

  const categories = [
    { key: "ai", label: "AI Providers", description: "LLM API keys for Smart Router and agent execution" },
    { key: "platform", label: "Platform", description: "Agent Hub backend connection" },
    { key: "project", label: "Project Management", description: "Issue tracking and pipeline sync" },
  ];

  const configuredCount = integrations.filter((i) => i.configured).length;
  const hasUnsavedChanges = Object.values(fieldValues).some((v) => v.trim());

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border">
            <Plug className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-mono">
              <span className="text-emerald-400 font-bold">{configuredCount}</span>
              <span className="text-muted-foreground">/{integrations.length}</span>
            </span>
          </div>
          {hasUnsavedChanges && (
            <button
              onClick={saveKeys}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all font-mono text-xs uppercase tracking-wider"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Keys
            </button>
          )}
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

      {/* Integration cards by category */}
      {categories.map((cat) => {
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

                        {/* Input fields */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Credentials
                          </h4>
                          {integration.fields.map((field) => {
                            const isPassword = field.type === "password";
                            const showPw = showPasswords[field.key];
                            return (
                              <div key={field.key} className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                  {field.label}
                                  {field.required && <span className="text-destructive ml-0.5">*</span>}
                                </label>
                                <div className="relative">
                                  <input
                                    type={isPassword && !showPw ? "password" : "text"}
                                    value={fieldValues[field.key] || ""}
                                    onChange={(e) =>
                                      setFieldValues((prev) => ({
                                        ...prev,
                                        [field.key]: e.target.value,
                                      }))
                                    }
                                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                                    className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm font-mono placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors pr-10"
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
                              </div>
                            );
                          })}
                        </div>

                        {/* Test connection */}
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div>
                            {testResult?.status === "success" && (
                              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {testResult.message}
                              </span>
                            )}
                            {testResult?.status === "error" && (
                              <span className="flex items-center gap-1.5 text-xs text-red-400">
                                <XCircle className="w-3.5 h-3.5" />
                                {testResult.message}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => testConnection(integration.id)}
                            disabled={testResult?.status === "testing"}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:border-primary/50 disabled:opacity-50 transition-colors"
                          >
                            {testResult?.status === "testing" ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                            Test Connection
                          </button>
                        </div>
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
