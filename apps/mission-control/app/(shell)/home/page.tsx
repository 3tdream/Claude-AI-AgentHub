"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useAppStore } from "@/lib/stores/app-store";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useAgents, useAgentPrompt, usePromptHistory, updateAgent, updateAgentPrompt } from "@/lib/hooks/use-agents";
import { useModels } from "@/lib/hooks/use-models";
import { useSessions } from "@/lib/hooks/use-sessions";
import { toast } from "sonner";
import type { Agent, Session, LLMProvider } from "@/types";
import { Settings, FileText, MessageSquare, X, Save, RotateCcw, ExternalLink } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ── Agent icon map ──
const agentIcons: Record<string, string> = {
  orchestrator: "\u{1F9E0}",
  "pm-agent": "\u{1F4CB}",
  "architect-agent": "\u{1F3D7}\uFE0F",
  "backend-agent": "\u2699\uFE0F",
  "frontend-agent": "\u{1F5A5}\uFE0F",
  "designer-agent": "\u{1F3A8}",
  "qa-agent": "\u{1F50D}",
  "devops-agent": "\u{1F680}",
  "cyber-agent": "\u{1F6E1}\uFE0F",
  "research-agent": "\u{1F52C}",
  "michael-personal-bot": "\u{1F4AC}",
  assistant: "\u{1F916}",
};

