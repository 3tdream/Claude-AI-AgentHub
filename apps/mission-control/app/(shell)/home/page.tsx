"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useAppStore } from "@/lib/stores/app-store";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { useActivityStore } from "@/lib/stores/activity-store";
import { useAgents, useAgentPrompt, usePromptHistory, updateAgent, updateAgentPrompt, createAgent } from "@/lib/hooks/use-agents";
import { useModels } from "@/lib/hooks/use-models";
import { useSessions } from "@/lib/hooks/use-sessions";
import { toast } from "sonner";
import type { Agent, Session, LLMProvider } from "@/types";
import { Settings, FileText, MessageSquare, X, Save, RotateCcw, ExternalLink, Plus, GripVertical, Pencil, ChevronUp, ChevronDown, PanelLeftClose, PanelLeft, Activity, Layers } from "lucide-react";

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
  "email": "\u{1F4E7}",
  "calendar": "\u{1F4E7}",
  "tech-support": "\u{1F527}",
  "herald": "\u{1F5BC}\uFE0F",
  "profile": "\u{1F4DD}",
  "avatar": "\u{1F5BC}\uFE0F",
};

function getAgentIcon(name: string): string {
  const key = name.toLowerCase().replace(/\s+/g, "-");
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
    green: "bg-emerald-500",
    blue: "bg-indigo-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    gray: "bg-slate-400",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || dotColors.gray}`} />
      <span className="font-mono text-[10px] tracking-wide text-slate-500">{label}</span>
    </div>
  );
}

// ── Metric box ──
function MetricBox({ value, label, color = "" }: { value: string; label: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    indigo: "text-indigo-600",
    purple: "text-violet-600",
    amber: "text-amber-600",
    green: "text-emerald-600",
    red: "text-rose-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
      <div className={`font-mono text-2xl font-bold leading-none ${colorClasses[color] || "text-slate-900"}`}>
        {value}
      </div>
      <div className="font-mono text-[10px] tracking-wide uppercase text-slate-400 mt-1.5">{label}</div>
    </div>
  );
}

// ── Provider badge colors ──
const providerColors: Record<string, string> = {
  anthropic: "text-orange-700 bg-orange-50 border-orange-200",
  openai: "text-emerald-700 bg-emerald-50 border-emerald-200",
  google: "text-blue-700 bg-blue-50 border-blue-200",
  openrouter: "text-violet-700 bg-violet-50 border-violet-200",
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

  const statusConfig: Record<string, { color: string; bg: string }> = {
    active: { color: "text-emerald-700", bg: "bg-emerald-50" },
    busy: { color: "text-amber-700", bg: "bg-amber-50" },
    idle: { color: "text-slate-500", bg: "bg-slate-100" },
  };

  const sc = statusConfig[status];
  const barColor = successRate >= 70 ? "bg-emerald-500" : successRate >= 40 ? "bg-amber-500" : "bg-rose-400";
  const prov = providerColors[agent.llmProvider] || providerColors.anthropic;
  const icon = getAgentIcon(agent.name);
  const teamName = agent.teams[0] || "\u2014";

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-3 transition-all cursor-pointer overflow-hidden min-w-0 ${
        selected
          ? "bg-indigo-50 border-indigo-300 shadow-sm"
          : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-sm"
      }`}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm shrink-0" title={agent.id}>{icon}</span>
          <span className="text-[13px] font-semibold text-slate-900 tracking-tight truncate">{agent.name}</span>
        </div>
        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${sc.bg} ${sc.color} font-medium tracking-wide uppercase shrink-0`}>
          {status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full border ${prov}`}>{agent.llmProvider}</span>
        <span className="font-mono text-[9px] text-slate-400 truncate">{agent.llmModel}</span>
        <span className="font-mono text-[9px] text-violet-500 ml-auto shrink-0">{teamName}</span>
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${successRate}%` }} />
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="font-mono text-[10px] text-slate-500">
          {stats ? `${stats.runs} runs \u00B7 ${stats.avgScore.toFixed(1)} avg` : "No runs yet"}
        </span>
        <span className="font-mono text-[10px] font-medium text-slate-600">
          {stats ? `${Math.round(successRate)}%` : "\u2014"}
        </span>
      </div>
    </div>
  );
}

