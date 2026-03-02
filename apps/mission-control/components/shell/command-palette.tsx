"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  LayoutDashboard,
  Bot,
  Users,
  GitBranch,
  MessageSquare,
  DollarSign,
  ScrollText,
  Search,
} from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useAgents } from "@/lib/hooks/use-agents";

const agentIcons: Record<string, string> = {
  orchestrator: "\u{1F9E0}", "pm-agent": "\u{1F4CB}", "architect-agent": "\u{1F3D7}\uFE0F",
  "backend-agent": "\u2699\uFE0F", "frontend-agent": "\u{1F5A5}\uFE0F", "designer-agent": "\u{1F3A8}",
  "qa-agent": "\u{1F50D}", "devops-agent": "\u{1F680}", "cyber-agent": "\u{1F6E1}\uFE0F",
  "research-agent": "\u{1F52C}", "michael-personal-bot": "\u{1F4AC}",
  "email & calendar manager": "\u{1F4E7}", "tech-support-agent": "\u{1F527}",
  assistant: "\u{1F916}", "herald-avatar-prompter": "\u{1F5BC}\uFE0F", "herald-profile-generator": "\u{1F4DD}",
};

const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agents", href: "/agents", icon: Bot },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Orchestration", href: "/orchestration", icon: GitBranch },
  { name: "Chat", href: "/chat", icon: MessageSquare },
  { name: "Costs", href: "/costs", icon: DollarSign },
  { name: "Logs", href: "/logs", icon: ScrollText },
];

export function CommandPalette() {
  const router = useRouter();
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const { agents } = useAgents();
  const [search, setSearch] = useState("");

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  function navigate(href: string) {
    router.push(href);
    setCommandPaletteOpen(false);
    setSearch("");
  }

  if (!commandPaletteOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setCommandPaletteOpen(false)}
      />

      {/* Dialog */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg">
        <Command
          className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden"
          shouldFilter={true}
        >
          <div className="flex items-center gap-3 px-4 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Search pages, agents..."
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>

          <Command.List className="max-h-80 overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center font-mono text-xs text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Pages" className="mb-2">
              {pages.map((page) => (
                <Command.Item
                  key={page.href}
                  value={page.name}
                  onSelect={() => navigate(page.href)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                >
                  <page.icon className="w-4 h-4 flex-shrink-0" />
                  {page.name}
                </Command.Item>
              ))}
            </Command.Group>

            {agents.length > 0 && (
              <Command.Group heading="Agents" className="mb-2">
                {agents.map((agent) => (
                  <Command.Item
                    key={agent.id}
                    value={`agent ${agent.name} ${agent.llmModel}`}
                    onSelect={() => navigate(`/agents/${agent.id}`)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer aria-selected:bg-primary/10 aria-selected:text-primary transition-colors"
                  >
                    <span className="text-base flex-shrink-0">
                      {agentIcons[agent.name.toLowerCase()] || "\u{1F916}"}
                    </span>
                    <div>
                      <span>{agent.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground ml-2">
                        {agent.llmModel}
                      </span>
                    </div>
                  </Command.Item>
                ))}
              </Command.Group>
            )}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
