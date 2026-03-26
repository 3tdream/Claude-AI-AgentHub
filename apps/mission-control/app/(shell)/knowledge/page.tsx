"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  BookMarked,
  Search,
  AlertTriangle,
  Shield,
  CheckCircle2,
  Lightbulb,
  Cpu,
  ChevronDown,
  ChevronRight,
  Hash,
  RefreshCw,
  Globe,
  FolderOpen,
  ArrowUp,
} from "lucide-react";
import type { KBFile, KBIndex, KBEntry, KBCategory } from "@/types";
import { useAppStore } from "@/lib/stores/app-store";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type KBScope = "global" | "project";

const CATEGORY_META: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string }> = {
  "failure-patterns": { label: "Failure Patterns", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  "security-playbook": { label: "Security Playbook", icon: Shield, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
  "success-patterns": { label: "Success Patterns", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  "architecture-patterns": { label: "Architecture", icon: Cpu, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  "tech-decisions": { label: "Tech Decisions", icon: Lightbulb, color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-300 border-red-500/30",
  high: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  medium: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  low: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const LAYER_BADGE: Record<string, string> = {
  project: "bg-violet-500/20 text-violet-300 border-violet-500/30",
  global: "bg-blue-500/20 text-blue-300 border-blue-500/30",
};

function buildUrl(base: string, params: Record<string, string | undefined>): string {
  const url = new URL(base, "http://localhost");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  return `${url.pathname}${url.search}`;
}

export default function KnowledgePage() {
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const [scope, setScope] = useState<KBScope>("global");
  const [selectedCategory, setSelectedCategory] = useState<KBCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const isProjectMode = scope === "project" && !!activeProjectId;

  const scopeParams = isProjectMode
    ? { projectId: activeProjectId!, scope: "project" as const }
    : {};

  // Fetch index
  const indexUrl = buildUrl("/api/knowledge-base", scopeParams);
  const { data: indexData, mutate: revalidateIndex } = useSWR<{ data: KBIndex }>(
    indexUrl,
    fetcher,
    { revalidateOnFocus: false },
  );

  // Fetch category
  const categoryUrl = selectedCategory
    ? buildUrl("/api/knowledge-base", { category: selectedCategory, ...scopeParams })
    : null;
  const { data: categoryData } = useSWR<{ data: KBFile }>(
    categoryUrl,
    fetcher,
    { revalidateOnFocus: false },
  );

  // Search
  const searchUrl = searchQuery.length >= 2
    ? buildUrl("/api/knowledge-base", { q: encodeURIComponent(searchQuery), ...scopeParams })
    : null;
  const { data: searchData } = useSWR<{ data: KBEntry[]; total: number }>(
    searchUrl,
    fetcher,
    { revalidateOnFocus: false },
  );

  const index = indexData?.data;
  const entries = searchQuery.length >= 2
    ? searchData?.data || []
    : categoryData?.data?.entries || [];

  const handleValidate = async () => {
    await fetch("/api/knowledge-base/validate");
    revalidateIndex();
  };

  const handlePromoteToGlobal = async (entry: KBEntry) => {
    try {
      const res = await fetch("/api/knowledge-base/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: activeProjectId,
          entryId: entry.id,
          category: (entry as any).category || selectedCategory,
        }),
      });
      if (res.ok) {
        console.log(`[KB] Promoted entry "${entry.title}" to global scope`);
      } else {
        console.error(`[KB] Failed to promote entry: ${res.status}`);
      }
    } catch (err) {
      console.error("[KB] Promote error:", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Knowledge Base</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            {index?.totalEntries || 0} entries · {index?.categories?.length || 0} categories
            {index && !index.integrityOk && (
              <span className="text-red-400 ml-2">integrity violation</span>
            )}
          </p>
        </div>
        <button
          onClick={handleValidate}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Validate Hashes
        </button>
      </div>

      {/* Scope toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => { setScope("global"); setSelectedCategory(null); setSearchQuery(""); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            scope === "global"
              ? "bg-blue-500/10 border-blue-500/20 text-blue-400 ring-1 ring-primary/30"
              : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          Global
        </button>
        {activeProjectId && (
          <button
            onClick={() => { setScope("project"); setSelectedCategory(null); setSearchQuery(""); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              scope === "project"
                ? "bg-violet-500/10 border-violet-500/20 text-violet-400 ring-1 ring-primary/30"
                : "border-border text-muted-foreground hover:text-foreground hover:border-primary/20"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Project: {activeProjectId}
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setSelectedCategory(null); }}
          placeholder="Search KB entries (title, content, tags)..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
        />
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-5 gap-3">
        {index?.categories?.map((cat) => {
          const meta = CATEGORY_META[cat.category] || { label: cat.category, icon: Hash, color: "text-muted-foreground", bg: "bg-muted border-border" };
          const Icon = meta.icon;
          const isActive = selectedCategory === cat.category;
          return (
            <button
              key={cat.category}
              onClick={() => { setSelectedCategory(isActive ? null : cat.category as KBCategory); setSearchQuery(""); }}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive ? `${meta.bg} ring-1 ring-primary/30` : "bg-card border-border hover:border-primary/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${meta.color}`} />
                <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${isActive ? meta.color : "text-muted-foreground"}`}>
                  {meta.label}
                </span>
              </div>
              <p className="text-2xl font-extrabold">{cat.entryCount}</p>
              <div className="flex items-center gap-2 mt-1">
                {cat.stale && (
                  <span className="text-[9px] text-amber-400 font-mono">STALE</span>
                )}
                <span className="text-[9px] text-muted-foreground font-mono">
                  {new Date(cat.lastUpdated).toLocaleDateString()}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Entries list */}
      {(selectedCategory || searchQuery.length >= 2) && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm">
              {searchQuery.length >= 2
                ? `Search results: "${searchQuery}" (${entries.length})`
                : `${CATEGORY_META[selectedCategory!]?.label} (${entries.length})`
              }
            </h3>
          </div>
          <div className="divide-y divide-border">
            {entries.map((entry) => {
              const isExpanded = expandedEntry === entry.id;
              const layer = (entry as any)._layer as string | undefined;
              return (
                <div key={entry.id} className="hover:bg-muted/30 transition-colors">
                  <button
                    onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                    className="w-full px-4 py-3 text-left flex items-start gap-3"
                  >
                    {isExpanded
                      ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    }
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{entry.title}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${SEVERITY_COLORS[entry.severity]}`}>
                          {entry.severity}
                        </span>
                        {isProjectMode && layer && (
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono border ${LAYER_BADGE[layer] || LAYER_BADGE.global}`}>
                            {layer}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-muted-foreground">v{entry.version}</span>
                      </div>
                      {!isExpanded && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{entry.content.slice(0, 120)}</p>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-muted-foreground shrink-0">
                      {entry.source}
                    </span>
                  </button>
                  {isExpanded && (
                    <div className="px-11 pb-4 space-y-3">
                      <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] font-mono text-muted-foreground">
                        {entry.agentId && <span>Agent: {entry.agentId}</span>}
                        {entry.pipelineRunId && <span>Run: {entry.pipelineRunId}</span>}
                        <span>Created: {new Date(entry.createdAt).toLocaleDateString()}</span>
                        <span>Updated: {new Date(entry.updatedAt).toLocaleDateString()}</span>
                      </div>
                      {isProjectMode && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handlePromoteToGlobal(entry); }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                          Promote to Global
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {entries.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                {searchQuery.length >= 2 ? "No entries match your search" : "Select a category to view entries"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
