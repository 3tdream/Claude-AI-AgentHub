"use client";

import { useState, useMemo } from "react";
import { Bot, Plus, LayoutGrid, List } from "lucide-react";
import Link from "next/link";
import { useAgents } from "@/lib/hooks/use-agents";
import { useTeams } from "@/lib/hooks/use-teams";
import { cn } from "@/lib/utils";
import type { Agent, LLMProvider } from "@/types";

const providerColors: Record<LLMProvider, string> = {
  anthropic: "border-orange-500/30 text-orange-400 bg-orange-500/5",
  openai: "border-emerald-500/30 text-emerald-400 bg-emerald-500/5",
  google: "border-blue-500/30 text-blue-400 bg-blue-500/5",
  openrouter: "border-purple-500/30 text-purple-400 bg-purple-500/5",
};

const agentIcons: Record<string, string> = {
  orchestrator: "🧠", "pm-agent": "📋", "architect-agent": "🏗️",
  "backend-agent": "⚙️", "frontend-agent": "🖥️", "designer-agent": "🎨",
  "qa-agent": "🔍", "devops-agent": "🚀", "cyber-agent": "🛡️",
  "research-agent": "🔬", "michael-personal-bot": "💬",
  "email & calendar manager": "📧", "tech-support-agent": "🔧",
  assistant: "🤖", "herald-avatar-prompter": "🖼️", "herald-profile-generator": "📝",
};

function AgentCard({ agent, teamNames }: { agent: Agent; teamNames: Map<string, string> }) {
  const icon = agentIcons[agent.name.toLowerCase()] || "\u{1F916}";
  const provider = agent.llmProvider || "anthropic";

  return (
    <Link href={`/agents/${agent.id}`} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group block">
      <div className="flex items-start justify-between">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
          {icon}
        </div>
        <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${providerColors[provider]}`}>
          {provider}
        </span>
      </div>
      <h3 className="font-bold text-sm mt-3 group-hover:text-primary transition-colors">{agent.name}</h3>
      <p className="font-mono text-[10px] text-muted-foreground mt-1">{agent.llmModel}</p>
      {agent.description && (
        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{agent.description}</p>
      )}
      <div className="flex gap-2 mt-3 flex-wrap">
        {agent.teams?.map((teamId) => (
          <span key={teamId} className="font-mono text-[9px] px-2 py-0.5 rounded bg-muted text-muted-foreground">
            {teamNames.get(teamId) || teamId}
          </span>
        ))}
      </div>
    </Link>
  );
}

export default function AgentsPage() {
  const { agents, isLoading } = useAgents();
  const { teams } = useTeams();
  const [view, setView] = useState<"grid" | "list">("grid");

  const teamNames = useMemo(() => {
    const m = new Map<string, string>();
    for (const t of teams) m.set(t.id, t.name);
    return m;
  }, [teams]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Agents</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            {agents.length} agents registered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setView("grid")} className={cn("p-2", view === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setView("list")} className={cn("p-2", view === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
              <List className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New Agent
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Bot className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-mono text-sm">No agents found</p>
          <p className="font-mono text-xs mt-1">Connect to Agent Hub or create your first agent</p>
        </div>
      ) : (
        <div className={cn(
          view === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            : "flex flex-col gap-2",
        )}>
          {agents.map((agent: Agent) => (
            <AgentCard key={agent.id} agent={agent} teamNames={teamNames} />
          ))}
        </div>
      )}
    </div>
  );
}
