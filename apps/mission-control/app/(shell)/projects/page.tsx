"use client";

import { useState, useCallback } from "react";
import useSWR from "swr";
import {
  FolderOpen,
  Power,
  Play,
  Square,
  ExternalLink,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Terminal,
  Plus,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/stores/app-store";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Project {
  id: string;
  name: string;
  path: string;
  port: number;
  stack: string[];
  framework: string;
  hasManifest: boolean;
  hasPackageJson: boolean;
  entrypoint: string;
  devCommand: string;
  kbScope: string[];
  fileCount: number;
  status: "active" | "inactive";
  running: boolean;
  pid?: number;
}

const frameworkColors: Record<string, string> = {
  nextjs: "bg-black text-white",
  vite: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  express: "bg-green-500/20 text-green-300 border-green-500/30",
  node: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  flask: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  unknown: "bg-muted text-muted-foreground",
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [serverLogs, setServerLogs] = useState<Record<string, string[]>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { data, mutate } = useSWR<{ data: Project[]; total: number; active: number }>(
    "/api/projects/discover",
    fetcher,
    { revalidateOnFocus: false, refreshInterval: 10000 },
  );

  const projects = data?.data || [];

  const filtered = projects.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleActive = useCallback(async (project: Project) => {
    setActionLoading(project.id);
    try {
      await fetch("/api/projects/discover", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id, active: project.status !== "active" }),
      });
      mutate();
    } finally {
      setActionLoading(null);
    }
  }, [mutate]);

  const [runningServers, setRunningServers] = useState<Record<string, boolean>>({});

  const startServer = useCallback(async (project: Project) => {
    setActionLoading(`start-${project.id}`);
    try {
      const res = await fetch("/api/projects/server", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          projectPath: project.path,
          port: project.port,
          devCommand: project.devCommand,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRunningServers((prev) => ({ ...prev, [project.id]: true }));
      }
      // Give PID time to write to file, then refresh
      setTimeout(() => mutate(), 2000);
    } finally {
      setActionLoading(null);
    }
  }, [mutate]);

  const stopServer = useCallback(async (project: Project) => {
    setActionLoading(`stop-${project.id}`);
    try {
      await fetch(`/api/projects/server?projectId=${project.id}`, { method: "DELETE" });
      setRunningServers((prev) => ({ ...prev, [project.id]: false }));
      setTimeout(() => mutate(), 1000);
    } finally {
      setActionLoading(null);
    }
  }, [mutate]);

  const fetchLogs = useCallback(async (projectId: string) => {
    const res = await fetch(`/api/projects/server?projectId=${projectId}`);
    const data = await res.json();
    setServerLogs((prev) => ({ ...prev, [projectId]: data.logs || [] }));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            {data?.total || 0} discovered · {data?.active || 0} active
          </p>
        </div>
        <button
          onClick={() => mutate()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Rescan
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
        </div>
        <div className="flex gap-1">
          {(["", "active", "inactive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-mono text-xs transition-all",
                statusFilter === f
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              {f || "All"} ({f ? projects.filter((p) => p.status === f).length : projects.length})
            </button>
          ))}
        </div>
      </div>

      {/* Project list */}
      <div className="space-y-2">
        {filtered.map((project) => {
          const isExpanded = expandedProject === project.id;
          const isActive = project.status === "active";
          const isRunning = runningServers[project.id] ?? project.running;
          const logs = serverLogs[project.id] || [];

          return (
            <div
              key={project.id}
              className={cn(
                "bg-card border rounded-xl overflow-hidden transition-all",
                isActive ? "border-emerald-500/30" : "border-border",
              )}
            >
              {/* Main row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Activate toggle */}
                <button
                  onClick={() => toggleActive(project)}
                  disabled={actionLoading === project.id}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive
                      ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                  title={isActive ? "Deactivate" : "Activate"}
                >
                  <Power className="w-4 h-4" />
                </button>

                {/* Info */}
                <button
                  onClick={() => {
                    setExpandedProject(isExpanded ? null : project.id);
                    if (!isExpanded) fetchLogs(project.id);
                  }}
                  className="flex-1 text-left flex items-center gap-4 min-w-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">{project.name}</h3>
                      <span className={cn("font-mono text-[9px] px-1.5 py-0.5 rounded border", frameworkColors[project.framework] || frameworkColors.unknown)}>
                        {project.framework}
                      </span>
                      {project.hasManifest && (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                          manifest
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{project.stack.slice(0, 4).join(" · ")}</span>
                    </div>
                  </div>
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                </button>

                {/* Port + server controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-[10px] text-muted-foreground">:{project.port}</span>

                  {isActive && !isRunning && (
                    <button
                      onClick={() => startServer(project)}
                      disabled={actionLoading === `start-${project.id}`}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] font-mono uppercase tracking-wider transition-all disabled:opacity-50"
                    >
                      <Play className="w-3 h-3" />
                      Start
                    </button>
                  )}

                  {isRunning && (
                    <>
                      <a
                        href={`http://localhost:${project.port}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-[10px] font-mono uppercase tracking-wider transition-all"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Preview
                      </a>
                      <button
                        onClick={() => stopServer(project)}
                        disabled={actionLoading === `stop-${project.id}`}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-[10px] font-mono uppercase tracking-wider transition-all disabled:opacity-50"
                      >
                        <Square className="w-3 h-3" />
                        Stop
                      </button>
                    </>
                  )}

                  {isRunning && (
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="Server running" />
                  )}
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-border space-y-4">
                  {/* Meta grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="px-3 py-2 rounded-lg bg-muted/30">
                      <span className="font-mono text-[9px] text-muted-foreground uppercase">Path</span>
                      <p className="font-mono text-[10px] text-foreground/80 truncate mt-0.5">{project.path}</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-muted/30">
                      <span className="font-mono text-[9px] text-muted-foreground uppercase">Entry</span>
                      <p className="font-mono text-[10px] text-foreground/80 mt-0.5">{project.entrypoint}</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-muted/30">
                      <span className="font-mono text-[9px] text-muted-foreground uppercase">Dev Command</span>
                      <p className="font-mono text-[10px] text-foreground/80 mt-0.5">{project.devCommand}</p>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-muted/30">
                      <span className="font-mono text-[9px] text-muted-foreground uppercase">KB Scope</span>
                      <p className="font-mono text-[10px] text-foreground/80 mt-0.5">{project.kbScope.join(", ")}</p>
                    </div>
                  </div>

                  {/* Stack tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {project.stack.map((s) => (
                      <span key={s} className="font-mono text-[9px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>

                  {/* Server logs */}
                  {(isRunning || logs.length > 0) && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Terminal className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-mono text-[10px] text-muted-foreground uppercase">Server Logs</span>
                        <button
                          onClick={() => fetchLogs(project.id)}
                          className="font-mono text-[9px] text-primary hover:text-primary/80"
                        >
                          refresh
                        </button>
                      </div>
                      <div className="bg-black/50 rounded-lg p-3 max-h-40 overflow-y-auto font-mono text-[10px] text-green-400/80 space-y-0.5">
                        {logs.length > 0 ? (
                          logs.slice(-20).map((line, i) => (
                            <div key={i} className={line.startsWith("[err]") ? "text-red-400/80" : ""}>
                              {line}
                            </div>
                          ))
                        ) : (
                          <div className="text-muted-foreground/50">No logs yet</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            {search ? `No projects matching "${search}"` : "No projects found in apps/ directory"}
          </div>
        )}
      </div>
    </div>
  );
}
