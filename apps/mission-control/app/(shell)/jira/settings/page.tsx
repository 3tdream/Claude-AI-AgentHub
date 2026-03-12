"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle2,
  XCircle,
  Plug,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

interface ConfigStatus {
  configured: boolean;
  baseUrl?: string;
  email?: string;
  defaultProjectKey?: string;
}

interface TestResult {
  success: boolean;
  user?: { displayName: string; emailAddress: string };
  error?: string;
}

export default function JiraSettingsPage() {
  const [baseUrl, setBaseUrl] = useState("");
  const [email, setEmail] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [defaultProjectKey, setDefaultProjectKey] = useState("");
  const [showToken, setShowToken] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [configured, setConfigured] = useState(false);

  // Load existing config
  useEffect(() => {
    fetch("/api/jira/config")
      .then((r) => r.json())
      .then((data: ConfigStatus) => {
        if (data.configured) {
          setBaseUrl(data.baseUrl ?? "");
          setEmail(data.email ?? "");
          setDefaultProjectKey(data.defaultProjectKey ?? "");
          setConfigured(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/jira/config/test");
      const data: TestResult = await res.json();
      setTestResult(data);
    } catch {
      setTestResult({ success: false, error: "Network error" });
    } finally {
      setTesting(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!baseUrl.trim() || !email.trim() || !apiToken.trim()) return;

    setSaving(true);
    try {
      const res = await fetch("/api/jira/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          baseUrl: baseUrl.trim(),
          email: email.trim(),
          apiToken: apiToken.trim(),
          defaultProjectKey: defaultProjectKey.trim(),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setConfigured(true);
      setTestResult(null);
      toast.success("Jira configuration saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/jira"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Jira Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your Jira Cloud connection
          </p>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {configured ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <XCircle className="w-3.5 h-3.5" />
            Not configured
          </span>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Jira Base URL
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-domain.atlassian.net"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your Jira Cloud instance URL
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              The email associated with your Atlassian account
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              API Token
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder={configured ? "••••••••  (enter new token to update)" : "Paste your API token"}
                className="w-full bg-background border border-border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                required={!configured}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Generate at{" "}
              <a
                href="https://id.atlassian.net/manage-profile/security/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                id.atlassian.net/manage-profile/security/api-tokens
              </a>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Default Project Key
            </label>
            <input
              type="text"
              value={defaultProjectKey}
              onChange={(e) => setDefaultProjectKey(e.target.value.toUpperCase())}
              placeholder="PROJ"
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Used by the PM Agent hook for auto-created issues
            </p>
          </div>
        </div>

        {/* Test Connection */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Test Connection</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify your credentials before saving
              </p>
            </div>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testing}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted transition-colors disabled:opacity-50"
            >
              {testing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plug className="w-4 h-4" />
              )}
              Test
            </button>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                testResult.success
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {testResult.success ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Connected as{" "}
                    <strong>{testResult.user?.displayName}</strong>{" "}
                    ({testResult.user?.emailAddress})
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{testResult.error}</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || !baseUrl.trim() || !email.trim() || (!apiToken.trim() && !configured)}
            className="flex items-center gap-2 px-6 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