// ── Activity entry ──
function LogEntry({ type, text, time }: { type: string; text: string; time: string }) {
  const colors: Record<string, string> = {
    kb_read: "border-l-violet-400",
    contract_validate: "border-l-emerald-400",
    simulation: "border-l-amber-400",
    routing: "border-l-indigo-400",
    agent: "border-l-blue-400",
    system: "border-l-slate-300",
  };

  return (
    <div className={`font-mono text-[10px] py-1.5 px-2.5 border-l-2 leading-relaxed text-slate-600 ${colors[type] || colors.system}`}>
      <span className="text-slate-400 mr-1.5">{time}</span>{text}
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

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";
  const labelCls = "text-xs text-slate-500 uppercase tracking-wide font-medium mb-1";

  return (
    <div className="space-y-4">
      {/* ID — read-only */}
      <div>
        <div className={labelCls}>ID</div>
        <div className="font-mono text-xs text-slate-400 mt-0.5">{agent.id}</div>
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
          className={`${inputCls} resize-none h-16`}
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
            <option key={p} value={p}>{p}</option>
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
            <option value={model}>{model}</option>
          )}
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name || m.id}</option>
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
        <div className="font-mono text-xs text-violet-600 mt-0.5">{agent.teams.join(", ") || "\u2014"}</div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-40"
      >
        <Save className="w-4 h-4" />
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
    <div className="space-y-3">
      {promptLoading ? (
        <div className="text-center py-6 text-slate-400 text-sm">Loading...</div>
      ) : (
        <>
          <textarea
            className="w-full bg-white border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
            style={{ minHeight: "200px" }}
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            placeholder="Agent system prompt..."
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">
              {editedPrompt.length} chars{isDirty ? " \u00B7 unsaved" : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-30"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Prompt"}
            </button>
          </div>

          {/* Version history */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">History ({history.length})</div>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between py-1 group">
                  <div className="font-mono text-xs text-slate-400">
                    v{h.version} \u00B7 {h.changeType} \u00B7 {h.description.substring(0, 30)}
                  </div>
                  <button
                    onClick={() => handleRestore(h)}
                    disabled={saving}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-0.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded text-xs font-medium transition-all"
                    title="Restore this version"
                  >
                    <RotateCcw className="w-3 h-3" />
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
    <div className="space-y-2">
      {(sessions as Session[]).length > 0 ? (
        (sessions as Session[]).slice(0, 10).map((s: Session) => {
          const lastDate = s.updatedAt || s.createdAt;
          return (
            <div key={s.id} className="bg-slate-50 rounded-lg p-3 group hover:bg-slate-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-slate-600 truncate">{s.id.substring(0, 20)}...</div>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase ${
                  s.status === "active" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="font-mono text-[11px] text-slate-400">
                  {s.messageCount || 0} msgs
                  {s.channel && <> \u00B7 {s.channel}</>}
                  {lastDate && <> \u00B7 {new Date(lastDate).toLocaleDateString()}</>}
                </div>
                <Link
                  href={`/chat?agent=${agent.id}`}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  Chat
                </Link>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-6 text-slate-400 text-sm">No sessions</div>
      )}
    </div>
  );
}

// ── Agent Detail Panel ──
type AgentTab = "config" | "prompt" | "sessions";

function AgentPanel({ agent, onClose, onAgentUpdated }: { agent: Agent; onClose: () => void; onAgentUpdated: () => void }) {
  const [tab, setTab] = useState<AgentTab>("config");
  const icon = getAgentIcon(agent.name);

  const tabs: { id: AgentTab; label: string; icon: typeof Settings }[] = [
    { id: "config", label: "Config", icon: Settings },
    { id: "prompt", label: "Prompt", icon: FileText },
    { id: "sessions", label: "Sessions", icon: MessageSquare },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{icon}</span>
          <span className="text-sm font-semibold text-slate-900 tracking-tight truncate">{agent.name}</span>
        </div>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium tracking-wide transition-colors ${
              tab === t.id
                ? "text-indigo-600 border-b-2 border-indigo-600"
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "config" && <ConfigTab agent={agent} onSaved={onAgentUpdated} />}
        {tab === "prompt" && <PromptTab agent={agent} />}
        {tab === "sessions" && <SessionsTab agent={agent} />}
      </div>
    </div>
  );
}

// ── New Agent Panel ──
function NewAgentPanel({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState<LLMProvider>("anthropic");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [maxTokens, setMaxTokens] = useState(25000);
  const [saving, setSaving] = useState(false);

  const { models } = useModels(provider);
  const filteredModels = (models || []).filter((m: any) => !provider || m.provider === provider);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const res = await createAgent({ name, description, llmProvider: provider, llmModel: model, maxTokens, maxToolSteps: 10 });
      if (res?.data?.id || res?.id) {
        toast.success(`Agent "${name}" created`);
        onCreated(res.data?.id || res.id);
      } else {
        toast.error(res?.error || "Failed to create agent");
      }
    } catch (e) {
      toast.error(String(e));
    }
    setSaving(false);
  };

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";
  const labelCls = "text-xs text-slate-500 uppercase tracking-wide font-medium mb-1";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <span className="text-sm font-semibold text-indigo-600">+ New Agent</span>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className={labelCls}>Name *</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My-Custom-Agent"
            className={inputCls} />
        </div>
        <div>
          <div className={labelCls}>Description</div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this agent do?"
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <div className={labelCls}>Provider</div>
          <select value={provider} onChange={(e) => { setProvider(e.target.value as LLMProvider); setModel(""); }}
            className={inputCls}>
            {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <div className={labelCls}>Model</div>
          <select value={model} onChange={(e) => setModel(e.target.value)}
            className={inputCls}>
            {filteredModels.length > 0
              ? filteredModels.map((m: any) => <option key={m.id} value={m.id}>{m.name || m.id}</option>)
              : <option value={model}>{model}</option>}
          </select>
        </div>
        <div>
          <div className={labelCls}>Max Tokens</div>
          <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))}
            className={inputCls} />
        </div>
        <button onClick={handleCreate} disabled={saving || !name.trim()}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-30">
          {saving ? "Creating..." : "Create Agent"}
        </button>
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
  const [editMode, setEditMode] = useState(false);
  const [agentOrder, setAgentOrder] = useState<string[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [fleetCollapsed, setFleetCollapsed] = useState(false);

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
  const agentStats = agentsData?.data || agentsData?.agentStats || {};
  const kbIndex = kbData;
  const stats = statsData?.data || statsData;
  const budget = costsData?.data?.budget;

  // Merge real agent data with performance stats
  const agentStatsMap = agentStats as Record<string, { runs: number; avgScore: number; successRate: number; failRate: number }>;
  const activeAgentCount = agents.length;
  const agentsWithStats = agents.map((agent) => {
    const shortId = agent.name.toLowerCase().replace(/[-_\s]agent$/i, "").replace(/\s+/g, "-");
    const stats = agentStatsMap[shortId] || agentStatsMap[agent.id] || null;
    return { agent, stats };
  });

  // Init agent order from localStorage or default
  useEffect(() => {
    if (agents.length > 0 && agentOrder.length === 0) {
      try {
        const saved = localStorage.getItem("mc-agent-order");
        if (saved) {
          const parsed = JSON.parse(saved) as string[];
          const existing = new Set(parsed);
          const newIds = agents.map((a) => a.id).filter((id) => !existing.has(id));
          setAgentOrder([...parsed.filter((id) => agents.some((a) => a.id === id)), ...newIds]);
          return;
        }
      } catch {}
      setAgentOrder(agents.map((a) => a.id));
    }
  }, [agents, agentOrder.length]);

  // Sort agentsWithStats by order
  const orderedAgents = agentOrder.length > 0
    ? agentOrder.map((id) => agentsWithStats.find((a) => a.agent.id === id)).filter(Boolean) as typeof agentsWithStats
    : agentsWithStats;

  const moveAgent = (fromIdx: number, dir: -1 | 1) => {
    const toIdx = fromIdx + dir;
    if (toIdx < 0 || toIdx >= agentOrder.length) return;
    const newOrder = [...agentOrder];
    [newOrder[fromIdx], newOrder[toIdx]] = [newOrder[toIdx], newOrder[fromIdx]];
    setAgentOrder(newOrder);
    localStorage.setItem("mc-agent-order", JSON.stringify(newOrder));
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">

      {/* ── LEFT: Agent Fleet ── */}
      <div className={`flex-shrink-0 flex flex-col gap-2 overflow-y-auto transition-all duration-300 ${fleetCollapsed ? "w-14" : "w-64"}`}>

        {/* ── COLLAPSED: icons only ── */}
        {fleetCollapsed ? (
          <>
            <div className="flex flex-col items-center gap-1 pb-2 border-b border-slate-200">
              <button onClick={() => setFleetCollapsed(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" title="Expand fleet">
                <PanelLeft className="w-4 h-4 text-slate-400" />
              </button>
              <button onClick={() => setSelectedAgentId("__new__")} className="p-1 rounded text-indigo-400 hover:text-indigo-600 transition-colors" title="New agent">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {orderedAgents.map(({ agent, stats }) => {
              const successRate = stats?.successRate ?? 0;
              const statusColor = successRate > 70 ? "bg-emerald-500" : successRate > 40 ? "bg-amber-500" : successRate > 0 ? "bg-rose-400" : "bg-slate-300";
              const icon = getAgentIcon(agent.name);
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
                  title={`${agent.name} — ${stats ? Math.round(successRate) + "%" : "idle"}`}
                  className={`flex flex-col items-center py-1.5 rounded-lg transition-all ${
                    selectedAgentId === agent.id
                      ? "bg-indigo-50 border border-indigo-300"
                      : "hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <span className="text-sm">{icon}</span>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${statusColor}`} />
                </button>
              );
            })}
          </>
        ) : (
          <>
            {/* ── EXPANDED: full cards ── */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Agent Fleet</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`p-1 rounded transition-colors ${editMode ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                  title={editMode ? "Done reordering" : "Reorder agents"}
                >
                  <Pencil className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setSelectedAgentId("__new__")}
                  className="p-1 rounded text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                  title="New agent"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setFleetCollapsed(true)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                  title="Collapse fleet"
                >
                  <PanelLeftClose className="w-3 h-3" />
                </button>
                <span className="font-mono text-[10px] text-slate-400 ml-0.5">{activeAgentCount}</span>
              </div>
            </div>

            {agentsLoading && <div className="text-center py-8 text-slate-400 text-sm">Loading agents...</div>}

            {orderedAgents.map(({ agent, stats }, idx) => (
              <div key={agent.id} className="flex items-stretch gap-1">
                {editMode && (
                  <div className="flex flex-col justify-center gap-0.5 shrink-0">
                    <button onClick={() => moveAgent(idx, -1)} disabled={idx === 0} className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 transition-colors">
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <GripVertical className="w-3 h-3 text-slate-300 mx-auto" />
                    <button onClick={() => moveAgent(idx, 1)} disabled={idx === orderedAgents.length - 1} className="p-0.5 text-slate-300 hover:text-indigo-600 disabled:opacity-20 transition-colors">
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <AgentCard
                    agent={agent}
                    stats={stats || undefined}
                    selected={selectedAgentId === agent.id}
                    onClick={() => !editMode && setSelectedAgentId(selectedAgentId === agent.id ? null : agent.id)}
                  />
                </div>
              </div>
            ))}

            {!agentsLoading && agents.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">No agents found</div>
            )}
          </>
        )}
      </div>

      {/* ── CENTER: Main Area ── */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* Status bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-6">
            <StatusPill
              color={health?.overall === "healthy" ? "green" : health?.overall === "degraded" ? "amber" : "red"}
              label={health ? `System ${health.overall}` : "Loading..."}
            />
            <StatusPill color="blue" label={`${activeAgentCount} agents`} />
            <StatusPill
              color={stats?.completed > 0 ? "green" : "amber"}
              label={stats ? `${stats.completed}/${stats.totalRuns} runs passed` : "\u2014"}
            />
          </div>
          <span className="font-mono text-xs text-slate-500">{clock}</span>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-6 gap-3">
          <MetricBox value={String(health?.overallScore || "\u2014")} label="Health" color="green" />
          <MetricBox value={String(kbIndex?.totalEntries || "\u2014")} label="KB Entries" color="purple" />
          <MetricBox value={String(stats?.totalRuns || "\u2014")} label="Total Runs" color="indigo" />
          <MetricBox value={stats ? `${Math.round((stats.completed / (stats.totalRuns || 1)) * 100)}%` : "\u2014"} label="Success Rate" color={stats && stats.completed / stats.totalRuns > 0.5 ? "green" : "amber"} />
          <MetricBox value={budget ? `$${budget.spent?.toFixed(0)}` : "\u2014"} label="Spent" color="amber" />
          <MetricBox value={budget ? `$${Math.round(budget.remaining)}` : "\u2014"} label="Remaining" color={budget && budget.remaining < 50 ? "red" : "green"} />
        </div>

        {/* Center content — agent panel or empty state */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl relative overflow-hidden">
          {selectedAgentId === "__new__" ? (
            <NewAgentPanel onClose={() => setSelectedAgentId(null)} onCreated={(id) => { mutateAgents(); setSelectedAgentId(id); }} />
          ) : selectedAgent ? (
            <AgentPanel agent={selectedAgent} onClose={() => setSelectedAgentId(null)} onAgentUpdated={() => mutateAgents()} />
          ) : (
            <div className="flex items-center justify-center h-full bg-slate-50/50">
              <div className="text-center">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <div className="text-sm font-medium text-slate-400">
                  Select an agent or run a pipeline
                </div>
                {activeProjectId && (
                  <div className="mt-2 font-mono text-xs text-indigo-500">
                    Active: {activeProjectId}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom status bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <span>KB: {kbIndex?.integrityOk ? "OK" : "FAIL"}</span>
            <span>Contracts: 8</span>
            <span>Skills: 82</span>
            <span>Projects: 15</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <span>HEALTH</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${health?.overallScore || 0}%` }} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span>BUDGET</span>
              <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${budget && budget.usedPercent > 80 ? "bg-rose-500" : "bg-indigo-500"}`} style={{ width: `${budget?.usedPercent || 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Activity + Metrics ── */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-4 overflow-y-auto pl-1">
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2">
          <Activity className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Live Activity</span>
        </div>
        <div className="flex flex-col gap-0.5 max-h-[50vh] overflow-y-auto">
          {activityEvents.slice(0, 20).map((e) => (
            <LogEntry
              key={e.id}
              type={e.type}
              text={e.label}
              time={new Date(e.timestamp).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            />
          ))}
          {activityEvents.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">No activity yet</div>
          )}
        </div>

        {/* Recent runs */}
        <div className="flex items-center gap-1.5 border-b border-slate-200 pb-2 mt-2">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-semibold text-slate-900 uppercase tracking-wide">Recent Runs</span>
        </div>
        <div className="flex flex-col gap-2">
          {executionHistory.slice(0, 5).map((exec, i) => (
            <div key={`${exec.id}-${i}`} className="bg-white border border-slate-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
              <div className="font-mono text-xs text-slate-600 truncate">{exec.input?.substring(0, 40)}</div>
              <div className="flex items-center justify-between mt-1.5">
                <span className={`font-mono text-[10px] uppercase tracking-wide font-medium ${
                  exec.status === "completed" ? "text-emerald-600" : exec.status === "failed" ? "text-rose-600" : "text-amber-600"
                }`}>
                  {exec.status}
                </span>
                <span className="font-mono text-[10px] text-slate-400">
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
