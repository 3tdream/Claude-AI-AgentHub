"use client";

import { AlertTriangle, RefreshCw, BookOpen, Bug, FolderX, Scissors, Wrench, HelpCircle } from "lucide-react";

export interface InvestigationData {
  diagnosis: string;
  category: "wrong_directory" | "no_edits" | "truncation" | "tool_error" | "low_quality" | "unknown";
  severity: "fixable" | "needs_context" | "fundamental";
  correction: string;
  shouldRetry: boolean;
  matchedKBPatterns: string[];
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon: typeof Bug }> = {
  wrong_directory: { label: "Wrong Directory", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: FolderX },
  no_edits: { label: "No Edits", color: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Bug },
  truncation: { label: "Truncation", color: "text-violet-400 bg-violet-500/10 border-violet-500/20", icon: Scissors },
  tool_error: { label: "Tool Error", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: Wrench },
  low_quality: { label: "Low Quality", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: AlertTriangle },
  unknown: { label: "Unknown", color: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: HelpCircle },
};

const SEVERITY_COLOR: Record<string, string> = {
  fixable: "text-emerald-400",
  needs_context: "text-amber-400",
  fundamental: "text-red-400",
};

export function InvestigationCard({ investigation }: { investigation: InvestigationData }) {
  const config = CATEGORY_CONFIG[investigation.category] || CATEGORY_CONFIG.unknown;
  const Icon = config.icon;

  return (
    <div className="mt-2 rounded-lg border border-border/50 bg-muted/20 p-2.5 space-y-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-medium border ${config.color}`}>
          <Icon className="w-2.5 h-2.5" />
          {config.label}
        </span>
        <span className={`font-mono text-[9px] ${SEVERITY_COLOR[investigation.severity] || "text-muted-foreground"}`}>
          {investigation.severity}
        </span>
        {investigation.shouldRetry && (
          <span className="inline-flex items-center gap-0.5 font-mono text-[9px] text-blue-400">
            <RefreshCw className="w-2.5 h-2.5" />
            retry triggered
          </span>
        )}
      </div>
      <p className="font-mono text-[10px] text-foreground/80 leading-relaxed">
        {investigation.diagnosis}
      </p>
      {investigation.matchedKBPatterns.length > 0 && (
        <div className="flex items-start gap-1 pt-0.5">
          <BookOpen className="w-2.5 h-2.5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {investigation.matchedKBPatterns.map((p, i) => (
              <span key={i} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/5 text-primary/70 border border-primary/10">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
