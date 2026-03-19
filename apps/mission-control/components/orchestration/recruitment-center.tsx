"use client";

import { useState } from "react";
import { X, UserPlus, Search, Cpu, Shield, Headphones, Megaphone, Brain, CheckSquare, Square, GitBranch } from "lucide-react";
import { AGENT_CATALOG, DEPARTMENTS, getAgentsByDepartment } from "@/lib/agent-catalog";
import type { AgentCatalogEntry, AgentDepartment } from "@/types";

interface RecruitmentCenterProps {
  open: boolean;
  onClose: () => void;
  onAddAgent: (agent: AgentCatalogEntry) => void;
  onAddParallelAgents?: (agents: AgentCatalogEntry[]) => void;
  existingAgentIds: string[];
}

const departmentIcons: Record<AgentDepartment, React.ReactNode> = {
  Strategy: <Brain className="w-4 h-4" />,
  Engineering: <Cpu className="w-4 h-4" />,
  Security: <Shield className="w-4 h-4" />,
  Support: <Headphones className="w-4 h-4" />,
  Herald: <Megaphone className="w-4 h-4" />,
};

const departmentColors: Record<AgentDepartment, string> = {
  Strategy: "text-violet-400",
  Engineering: "text-blue-400",
  Security: "text-red-400",
  Support: "text-emerald-400",
  Herald: "text-amber-400",
};

export function RecruitmentCenter({ open, onClose, onAddAgent, onAddParallelAgents, existingAgentIds }: RecruitmentCenterProps) {
  const [activeDepartment, setActiveDepartment] = useState<AgentDepartment>("Strategy");
  const [search, setSearch] = useState("");
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());

  if (!open) return null;

  const agents = search.trim()
    ? AGENT_CATALOG.filter((a) =>
        a.agentName.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()),
      )
    : getAgentsByDepartment(activeDepartment);

  function toggleAgentSelection(agentId: string) {
    setSelectedAgents((prev) => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  }

  function handleConfirmParallel() {
    if (selectedAgents.size < 2) return;
    const selected = AGENT_CATALOG.filter((a) => selectedAgents.has(a.agentId));
    onAddParallelAgents?.(selected);
    setSelectedAgents(new Set());
    setMultiSelectMode(false);
    onClose();
  }

  function handleClose() {
    setSelectedAgents(new Set());
    setMultiSelectMode(false);
    setSearch("");
    setActiveDepartment("Strategy");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-card border border-border rounded-xl w-[640px] max-h-[560px] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-lg">Recruitment Center</h2>
            <span className="font-mono text-[10px] text-muted-foreground ml-1">{AGENT_CATALOG.length} agents</span>
          </div>
          <div className="flex items-center gap-2">
            {/* Multi-select toggle */}
            {onAddParallelAgents && (
              <button
                onClick={() => { setMultiSelectMode(!multiSelectMode); setSelectedAgents(new Set()); }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                  multiSelectMode
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
                title="Select multiple agents for a parallel stage"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-wider">Parallel</span>
              </button>
            )}
            <button onClick={handleClose} className="p-1 hover:text-destructive transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-5 py-3 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search agents..."
              className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Department tabs */}
        {!search.trim() && (
          <div className="flex gap-1 px-5 py-2 border-b border-border/50">
            {DEPARTMENTS.map((dept) => (
              <button
                key={dept}
                onClick={() => setActiveDepartment(dept)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider transition-all ${
                  activeDepartment === dept
                    ? `bg-primary/10 ${departmentColors[dept]} font-bold`
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {departmentIcons[dept]}
                {dept}
              </button>
            ))}
          </div>
        )}

        {/* Agent grid */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent) => {
              const alreadyAdded = existingAgentIds.includes(agent.agentId);
              const isSelected = selectedAgents.has(agent.agentId);
              return (
                <button
                  key={agent.agentId}
                  onClick={() => {
                    if (alreadyAdded && !multiSelectMode) return;
                    if (multiSelectMode) {
                      if (!alreadyAdded) toggleAgentSelection(agent.agentId);
                    } else {
                      onAddAgent(agent);
                    }
                  }}
                  disabled={alreadyAdded && !multiSelectMode}
                  className={`text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                      : alreadyAdded
                      ? "border-border/30 opacity-40 cursor-not-allowed"
                      : "border-border hover:border-primary/50 hover:bg-primary/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {multiSelectMode && !alreadyAdded && (
                      isSelected
                        ? <CheckSquare className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        : <Square className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={departmentColors[agent.department]}>
                      {departmentIcons[agent.department]}
                    </span>
                    <span className="text-sm font-medium">{agent.agentName}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{agent.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {agent.model}
                    </span>
                    <span className="font-mono text-[9px] text-muted-foreground">
                      Q≥{agent.qualityThreshold}
                    </span>
                    {alreadyAdded && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 ml-auto">
                        in pipeline
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multi-select footer */}
        {multiSelectMode && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between">
            <span className="font-mono text-[10px] text-muted-foreground">
              {selectedAgents.size} selected for parallel execution
            </span>
            <button
              onClick={handleConfirmParallel}
              disabled={selectedAgents.size < 2}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-30 transition-all"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Add as Parallel Stage ({selectedAgents.size})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
