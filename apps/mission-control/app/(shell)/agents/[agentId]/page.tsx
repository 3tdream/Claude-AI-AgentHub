"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  History,
  Settings,
  FileText,
  MessageSquare,
  Loader2,
  Trash2,
  Clock,
} from "lucide-react";
import { useAgent, useAgentPrompt, usePromptHistory, updateAgent, updateAgentPrompt, deleteAgent } from "@/lib/hooks/use-agents";
import { useSessions } from "@/lib/hooks/use-sessions";
import { useModels } from "@/lib/hooks/use-models";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { LLMProvider, UpdateAgentParams, Session } from "@/types";
import Link from "next/link";

const providerColors: Record<LLMProvider, string> = {
  anthropic: "border-orange-500/30 text-orange-400 bg-orange-500/5",
  openai: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  google: "border-blue-500/30 text-blue-400 bg-blue-500/5",
  openrouter: "border-purple-500/30 text-purple-400 bg-purple-500/5",
};

const agentIcons: Record<string, string> = {
  orchestrator: "\u{1F9E0}", "pm-agent": "\u{1F4CB}", "architect-agent": "\u{1F3D7}\uFE0F",
  "backend-agent": "\u2699\uFE0F", "frontend-agent": "\u{1F5A5}\uFE0F", "designer-agent": "\u{1F3A8}",
  "qa-agent": "\u{1F50D}", "devops-agent": "\u{1F680}", "cyber-agent": "\u{1F6E1}\uFE0F",
  "research-agent": "\u{1F52C}", "michael-personal-bot": "\u{1F4AC}",
  "email & calendar manager": "\u{1F4E7}", "tech-support-agent": "\u{1F527}",
  assistant: "\u{1F916}", "herald-avatar-prompter": "\u{1F5BC}\uFE0F", "herald-profile-generator": "\u{1F4DD}",
};

type TabId = "config" | "prompt" | "sessions";

const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "config", label: "Config", icon: Settings },
  { id: "prompt", label: "Prompt", icon: FileText },
  { id: "sessions", label: "Sessions", icon: MessageSquare },
];

