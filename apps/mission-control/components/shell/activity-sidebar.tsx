"use client";

import { Activity, X, Trash2 } from "lucide-react";
import { useActivityStore, type ActivityType } from "@/lib/stores/activity-store";

const typeColors: Record<ActivityType, string> = {
  kb_read: "text-violet-400",
  kb_write: "text-violet-300",
  kb_search: "text-violet-500",
  contract_load: "text-blue-400",
  contract_validate: "text-emerald-400",
  simulation: "text-amber-400",
  replan: "text-purple-400",
  skill: "text-cyan-400",
  agent: "text-orange-400",
  routing: "text-teal-400",
  system: "text-muted-foreground",
};

const typeBg: Record<ActivityType, string> = {
  kb_read: "bg-violet-500/10",
  kb_write: "bg-violet-500/10",
  kb_search: "bg-violet-500/10",
  contract_load: "bg-blue-500/10",
  contract_validate: "bg-emerald-500/10",
  simulation: "bg-amber-500/10",
  replan: "bg-purple-500/10",
  skill: "bg-cyan-500/10",
  agent: "bg-orange-500/10",
  routing: "bg-teal-500/10",
  system: "bg-muted/50",
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
  return `${Math.round(diff / 3600000)}h ago`;
}

export function ActivitySidebar() {
  const { events, visible, toggleVisible, clear } = useActivityStore();

  if (!visible) return null;

  return (
    <div className="fixed right-0 top-0 h-screen w-72 bg-card border-l border-border z-40 flex flex-col shadow-2xl">
      {/* Header */}
      <div className="h-14 border-b border-border flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h2 className="font-bold text-sm">Activity</h2>
          <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {events.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={clear}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button
            onClick={toggleVisible}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Events */}
      <div className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-6">
            <Activity className="w-8 h-8 text-muted-foreground/20 mb-3" />
            <p className="text-xs text-center">No activity yet. Events appear here when systems are used.</p>
          </div>
        ) : (
          <div className="py-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="px-3 py-2 hover:bg-muted/30 transition-colors border-b border-border/30"
              >
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 w-6 h-6 rounded-md ${typeBg[event.type]} flex items-center justify-center text-xs`}>
                    {event.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={`text-[11px] font-medium ${typeColors[event.type]}`}>
                        {event.label}
                      </span>
                      <span className="text-[9px] font-mono text-muted-foreground/50 shrink-0">
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                    {event.detail && (
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                        {event.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer stats */}
      {events.length > 0 && (
        <div className="px-3 py-2 border-t border-border flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(
            events.reduce((acc, e) => {
              acc[e.type] = (acc[e.type] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
          )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([type, count]) => (
              <span
                key={type}
                className={`text-[9px] font-mono ${typeColors[type as ActivityType]}`}
              >
                {type.replace("_", " ")}: {count}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

/** Toggle button for the topbar */
export function ActivityToggle() {
  const { visible, toggleVisible, events } = useActivityStore();
  const recentCount = events.filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 60000,
  ).length;

  return (
    <button
      onClick={toggleVisible}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-colors ${
        visible
          ? "bg-primary/10 border-primary/30 text-primary"
          : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30"
      }`}
      title="Toggle activity feed"
    >
      <Activity className="w-3.5 h-3.5" />
      {recentCount > 0 && (
        <span className="font-mono text-[9px] bg-primary/20 text-primary px-1 rounded">
          {recentCount}
        </span>
      )}
    </button>
  );
}
