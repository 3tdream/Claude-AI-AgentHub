"use client";

import { useState, useCallback } from "react";
import type { Agent } from "@/types";
import { Settings, FileText, MessageSquare, X, Layers, ArrowLeft } from "lucide-react";
import { getAgentLucideIcon } from "./constants";
import { ConfigTab } from "./config-tab";
import { PromptTab } from "./prompt-tab";
import { SessionsTab } from "./sessions-tab";
import { ChatTab } from "./chat-tab";

type AgentTab = "config" | "prompt" | "sessions" | "chat";

function getSavedTab(): AgentTab {
  try {
    const saved = localStorage.getItem("mc-agent-tab");
    if (saved && ["config", "prompt", "sessions", "chat"].includes(saved)) return saved as AgentTab;
  } catch {}
  return "chat";
}

export function AgentPanel({ agent, onClose, onAgentUpdated }: { agent: Agent; onClose: () => void; onAgentUpdated: () => void }) {
  const [tab, setTabState] = useState<AgentTab>(getSavedTab);
  const setTab = useCallback((t: AgentTab) => {
    setTabState(t);
    try { localStorage.setItem("mc-agent-tab", t); } catch {}
  }, []);
  const AgentIcon = getAgentLucideIcon(agent.name);

  const tabs: { id: AgentTab; label: string; icon: typeof Settings }[] = [
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "config", label: "Config", icon: Settings },
    { id: "prompt", label: "Prompt", icon: FileText },
    { id: "sessions", label: "Sessions", icon: Layers },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <AgentIcon className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-slate-900 tracking-tight truncate">{agent.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onClose} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" aria-label="Back to pipeline">
            <ArrowLeft className="w-3.5 h-3.5" />
            Pipeline
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close agent panel">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
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
        {tab === "chat" && <ChatTab agent={agent} />}
        {tab === "config" && <ConfigTab agent={agent} onSaved={onAgentUpdated} />}
        {tab === "prompt" && <PromptTab agent={agent} />}
        {tab === "sessions" && <SessionsTab agent={agent} />}
      </div>
    </div>
  );
}
