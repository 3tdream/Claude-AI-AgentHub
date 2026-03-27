"use client";

import { CommandBar } from "@/components/shell/command-bar";
import { useAppStore } from "@/lib/stores/app-store";
import { Terminal, Zap, GitBranch, Layers } from "lucide-react";

export default function CommandPage() {
  const { activeProjectId } = useAppStore();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
          <Terminal className="w-8 h-8 text-primary" />
          Command
        </h1>
        <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
          One input — Claude decides how to execute
          {activeProjectId && ` · targeting ${activeProjectId}`}
        </p>
      </div>

      {/* Command Bar */}
      <CommandBar />

      {/* How it works */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase">Direct</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Simple edits, renames, fixes. Claude executes immediately with file tools.
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
            "rename X to Y" · "fix color" · "add import"
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <GitBranch className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-[10px] font-bold text-blue-400 uppercase">Pipeline</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Complex features, security, multi-stage. Redirects to Orchestration pipeline.
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
            "build auth system" · "add payment flow"
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-violet-400" />
            <span className="font-mono text-[10px] font-bold text-violet-400 uppercase">Hybrid</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Claude handles quick parts, pipeline handles heavy lifting. Best of both.
          </p>
          <p className="text-[10px] text-muted-foreground/50 mt-2 font-mono">
            "add component + API endpoint"
          </p>
        </div>
      </div>
    </div>
  );
}
