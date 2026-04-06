"use client";

import { useState } from "react";
import useSWR from "swr";
import { Network, Search, Filter, Loader2, Boxes, Info } from "lucide-react";
import { ForceGraphView } from "@/components/knowledge-map/force-graph";
import { ArchGraphView } from "@/components/knowledge-map/arch-graph";
import { RelationsPanel } from "@/components/knowledge-map/relations-panel";
import type { GraphNode } from "@/app/api/knowledge-map/route";
import type { ArchNode } from "@/app/api/knowledge-map/architecture/route";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type ViewMode = "knowledge" | "architecture";

const KB_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  skill: { label: "Skills", color: "#6366f1" },
  agent: { label: "Agents", color: "#10b981" },
  kb: { label: "KB Entries", color: "#f59e0b" },
};

const ARCH_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  page: { label: "Pages", color: "#3b82f6" },
  api: { label: "APIs", color: "#8b5cf6" },
  store: { label: "Stores", color: "#f59e0b" },
  lib: { label: "Libs", color: "#10b981" },
  data: { label: "Data", color: "#6366f1" },
  external: { label: "External", color: "#ef4444" },
};

const KB_LEGEND = [
  { label: "Conflict", color: "#ef4444", dashed: true },
  { label: "Team", color: "#10b981", dashed: false },
  { label: "Agent-Skill", color: "#6366f1", dashed: false },
  { label: "KB link", color: "#f59e0b", dashed: false },
];

const ARCH_LEGEND = [
  { label: "Calls", color: "#8b5cf6", dashed: false },
  { label: "Uses", color: "#10b981", dashed: false },
  { label: "Reads", color: "#3b82f6", dashed: false },
  { label: "Writes", color: "#ef4444", dashed: false },
  { label: "Feeds", color: "#f59e0b", dashed: true },
  { label: "Proxies", color: "#ec4899", dashed: false },
];

export default function KnowledgeMapPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("knowledge");
  const { data: kbData, isLoading: kbLoading, error: kbError } = useSWR("/api/knowledge-map", fetcher, { revalidateOnFocus: false });
  const { data: archData, isLoading: archLoading, error: archError } = useSWR("/api/knowledge-map/architecture", fetcher, { revalidateOnFocus: false });

  const [kbFilter, setKbFilter] = useState<Set<string>>(new Set(["skill", "agent", "kb"]));
  const [archFilter, setArchFilter] = useState<Set<string>>(new Set(["page", "api", "store", "lib", "data", "external"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | ArchNode | null>(null);
  const [showRelations, setShowRelations] = useState(true);

  const isKb = viewMode === "knowledge";
  const data = isKb ? kbData : archData;
  const isLoading = isKb ? kbLoading : archLoading;
  const error = isKb ? kbError : archError;
  const filter = isKb ? kbFilter : archFilter;
  const typeLabels = isKb ? KB_TYPE_LABELS : ARCH_TYPE_LABELS;
  const legend = isKb ? KB_LEGEND : ARCH_LEGEND;

  const toggleFilter = (type: string) => {
    const setter = isKb ? setKbFilter : setArchFilter;
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        if (next.size > 1) next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  };

  const statsText = isKb && data?.stats
    ? `${data.stats.skills}S / ${data.stats.agents}A / ${data.stats.kb}KB / ${data.stats.links}L`
    : !isKb && data?.stats
    ? `${data.stats.pages}P / ${data.stats.apis}A / ${data.stats.stores}S / ${data.stats.libs}L / ${data.stats.data}D / ${data.stats.externals}X — ${data.stats.links} links`
    : "";

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] -m-6">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border">
        <div className="flex items-center gap-3">
          {/* View mode switcher */}
          <div className="flex items-center bg-muted rounded-lg p-0.5">
            <button
              onClick={() => { setViewMode("knowledge"); setSelectedNode(null); setSearchQuery(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all ${
                isKb ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              Knowledge
            </button>
            <button
              onClick={() => { setViewMode("architecture"); setSelectedNode(null); setSearchQuery(""); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all ${
                !isKb ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              Architecture
            </button>
          </div>

          {statsText && (
            <span className="font-mono text-[10px] text-muted-foreground">{statsText}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="pl-8 pr-3 py-1.5 text-xs font-mono bg-muted border border-border rounded-md w-48 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            />
          </div>

          {/* Relations panel toggle */}
          <button
            onClick={() => setShowRelations((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all ${
              showRelations
                ? "bg-indigo-500 text-white shadow-sm"
                : "text-muted-foreground border border-border hover:text-foreground hover:bg-muted"
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            Model
          </button>

          {/* Type filters */}
          <div className="flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
            {Object.entries(typeLabels).map(([type, { label, color }]) => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`px-2 py-1 rounded text-[11px] font-mono font-medium transition-all ${
                  filter.has(type)
                    ? "text-white shadow-sm"
                    : "text-muted-foreground bg-muted hover:bg-muted/80"
                }`}
                style={filter.has(type) ? { backgroundColor: color } : undefined}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Graph area */}
      <div className="flex-1 relative bg-slate-950 overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
            <span className="ml-2 text-sm text-slate-400">Loading graph...</span>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm text-red-400">Failed to load graph</span>
          </div>
        )}
        {data?.success && isKb && (
          <ForceGraphView
            nodes={data.nodes}
            links={data.links}
            filter={kbFilter}
            searchQuery={searchQuery}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        )}
        {data?.success && !isKb && (
          <ArchGraphView
            nodes={data.nodes}
            links={data.links}
            filter={archFilter}
            searchQuery={searchQuery}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        )}
        {showRelations && (
          <RelationsPanel viewMode={viewMode} onClose={() => setShowRelations(false)} />
        )}
      </div>

      {/* Selected node detail bar */}
      {selectedNode && (
        <div className="border-t border-border bg-card px-6 py-3 flex items-center gap-4">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: typeLabels[selectedNode.type]?.color }} />
          <div>
            <span className="font-mono text-xs font-bold">{selectedNode.name}</span>
            <span className="font-mono text-[10px] text-muted-foreground ml-2">
              {selectedNode.type} / {selectedNode.group}
            </span>
          </div>
          {"description" in selectedNode && selectedNode.description && (
            <span className="font-mono text-[10px] text-muted-foreground ml-2">{selectedNode.description}</span>
          )}
          {"meta" in selectedNode && selectedNode.meta?.domains != null && (
            <div className="flex gap-1 ml-4">
              {(selectedNode.meta.domains as string[]).map((d: string) => (
                <span key={d} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">{d}</span>
              ))}
            </div>
          )}
          {"meta" in selectedNode && selectedNode.meta?.tags != null && (
            <div className="flex gap-1 ml-4">
              {(selectedNode.meta.tags as string[]).slice(0, 5).map((t: string) => (
                <span key={t} className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400">{t}</span>
              ))}
            </div>
          )}
          <button onClick={() => setSelectedNode(null)} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Close</button>
        </div>
      )}

      {/* Legend */}
      <div className="border-t border-border bg-card/50 px-6 py-2 flex items-center gap-6">
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Nodes:</span>
        <div className="flex items-center gap-3">
          {Object.entries(typeLabels).map(([, { label, color }]) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide ml-4">Links:</span>
        <div className="flex items-center gap-3">
          {legend.map(({ label, color, dashed }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color, borderStyle: dashed ? "dashed" : "solid" }} />
              <span className="font-mono text-[10px] text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
