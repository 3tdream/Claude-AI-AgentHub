"use client";

import { useMemo } from "react";
import { Users, Plus } from "lucide-react";
import Link from "next/link";
import { useTeams } from "@/lib/hooks/use-teams";
import { useAgents } from "@/lib/hooks/use-agents";
import type { Team } from "@/types";

function TeamCard({ team, agentCount }: { team: Team; agentCount: number }) {
  return (
    <Link href={`/teams/${team.id}`} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all block">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
          {team.icon || "\u{1F465}"}
        </div>
        <div>
          <h3 className="font-bold text-base">{team.name}</h3>
          <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
            {agentCount} agents
          </p>
        </div>
      </div>
      {team.description && (
        <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{team.description}</p>
      )}
    </Link>
  );
}

export default function TeamsPage() {
  const { teams, isLoading } = useTeams();
  const { agents } = useAgents();

  // Count agents per team from real agent data
  const agentCountMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const agent of agents) {
      for (const teamId of agent.teams) {
        m.set(teamId, (m.get(teamId) || 0) + 1);
      }
    }
    return m;
  }, [agents]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Teams</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Agent team management
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Team
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="w-12 h-12 mb-4 opacity-30" />
          <p className="font-mono text-sm">No teams found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team: Team) => (
            <TeamCard key={team.id} team={team} agentCount={agentCountMap.get(team.id) || 0} />
          ))}
        </div>
      )}
    </div>
  );
}