function getAgentIcon(agentId: string): string {
  const key = agentId.toLowerCase().replace(/\s+/g, "-");
  if (agentIcons[key]) return agentIcons[key];
  for (const [k, v] of Object.entries(agentIcons)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return "\u{1F916}";
}

const PROVIDERS: LLMProvider[] = ["anthropic", "openai", "google", "openrouter"];

// ── Status pill component ──
function StatusPill({ color, label }: { color: string; label: string }) {
  const dotColors: Record<string, string> = {
    green: "bg-emerald-500 shadow-[0_0_8px_rgba(0,255,136,0.6)]",
    cyan: "bg-cyan-400 shadow-[0_0_8px_rgba(0,245,255,0.6)]",
    amber: "bg-amber-500 shadow-[0_0_8px_rgba(255,170,0,0.6)]",
    red: "bg-red-500 shadow-[0_0_8px_rgba(255,51,85,0.6)]",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${dotColors[color] || dotColors.cyan}`} />
      <span className="font-mono text-[9px] tracking-[2px] uppercase text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Metric box ──
function MetricBox({ value, label, color = "" }: { value: string; label: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
    green: "text-emerald-400",
    red: "text-red-400",
  };

  return (
    <div className="bg-black/30 border border-white/5 rounded-lg p-3 text-center">
      <div className={`font-['Rajdhani',sans-serif] text-2xl font-bold leading-none ${colorClasses[color] || "text-foreground"}`}>
        {value}
      </div>
      <div className="font-mono text-[8px] tracking-[2px] uppercase text-muted-foreground/60 mt-1">{label}</div>
    </div>
  );
}

// ── Provider badge colors ──
const providerColors: Record<string, string> = {
  anthropic: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  openai: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  google: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  openrouter: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

// ── Agent card ──
function AgentCard({ agent, stats, selected, onClick }: {
  agent: Agent;
  stats?: { runs: number; avgScore: number; successRate: number; failRate: number };
  selected?: boolean;
  onClick?: () => void;
}) {
  const successRate = stats?.successRate ?? 0;
  const status = stats ? (successRate > 70 ? "active" : successRate > 40 ? "busy" : "idle") : "idle";

  const statusConfig: Record<string, { color: string; bg: string; border: string }> = {
    active: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
    busy: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30" },
    idle: { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border" },
  };

  const sc = statusConfig[status];
  const barColor = successRate >= 70 ? "bg-emerald-500" : successRate >= 40 ? "bg-amber-500" : "bg-red-500";
  const prov = providerColors[agent.llmProvider] || providerColors.anthropic;
  const icon = getAgentIcon(agent.id);
  const teamName = agent.teams[0] || "\u2014";

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-2.5 transition-all cursor-pointer ${
        selected
          ? "bg-purple-500/[0.08] border-purple-400/30 shadow-[0_0_20px_rgba(136,0,204,0.12)]"
          : "bg-cyan-500/[0.03] border-cyan-500/10 hover:bg-cyan-500/[0.07] hover:border-cyan-400/20 hover:shadow-[0_0_18px_rgba(0,120,255,0.08)]"
      }`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm shrink-0" title={agent.id}>{icon}</span>
          <span className="font-['Rajdhani',sans-serif] text-[13px] font-semibold tracking-wide truncate">{agent.name}</span>
        </div>
        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${sc.bg} ${sc.color} ${sc.border} border tracking-wider shrink-0`}>
          {status.toUpperCase()}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className={`font-mono text-[8px] px-1 py-0.5 rounded border ${prov}`}>{agent.llmProvider}</span>
        <span className="font-mono text-[8px] text-muted-foreground/40 truncate">{agent.llmModel}</span>
        <span className="font-mono text-[8px] text-purple-400/50 ml-auto shrink-0">{teamName}</span>
      </div>
      <div className="h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor} animate-pulse`} style={{ width: `${successRate}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className="font-mono text-[9px] text-muted-foreground/50">
          {stats ? `${stats.runs} runs \u00B7 ${stats.avgScore.toFixed(1)} avg` : "No runs yet"}
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/40">
          {stats ? `${Math.round(successRate)}%` : "\u2014"}
        </span>
      </div>
    </div>
  );
}

// ── Activity entry ──
function LogEntry({ type, text, time }: { type: string; text: string; time: string }) {
  const colors: Record<string, string> = {
    kb_read: "border-l-purple-400 text-purple-400/80",
    contract_validate: "border-l-emerald-400 text-emerald-400/80",
    simulation: "border-l-amber-400 text-amber-400/80",
    routing: "border-l-cyan-400 text-cyan-400/80",
    agent: "border-l-blue-400 text-blue-400/80",
    system: "border-l-muted-foreground text-muted-foreground/60",
  };

  return (
    <div className={`font-mono text-[9px] py-1 px-2 border-l-2 leading-relaxed animate-in fade-in slide-in-from-top-1 ${colors[type] || colors.system}`}>
      <span className="text-muted-foreground/40 mr-1.5">{time}</span>{text}
    </div>
  );
}

// ── Editable Config Tab ──
function ConfigTab({ agent, onSaved }: { agent: Agent; onSaved: () => void }) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description || "");
  const [provider, setProvider] = useState<LLMProvider>(agent.llmProvider);
  const [model, setModel] = useState(agent.llmModel);
  const [maxTokens, setMaxTokens] = useState(agent.maxTokens);
  const [maxOutputTokens, setMaxOutputTokens] = useState(agent.maxOutputTokens || 0);
  const [maxToolSteps, setMaxToolSteps] = useState(agent.maxToolSteps);
  const [saving, setSaving] = useState(false);

  const { models } = useModels(provider);

  // Reset form when agent changes
  useEffect(() => {
    setName(agent.name);
    setDescription(agent.description || "");
    setProvider(agent.llmProvider);
    setModel(agent.llmModel);
    setMaxTokens(agent.maxTokens);
    setMaxOutputTokens(agent.maxOutputTokens || 0);
    setMaxToolSteps(agent.maxToolSteps);
  }, [agent.id, agent.name, agent.description, agent.llmProvider, agent.llmModel, agent.maxTokens, agent.maxOutputTokens, agent.maxToolSteps]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAgent(agent.id, {
        name,
        description: description || undefined,
        llmProvider: provider,
        llmModel: model,
        maxTokens,
        maxOutputTokens: maxOutputTokens || undefined,
        maxToolSteps,
      });
      if (res.error) {
        toast.error(`Failed to save: ${res.error}`);
      } else {
        toast.success("Agent config saved");
        onSaved();
      }
    } catch (e) {
      toast.error("Failed to save agent config");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-black/30 border border-cyan-500/20 rounded px-2 py-1 font-mono text-xs text-cyan-400 focus:outline-none focus:border-cyan-400/50 transition-colors";
  const labelCls = "font-mono text-[9px] text-muted-foreground/50 uppercase tracking-wider";

  return (
    <div className="space-y-2.5">
      {/* ID — read-only */}
      <div>
        <div className={labelCls}>ID</div>
        <div className="font-mono text-[9px] text-cyan-400/50 mt-0.5">{agent.id}</div>
      </div>

      {/* Name */}
      <div>
        <div className={labelCls}>Name</div>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* Description */}
      <div>
        <div className={labelCls}>Description</div>
        <textarea
          className={`${inputCls} resize-none h-14`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Agent description..."
        />
      </div>

      {/* Provider */}
      <div>
        <div className={labelCls}>Provider</div>
        <select
          className={inputCls}
          value={provider}
          onChange={(e) => { setProvider(e.target.value as LLMProvider); setModel(""); }}
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p} className="bg-black text-cyan-400">{p}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <div className={labelCls}>Model</div>
        <select
          className={inputCls}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {model && !models.find((m) => m.id === model) && (
            <option value={model} className="bg-black text-cyan-400">{model}</option>
          )}
          {models.map((m) => (
            <option key={m.id} value={m.id} className="bg-black text-cyan-400">{m.name || m.id}</option>
          ))}
        </select>
      </div>

      {/* Max Tokens */}
      <div>
        <div className={labelCls}>Max Tokens</div>
        <input
          type="number"
          className={inputCls}
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
        />
      </div>

      {/* Max Output Tokens */}
      <div>
        <div className={labelCls}>Max Output Tokens</div>
        <input
          type="number"
          className={inputCls}
          value={maxOutputTokens}
          onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
        />
      </div>

      {/* Max Tool Steps */}
      <div>
        <div className={labelCls}>Max Tool Steps</div>
        <input
          type="number"
          className={inputCls}
          value={maxToolSteps}
          onChange={(e) => setMaxToolSteps(Number(e.target.value))}
        />
      </div>

      {/* Teams — read-only */}
      <div>
        <div className={labelCls}>Teams</div>
        <div className="font-mono text-[9px] text-purple-400/60 mt-0.5">{agent.teams.join(", ") || "\u2014"}</div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 border border-emerald-500/30 rounded text-emerald-400 font-mono text-[10px] tracking-wider uppercase hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all disabled:opacity-40"
      >
        <Save className="w-3 h-3" />
        {saving ? "Saving..." : "Save Config"}
      </button>
    </div>
  );
}

// ── Editable Prompt Tab ──
function PromptTab({ agent }: { agent: Agent }) {
  const { prompt, isLoading: promptLoading, mutate: mutatePrompt } = useAgentPrompt(agent.id);
  const { history } = usePromptHistory(agent.id);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync prompt when loaded
  useEffect(() => {
    if (prompt && !initialized) {
      setEditedPrompt(prompt);
      setInitialized(true);
    }
  }, [prompt, initialized]);

  // Reset when agent changes
  useEffect(() => {
    setInitialized(false);
    setEditedPrompt("");
  }, [agent.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAgentPrompt(agent.id, editedPrompt);
      if (res.error) {
        toast.error(`Failed to save prompt: ${res.error}`);
      } else {
        toast.success("Prompt saved");
        mutatePrompt();
      }
    } catch (e) {
      toast.error("Failed to save prompt");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (version: { preview: string }) => {
    // Restore by setting the prompt to that version's content
    setSaving(true);
    try {
      const res = await updateAgentPrompt(agent.id, version.preview);
      if (res.error) {
        toast.error(`Failed to restore: ${res.error}`);
      } else {
        setEditedPrompt(version.preview);
        toast.success("Prompt restored");
        mutatePrompt();
      }
    } catch (e) {
      toast.error("Failed to restore prompt");
    } finally {
      setSaving(false);
    }
  };

  const isDirty = editedPrompt !== (prompt || "");

  return (
    <div className="space-y-2">
      {promptLoading ? (
        <div className="text-center py-4 text-muted-foreground/30 text-xs animate-pulse">Loading...</div>
      ) : (
        <>
          <textarea
            className="w-full bg-black/30 border border-cyan-500/20 rounded p-2 font-mono text-[10px] text-foreground/60 leading-relaxed focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
            style={{ minHeight: "200px" }}
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            placeholder="Agent system prompt..."
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-[8px] text-muted-foreground/30">
              {editedPrompt.length} chars{isDirty ? " \u00B7 unsaved" : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1 px-2 py-1 border border-emerald-500/30 rounded text-emerald-400 font-mono text-[9px] tracking-wider uppercase hover:bg-emerald-500/10 hover:border-emerald-400/50 transition-all disabled:opacity-30"
            >
              <Save className="w-3 h-3" />
              {saving ? "Saving..." : "Save Prompt"}
            </button>
          </div>

          {/* Version history */}
          {history.length > 0 && (
            <div>
              <div className="font-mono text-[8px] text-muted-foreground/40 uppercase tracking-wider mb-1">History ({history.length})</div>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between py-0.5 group">
                  <div className="font-mono text-[8px] text-muted-foreground/30">
                    v{h.version} \u00B7 {h.changeType} \u00B7 {h.description.substring(0, 30)}
                  </div>
                  <button
                    onClick={() => handleRestore(h)}
                    disabled={saving}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 px-1 py-0.5 text-amber-400/60 hover:text-amber-400 font-mono text-[7px] uppercase tracking-wider transition-all"
                    title="Restore this version"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Enhanced Sessions Tab ──
function SessionsTab({ agent }: { agent: Agent }) {
  const { sessions } = useSessions(agent.id);

  return (
    <div className="space-y-1.5">
      {(sessions as Session[]).length > 0 ? (
        (sessions as Session[]).slice(0, 10).map((s: Session) => {
          const lastDate = s.updatedAt || s.createdAt;
          return (
            <div key={s.id} className="bg-black/20 rounded-md p-2 group hover:bg-black/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[9px] text-foreground/50 truncate">{s.id.substring(0, 20)}...</div>
                <span className={`font-mono text-[7px] px-1 py-0.5 rounded tracking-wider uppercase ${
                  s.status === "active" ? "text-emerald-400 bg-emerald-500/10" : "text-muted-foreground/40 bg-white/5"
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <div className="font-mono text-[8px] text-muted-foreground/30">
                  {s.messageCount || 0} msgs
                  {s.channel && <> \u00B7 {s.channel}</>}
                  {lastDate && <> \u00B7 {new Date(lastDate).toLocaleDateString()}</>}
                </div>
                <Link
                  href={`/chat?agent=${agent.id}`}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 text-cyan-400/60 hover:text-cyan-400 font-mono text-[7px] uppercase tracking-wider transition-all"
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  Chat
                </Link>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-4 text-muted-foreground/30 text-xs">No sessions</div>
      )}
    </div>
  );
}

// ── Agent Detail Panel ──
type AgentTab = "config" | "prompt" | "sessions";

function AgentPanel({ agent, onClose, onAgentUpdated }: { agent: Agent; onClose: () => void; onAgentUpdated: () => void }) {
  const [tab, setTab] = useState<AgentTab>("config");
  const icon = getAgentIcon(agent.id);

  const tabs: { id: AgentTab; label: string; icon: typeof Settings }[] = [
    { id: "config", label: "Config", icon: Settings },
    { id: "prompt", label: "Prompt", icon: FileText },
    { id: "sessions", label: "Sessions", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-cyan-500/15">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{icon}</span>
          <span className="font-['Rajdhani',sans-serif] text-sm font-bold tracking-wide truncate">{agent.name}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/5 rounded transition-colors">
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1 py-2 font-mono text-[9px] tracking-wider transition-colors ${
              tab === t.id ? "text-cyan-400 border-b border-cyan-400" : "text-muted-foreground/40 hover:text-muted-foreground/60"
            }`}
          >
            <t.icon className="w-3 h-3" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {tab === "config" && <ConfigTab agent={agent} onSaved={onAgentUpdated} />}
        {tab === "prompt" && <PromptTab agent={agent} />}
        {tab === "sessions" && <SessionsTab agent={agent} />}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// MAIN HOME PAGE
// ══════════════════════════════════════════════

export default function HomePage() {
  const { activeProjectId } = useAppStore();
  const executionHistory = useOrchestrationStore((s) => s.executionHistory);
  const activityEvents = useActivityStore((s) => s.events);
  const { agents, isLoading: agentsLoading, mutate: mutateAgents } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || null;

  // Clock
  const [clock, setClock] = useState("");
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // API data
  const { data: healthData } = useSWR("/api/system/health", fetcher, { refreshInterval: 30000 });
  const { data: agentsData } = useSWR("/api/agents/performance", fetcher, { revalidateOnFocus: false });
  const { data: kbData } = useSWR("/api/knowledge-base/validate", fetcher, { revalidateOnFocus: false });
  const { data: statsData } = useSWR("/api/pipeline/stats", fetcher, { revalidateOnFocus: false });
  const { data: costsData } = useSWR("/api/costs/real", fetcher, { revalidateOnFocus: false });
  const { data: versionData } = useSWR("/api/system/version", fetcher, { revalidateOnFocus: false });

  const health = healthData;
  const agentStats = agentsData?.data || {};
  const kbIndex = kbData;
  const stats = statsData?.data;
  const budget = costsData?.data?.budget;

  // Merge real agent data with performance stats
  const agentStatsMap = agentStats as Record<string, { runs: number; avgScore: number; successRate: number; failRate: number }>;
  const activeAgentCount = agents.length;
  const agentsWithStats = agents.map((agent) => {
    const shortId = agent.name.toLowerCase().replace(/[-_\s]agent$/i, "").replace(/\s+/g, "-");
    const stats = agentStatsMap[shortId] || agentStatsMap[agent.id] || null;
    return { agent, stats };
  });

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* ── LEFT: Agent Fleet ── */}
      <div className="w-64 flex-shrink-0 flex flex-col gap-2 overflow-y-auto pr-1">
        <div className="flex items-center justify-between border-b border-cyan-500/15 pb-2">
          <span className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase">Agent Fleet</span>
          <span className="font-mono text-[9px] text-muted-foreground/40">{activeAgentCount}</span>
        </div>
        {agentsLoading && <div className="text-center py-8 text-muted-foreground/30 text-xs animate-pulse">Loading agents...</div>}
        {agentsWithStats.map(({ agent, stats }) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            stats={stats || undefined}
            selected={selectedAgentId === agent.id}
            onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
          />
        ))}
        {!agentsLoading && agents.length === 0 && (
          <div className="text-center py-8 text-muted-foreground/30 text-xs">No agents found</div>
        )}
      </div>

      {/* ── CENTER: Main Area ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-black/20 border border-white/5 rounded-lg">
          <div className="flex items-center gap-6">
            <StatusPill
              color={health?.overall === "healthy" ? "green" : health?.overall === "degraded" ? "amber" : "red"}
              label={health ? `System ${health.overall}` : "Loading..."}
            />
            <StatusPill color="cyan" label={`${activeAgentCount} agents`} />
            <StatusPill
              color={stats?.completed > 0 ? "green" : "amber"}
              label={stats ? `${stats.completed}/${stats.totalRuns} runs passed` : "\u2014"}
            />
          </div>
          <span className="font-mono text-[12px] tracking-[2px] text-cyan-400">{clock}</span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-6 gap-2">
          <MetricBox value={String(health?.overallScore || "\u2014")} label="Health" color="green" />
          <MetricBox value={String(kbIndex?.totalEntries || "\u2014")} label="KB Entries" color="purple" />
          <MetricBox value={String(stats?.totalRuns || "\u2014")} label="Total Runs" color="cyan" />
          <MetricBox value={stats ? `${Math.round((stats.completed / (stats.totalRuns || 1)) * 100)}%` : "\u2014"} label="Success Rate" color={stats && stats.completed / stats.totalRuns > 0.5 ? "green" : "amber"} />
          <MetricBox value={budget ? `$${budget.spent?.toFixed(0)}` : "\u2014"} label="Spent" color="amber" />
          <MetricBox value={budget ? `$${Math.round(budget.remaining)}` : "\u2014"} label="Remaining" color={budget && budget.remaining < 50 ? "red" : "green"} />
        </div>

        {/* Center content — agent panel or pipeline visualization */}
        <div className="flex-1 bg-black/10 border border-white/5 rounded-lg relative overflow-hidden">
          {selectedAgent ? (
            <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgentId(null)} onAgentUpdated={() => mutateAgents()} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(0,120,255,0.04),transparent_70%)]" />
              <div className="text-center z-10">
                <div className="font-['Rajdhani',sans-serif] text-4xl font-bold tracking-tight text-foreground/20">
                  Mission Control
                </div>
                <div className="font-mono text-[10px] tracking-[4px] uppercase text-cyan-400/40 mt-1">
                  AI Software Factory \u00B7 {versionData?.version || "v0.1.0"}
                </div>
                {activeProjectId && (
                  <div className="mt-3 font-mono text-[11px] text-purple-400/60 tracking-wider">
                    Active: {activeProjectId}
                  </div>
                )}
                <div className="mt-4 font-mono text-[9px] text-muted-foreground/25">
                  Click an agent to view details
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-black/20 border border-white/5 rounded-lg">
          <div className="flex items-center gap-4 font-mono text-[9px] tracking-wider text-muted-foreground/40">
            <span>KB: {kbIndex?.integrityOk ? "OK" : "FAIL"}</span>
            <span>Contracts: 8</span>
            <span>Skills: 82</span>
            <span>Projects: 15</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[9px] text-muted-foreground/40">
            <div className="flex items-center gap-1.5">
              <span>HEALTH</span>
              <div className="w-14 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health?.overallScore || 0}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span>BUDGET</span>
              <div className="w-14 h-[3px] bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${budget && budget.usedPercent > 80 ? "bg-red-500" : "bg-cyan-400"}`} style={{ width: `${budget?.usedPercent || 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Activity + Metrics ── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pl-1">
        <div className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase border-b border-cyan-500/15 pb-2">
          Live Activity
        </div>
        <div className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto">
          {activityEvents.slice(0, 20).map((e) => (
            <LogEntry
              key={e.id}
              type={e.type}
              text={e.label}
              time={new Date(e.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            />
          ))}
          {activityEvents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground/30 text-xs">No activity yet</div>
          )}
        </div>

        {/* Recent runs */}
        <div className="font-mono text-[10px] tracking-[3px] text-cyan-400 uppercase border-b border-cyan-500/15 pb-2 mt-2">
          Recent Runs
        </div>
        <div className="flex flex-col gap-1.5">
          {executionHistory.slice(0, 5).map((exec, i) => (
            <div key={`${exec.id}-${i}`} className="bg-black/20 border border-white/5 rounded-md p-2">
              <div className="font-mono text-[9px] text-foreground/60 truncate">{exec.input?.substring(0, 40)}</div>
              <div className="flex items-center justify-between mt-1">
                <span className={`font-mono text-[8px] uppercase tracking-wider ${
                  exec.status === "completed" ? "text-emerald-400" : exec.status === "failed" ? "text-red-400" : "text-amber-400"
                }`}>
                  {exec.status}
                </span>
                <span className="font-mono text-[8px] text-muted-foreground/30">
                  {exec.totalDuration ? `${Math.round(exec.totalDuration / 1000)}s` : "\u2014"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
