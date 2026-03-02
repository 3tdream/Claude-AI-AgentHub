"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, Loader2 } from "lucide-react";
import { useTeams } from "@/lib/hooks/use-teams";
import { useAgents } from "@/lib/hooks/use-agents";
import type { Agent, LLMProvider } from "@/types";

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

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.teamId as string;
  const { teams, isLoading: teamsLoading } = useTeams();
  const { agents, isLoading: agentsLoading } = useAgents();

  const team = useMemo(() => teams.find((t) => t.id === teamId), [teams, teamId]);

  const teamAgents = useMemo(
    () => agents.filter((a: Agent) => a.teams?.includes(teamId)),
    [agents, teamId],
  );

  if (teamsLoading || agentsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-8rem)] text-muted-foreground">
        <p className="font-mono text-sm">Team not found</p>
        <Link href="/teams" className="mt-4 text-primary text-sm hover:underline">
          Back to teams
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/teams"
          className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl">
          {team.icon || "\u{1F465}"}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{team.name}</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            {teamAgents.length} agents
          </p>
        </div>
      </div>

      {team.description && (
        <p className="text-sm text-muted-foreground max-w-2xl">{team.description}</p>
      )}

      {/* Members */}
      <div>
        <h2 className="font-bold text-lg mb-4">Team Members</h2>
        {teamAgents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-card border border-border rounded-xl">
            <Bot className="w-10 h-10 mb-3 opacity-20" />
            <p className="font-mono text-sm">No agents in this team</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamAgents.map((agent: Agent) => {
              const icon = agentIcons[agent.name.toLowerCase()] || "\u{1F916}";
              const provider = agent.llmProvider || "anthropic";

              return (
                <Link
                  key={agent.id}
                  href={`/agents/${agent.id}`}
                  className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
                      {icon}
                    </div>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded border ${providerColors[provider]}`}>
                      {provider}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm mt-3 group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground mt-1">{agent.llmModel}</p>
                  {agent.description && (
                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{agent.description}</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