export default function AgentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.agentId as string;

  const { agent, isLoading, mutate: mutateAgent } = useAgent(agentId);
  const { prompt, isLoading: promptLoading, mutate: mutatePrompt } = useAgentPrompt(agentId);
  const { history } = usePromptHistory(agentId);
  const { sessions, isLoading: sessionsLoading } = useSessions(agentId);
  const { models } = useModels();

  const [activeTab, setActiveTab] = useState<TabId>("config");
  const [saving, setSaving] = useState(false);

  // Config form state
  const [editName, setEditName] = useState<string | null>(null);
  const [editDesc, setEditDesc] = useState<string | null>(null);
  const [editModel, setEditModel] = useState<string | null>(null);
  const [editMaxTokens, setEditMaxTokens] = useState<string | null>(null);
  const [editMaxOutputTokens, setEditMaxOutputTokens] = useState<string | null>(null);
  const [editMaxToolSteps, setEditMaxToolSteps] = useState<string | null>(null);

  // Prompt editor state
  const [editPrompt, setEditPrompt] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-muted-foreground">
        <p className="font-mono text-sm">Agent not found</p>
        <Link href="/agents" className="mt-4 text-primary text-sm hover:underline">
          Back to agents
        </Link>
      </div>
    );
  }

  const icon = agentIcons[agent.name.toLowerCase()] || "\u{1F916}";
  const provider = agent.llmProvider || "anthropic";

  // Group models by provider
  const modelsList = Array.isArray(models) ? models : [];
  const modelsByProvider = modelsList.reduce<Record<string, typeof modelsList>>((acc, m) => {
    const p = m.provider || "other";
    if (!acc[p]) acc[p] = [];
    acc[p].push(m);
    return acc;
  }, {});

  async function handleSaveConfig() {
    setSaving(true);
    try {
      const params: UpdateAgentParams = {};
      if (editName !== null) params.name = editName;
      if (editDesc !== null) params.description = editDesc;
      if (editModel !== null) params.llmModel = editModel;
      if (editMaxTokens !== null) params.maxTokens = parseInt(editMaxTokens);
      if (editMaxOutputTokens !== null) params.maxOutputTokens = parseInt(editMaxOutputTokens);
      if (editMaxToolSteps !== null) params.maxToolSteps = parseInt(editMaxToolSteps);

      if (Object.keys(params).length === 0) {
        toast.info("No changes to save");
        return;
      }

      const result = await updateAgent(agentId, params);
      if (result.error) throw new Error(result.error);

      await mutateAgent();
      // Reset edit state
      setEditName(null);
      setEditDesc(null);
      setEditModel(null);
      setEditMaxTokens(null);
      setEditMaxOutputTokens(null);
      setEditMaxToolSteps(null);
      toast.success("Agent updated");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update agent");
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePrompt() {
    setSaving(true);
    try {
      const p = editPrompt ?? prompt;
      const result = await updateAgentPrompt(agentId, p);
      if (result.error) throw new Error(result.error);

      await mutatePrompt();
      setEditPrompt(null);
      toast.success("Prompt saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save prompt");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!agent) return;
    if (!confirm(`Delete agent "${agent.name}"? This cannot be undone.`)) return;
    try {
      await deleteAgent(agentId);
      toast.success("Agent deleted");
      router.push("/agents");
    } catch {
      toast.error("Failed to delete agent");
    }
  }

  const hasConfigChanges = editName !== null || editDesc !== null || editModel !== null ||
    editMaxTokens !== null || editMaxOutputTokens !== null || editMaxToolSteps !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/agents"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
          {icon}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-extrabold tracking-tight">{agent.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-xs text-muted-foreground">{agent.llmModel}</span>
            <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${providerColors[provider]}`}>
              {provider}
            </span>
          </div>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
          title="Delete agent"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border pb-px">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "config" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Name</label>
              <input
                type="text"
                value={editName ?? agent.name}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={editDesc ?? (agent.description || "")}
                onChange={(e) => setEditDesc(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Model Selector */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">LLM Model</label>
              <select
                value={editModel ?? agent.llmModel}
                onChange={(e) => setEditModel(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
              >
                {modelsList.length > 0 ? (
                  Object.entries(modelsByProvider).map(([prov, mods]) => (
                    <optgroup key={prov} label={prov.charAt(0).toUpperCase() + prov.slice(1)}>
                      {mods.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name || m.id}
                          {m.costPer1kInput ? ` ($${m.costPer1kInput}/1k)` : ""}
                        </option>
                      ))}
                    </optgroup>
                  ))
                ) : (
                  <option value={agent.llmModel}>{agent.llmModel}</option>
                )}
              </select>
            </div>

            {/* Max Tokens */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Max Tokens</label>
              <input
                type="number"
                value={editMaxTokens ?? agent.maxTokens}
                onChange={(e) => setEditMaxTokens(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Max Output Tokens */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Max Output Tokens</label>
              <input
                type="number"
                value={editMaxOutputTokens ?? (agent.maxOutputTokens || "")}
                onChange={(e) => setEditMaxOutputTokens(e.target.value)}
                placeholder="Not set"
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            {/* Max Tool Steps */}
            <div className="space-y-2">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Max Tool Steps</label>
              <input
                type="number"
                value={editMaxToolSteps ?? agent.maxToolSteps}
                onChange={(e) => setEditMaxToolSteps(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors"
              />
            </div>
          </div>

          {hasConfigChanges && (
            <div className="flex justify-end">
              <button
                onClick={handleSaveConfig}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all font-mono text-xs uppercase tracking-wider"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "prompt" && (
        <div className="space-y-6">
          {/* Prompt Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                System Prompt
              </label>
              <span className="font-mono text-[10px] text-muted-foreground">
                {(editPrompt ?? prompt).length} chars
              </span>
            </div>
            {promptLoading ? (
              <div className="h-64 bg-background border border-border rounded-lg animate-pulse" />
            ) : (
              <textarea
                value={editPrompt ?? prompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                rows={16}
                className="w-full bg-background border border-border rounded-lg px-4 py-3 text-sm font-mono leading-relaxed focus:border-primary focus:outline-none transition-colors resize-y"
                placeholder="Enter system prompt..."
              />
            )}
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={handleSavePrompt}
              disabled={saving || editPrompt === null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all font-mono text-xs uppercase tracking-wider"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Prompt
            </button>
          </div>

          {/* Version History */}
          {history.length > 0 && (
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
                <History className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-bold text-sm">Version History</h3>
              </div>
              <div className="divide-y divide-border/50">
                {history.map((v) => (
                  <div key={v.version} className="px-5 py-3 hover:bg-primary/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-primary">v{v.version}</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        {v.changeType}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground ml-auto">
                        {new Date(v.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {v.description && (
                      <p className="text-xs text-muted-foreground mt-1">{v.description}</p>
                    )}
                    {v.preview && (
                      <p className="font-mono text-[11px] text-foreground/60 mt-1 line-clamp-2">{v.preview}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "sessions" && (
        <div className="space-y-4">
          {sessionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse h-16" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="font-mono text-sm">No sessions for this agent</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessions.map((session: Session) => (
                <div
                  key={session.id}
                  className="bg-card border border-border rounded-lg px-5 py-3 flex items-center justify-between hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      session.status === "active" ? "bg-emerald-500" : "bg-muted-foreground/30",
                    )} />
                    <div>
                      <p className="text-sm font-medium">{session.id.slice(0, 8)}...</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                          {session.channel}
                        </span>
                        {session.messageCount != null && (
                          <span className="font-mono text-[10px] text-muted-foreground">
                            {session.messageCount} messages
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="font-mono text-[10px]">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
