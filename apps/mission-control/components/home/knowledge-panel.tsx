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
import type { KBFile, KBIndex, KBEntry, KBCategory, KBScope } from "@/types";
import { useAppStore } from "@/lib/stores/app-store";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const CATEGORY_META: Record<string, { label: string; icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  "failure-patterns": { label: "Failures", icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
  "security-playbook": { label: "Security", icon: Shield, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  "success-patterns": { label: "Success", icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  "architecture-patterns": { label: "Architecture", icon: Cpu, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  "tech-decisions": { label: "Tech", icon: Lightbulb, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200" },
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-rose-50 text-rose-700 border-rose-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-100 text-slate-600 border-slate-200",
};

function buildUrl(base: string, params: Record<string, string | undefined>): string {
  const url = new URL(base, "http://localhost");
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) url.searchParams.set(k, v);
  }
  return `${url.pathname}${url.search}`;
}

export function KnowledgePanel() {
  const activeProjectId = useAppStore((s) => s.activeProjectId);
  const [scope, setScope] = useState<KBScope>("global");
  const [selectedCategory, setSelectedCategory] = useState<KBCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const isProjectMode = scope === "project" && !!activeProjectId;
  const scopeParams = isProjectMode ? { projectId: activeProjectId!, scope: "project" as const } : {};

  const indexUrl = buildUrl("/api/knowledge-base", scopeParams);
  const { data: indexData, mutate: revalidateIndex } = useSWR<{ data: KBIndex }>(indexUrl, fetcher, { revalidateOnFocus: false });

  const categoryUrl = selectedCategory ? buildUrl("/api/knowledge-base", { category: selectedCategory, ...scopeParams }) : null;
  const { data: categoryData } = useSWR<{ data: KBFile | { project: KBFile | null; global: KBFile | null } }>(categoryUrl, fetcher, { revalidateOnFocus: false });

  const searchUrl = searchQuery.length >= 2 ? buildUrl("/api/knowledge-base", { q: encodeURIComponent(searchQuery), ...scopeParams }) : null;
  const { data: searchData } = useSWR<{ data: KBEntry[]; total: number }>(searchUrl, fetcher, { revalidateOnFocus: false });

  const rawIndex = indexData?.data;
  const index = (rawIndex && "global" in rawIndex) ? (rawIndex as any).global as KBIndex : rawIndex as KBIndex | undefined;

  const entries = searchQuery.length >= 2
    ? searchData?.data || []
    : (() => {
        const cd = categoryData?.data;
        if (!cd) return [];
        if ("project" in cd) {
          const pe = ((cd as any).project as KBFile | null)?.entries || [];
          const ge = ((cd as any).global as KBFile | null)?.entries || [];
          const seen = new Set(pe.map((e: KBEntry) => e.id));
          return [...pe.map((e: KBEntry) => ({ ...e, _layer: "project" })), ...ge.filter((e: KBEntry) => !seen.has(e.id)).map((e: KBEntry) => ({ ...e, _layer: "global" }))];
        }
        return (cd as KBFile)?.entries || [];
      })();

  const handlePromoteToGlobal = async (entry: KBEntry) => {
    try {
      const res = await fetch("/api/knowledge-base/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: activeProjectId, entryId: entry.id, category: selectedCategory }),
      });
      if (res.ok) revalidateIndex();
    } catch (err) {
      console.error("[KB] Promote failed:", err);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-violet-500" />
          <span className="text-sm font-semibold text-slate-900">Knowledge Base</span>
          <span className="font-mono text-xs text-slate-400">{index?.totalEntries || 0} entries</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Scope toggle */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
            <button
              onClick={() => { setScope("global"); setSelectedCategory(null); setSearchQuery(""); }}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${scope === "global" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`}
            >
              <Globe className="w-3 h-3" />
              Global
            </button>
            {activeProjectId && (
              <button
                onClick={() => { setScope("project"); setSelectedCategory(null); setSearchQuery(""); }}
                className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${scope === "project" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`}
              >
                <FolderOpen className="w-3 h-3" />
                Project
              </button>
            )}
          </div>
          <button onClick={() => revalidateIndex()} className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" aria-label="Validate KB">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search + categories */}
      <div className="px-4 py-2 space-y-2 border-b border-slate-100">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); if (e.target.value) setSelectedCategory(null); }}
            placeholder="Search entries..."
            className="w-full border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300"
          />
        </div>
        <div className="flex gap-1.5">
          {index?.categories?.map((cat) => {
            const meta = CATEGORY_META[cat.category] || { label: cat.category, icon: Hash, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };
            const Icon = meta.icon;
            const isActive = selectedCategory === cat.category;
            return (
              <button
                key={cat.category}
                onClick={() => { setSelectedCategory(isActive ? null : cat.category as KBCategory); setSearchQuery(""); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-colors ${
                  isActive ? `${meta.bg} ${meta.border} ${meta.color}` : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3 h-3" />
                {meta.label}
                <span className="font-mono">{cat.entryCount}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto">
        {(selectedCategory || searchQuery.length >= 2) ? (
          <div className="divide-y divide-slate-100">
            {entries.map((entry) => {
              const isExpanded = expandedEntry === entry.id;
              const layer = (entry as any)._layer as string | undefined;
              return (
                <div key={entry.id} className="hover:bg-slate-50 transition-colors">
                  <button
                    onClick={() => setExpandedEntry(isExpanded ? null : entry.id)}
                    className="w-full px-4 py-2.5 text-left flex items-start gap-2"
                  >
                    {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-xs text-slate-800">{entry.title}</span>
                        <span className={`px-1 py-0.5 rounded text-[9px] font-mono border ${SEVERITY_COLORS[entry.severity]}`}>{entry.severity}</span>
                        {layer && <span className={`px-1 py-0.5 rounded text-[9px] font-mono ${layer === "project" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"}`}>{layer}</span>}
                      </div>
                      {!isExpanded && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{entry.content.slice(0, 100)}</p>}
                    </div>
                    <span className="text-[9px] font-mono text-slate-300 shrink-0">{entry.source}</span>
                  </button>
                  {isExpanded && (
                    <div className="px-10 pb-3 space-y-2">
                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                      <div className="flex flex-wrap gap-1">
                        {entry.tags.map((tag) => <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 text-[9px] font-mono text-slate-500">{tag}</span>)}
                      </div>
                      <div className="flex items-center gap-3 text-[9px] font-mono text-slate-400">
                        {entry.agentId && <span>Agent: {entry.agentId}</span>}
                        <span>v{entry.version}</span>
                        <span>{new Date(entry.updatedAt).toLocaleDateString("en-US")}</span>
                      </div>
                      {isProjectMode && (
                        <button onClick={(e) => { e.stopPropagation(); handlePromoteToGlobal(entry); }} className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-violet-600 hover:bg-violet-50 transition-colors">
                          <ArrowUp className="w-3 h-3" /> Promote to Global
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {entries.length === 0 && <div className="px-4 py-8 text-center text-xs text-slate-400">No entries found</div>}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <BookMarked className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <div className="text-sm text-slate-400">Select a category or search</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
