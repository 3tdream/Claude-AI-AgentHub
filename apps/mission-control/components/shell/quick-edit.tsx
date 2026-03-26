"use client";

import { useState } from "react";
import { Search, Replace, Check, X, FileCode2, AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";

interface SearchResult {
  filePath: string;
  lineNumber: number;
  line: string;
  context: string;
}

export function QuickEdit({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { activeProjectId } = useAppStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [newText, setNewText] = useState("");
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const projectLabel = activeProjectId || "mission-control";

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults([]);
    setSelectedResult(null);
    setApplied(null);
    setError(null);
    try {
      const res = await fetch("/api/quick-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "search", query, projectId: activeProjectId }),
      });
      const data = await res.json();
      setResults(data.data || []);
    } catch {
      setError("Search failed");
    }
    setSearching(false);
  };

  const handleSelect = (result: SearchResult) => {
    setSelectedResult(result);
    setNewText(result.line.includes(query) ? result.line.replace(query, "") : "");
    setApplied(null);
    setError(null);
  };

  const handleApply = async () => {
    if (!selectedResult || !query) return;
    setApplying(true);
    setError(null);
    try {
      const res = await fetch("/api/quick-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          filePath: selectedResult.filePath,
          oldText: query,
          newText,
          projectId: activeProjectId,
        }),
      });
      const data = await res.json();
      if (data.data?.success) {
        setApplied(`Applied to ${selectedResult.filePath}:${selectedResult.lineNumber}`);
      } else {
        setError(data.error || "Apply failed");
      }
    } catch {
      setError("Apply failed");
    }
    setApplying(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div
        className="bg-card border border-border rounded-xl w-[600px] max-h-[70vh] shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Replace className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm">Quick Edit</h3>
            <span className="font-mono text-[9px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              {projectLabel}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-border space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                placeholder="Find text in project..."
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !query.trim()}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 disabled:opacity-30"
            >
              {searching ? "..." : "Find"}
            </button>
          </div>

          {selectedResult && (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Replace className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleApply(); }}
                  placeholder="Replace with..."
                  className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <button
                onClick={handleApply}
                disabled={applying}
                className="px-4 py-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-medium hover:bg-emerald-500/20 disabled:opacity-30"
              >
                {applying ? "..." : "Apply"}
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {results.length > 0 && (
            <div className="divide-y divide-border">
              {results.map((r, i) => (
                <button
                  key={`${r.filePath}-${r.lineNumber}-${i}`}
                  onClick={() => handleSelect(r)}
                  className={`w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors ${
                    selectedResult?.filePath === r.filePath && selectedResult?.lineNumber === r.lineNumber
                      ? "bg-primary/5 border-l-2 border-primary"
                      : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    <span className="font-mono text-[11px] text-primary">{r.filePath}</span>
                    <span className="font-mono text-[9px] text-muted-foreground">:{r.lineNumber}</span>
                  </div>
                  <p className="font-mono text-[10px] text-foreground/70 mt-1 truncate">{r.line}</p>
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && query && !searching && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No results for "{query}"
            </div>
          )}
        </div>

        {/* Status bar */}
        {(applied || error) && (
          <div className={`px-4 py-2 border-t border-border flex items-center gap-2 text-xs ${
            applied ? "text-emerald-400" : "text-red-400"
          }`}>
            {applied ? <Check className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            {applied || error}
          </div>
        )}
      </div>
    </div>
  );
}
