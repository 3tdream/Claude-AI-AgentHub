"use client";

import { useState } from "react";
import type { Agent } from "@/types";
import { Settings, FileText, MessageSquare, X, Layers } from "lucide-react";
import { getAgentIcon } from "./constants";
import { ConfigTab } from "./config-tab";
import { PromptTab } from "./prompt-tab";
import { SessionsTab } from "./sessions-tab";
import { ChatTab } from "./chat-tab";

type AgentTab = "config" | "prompt" | "sessions" | "chat";

export function AgentPanel({ agent, onClose, onAgentUpdated }: { agent: Agent; onClose: () => void; onAgentUpdated: () => void }) {
  const [tab, setTab] = useState<AgentTab>("chat");
  const icon = getAgentIcon(agent.name);

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
        {tab === "chat" && <ChatTab agent={agent} />}
        {tab === "config" && <ConfigTab agent={agent} onSaved={onAgentUpdated} />}
        {tab === "prompt" && <PromptTab agent={agent} />}
        {tab === "sessions" && <SessionsTab agent={agent} />}
      </div>
    </div>
  );
}
