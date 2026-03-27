"use client";

import { useState, useRef, useEffect } from "react";
import { Terminal, Send, Loader2, FileCode2, GitBranch, CheckCircle2, XCircle, Zap, ChevronUp, ChevronDown } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { logActivity } from "@/lib/stores/activity-store";

interface ToolCall {
  name: string;
  path?: string;
  success: boolean;
}

interface CommandResult {
  intent: { intent: string; confidence: number; reason: string; pipelineMode?: string };
  action: string;
  response?: string;
  message?: string;
  toolCalls?: ToolCall[];
  tokensUsed?: { input: number; output: number };
  error?: string;
}

export function CommandBar() {
  const { activeProjectId } = useAppStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [history, setHistory] = useState<{ input: string; result: CommandResult }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const execute = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, projectId: activeProjectId }),
      });
      const data = await res.json();

      if (data.error) {
        setResult({ intent: { intent: "error", confidence: 0, reason: data.error }, action: "error", error: data.error });
      } else {
        setResult(data);
        setHistory((prev) => [{ input, result: data }, ...prev].slice(0, 20));

        // Log to activity
        logActivity(
          data.action === "executed" ? "agent" : "routing",
          `Command: ${data.intent.intent} — ${input.substring(0, 40)}`,
          data.toolCalls?.length ? `${data.toolCalls.length} tool calls` : data.message,
        );
      }
    } catch (e) {
      setResult({ intent: { intent: "error", confidence: 0, reason: String(e) }, action: "error", error: String(e) });
    }

    setLoading(false);
    setInput("");
  };

  const intentColors: Record<string, string> = {
    direct: "text-emerald-400",
    pipeline: "text-blue-400",
    hybrid: "text-violet-400",
    error: "text-red-400",
  };

  const intentIcons: Record<string, typeof Terminal> = {
    direct: Zap,
    pipeline: GitBranch,
    hybrid: Terminal,
    error: XCircle,
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Input bar */}
      <div className="flex items-center gap-2 px-4 py-3">
        <Terminal className="w-4 h-4 text-primary shrink-0" />
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") execute(); }}
          placeholder={`Command${activeProjectId ? ` (${activeProjectId})` : ""}...`}
          disabled={loading}
          className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
        />
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <button
            onClick={execute}
            disabled={!input.trim()}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5 text-primary" />
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="border-t border-border">
          {/* Intent badge */}
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const Icon = intentIcons[result.intent.intent] || Terminal;
                return <Icon className={`w-3.5 h-3.5 ${intentColors[result.intent.intent] || ""}`} />;
              })()}
              <span className={`font-mono text-[10px] font-bold uppercase ${intentColors[result.intent.intent] || ""}`}>
                {result.intent.intent}
              </span>
              <span className="font-mono text-[9px] text-muted-foreground">
                {Math.round(result.intent.confidence * 100)}% — {result.intent.reason}
              </span>
            </div>
            <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-muted rounded">
              {expanded ? <ChevronUp className="w-3 h-3 text-muted-foreground" /> : <ChevronDown className="w-3 h-3 text-muted-foreground" />}
            </button>
          </div>

          {expanded && (
            <div className="px-4 pb-3 space-y-2">
              {/* Tool calls */}
              {result.toolCalls && result.toolCalls.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {result.toolCalls.map((tc, i) => (
                    <span
                      key={i}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono ${
                        tc.success ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {tc.success ? <CheckCircle2 className="w-2.5 h-2.5" /> : <XCircle className="w-2.5 h-2.5" />}
                      {tc.name}
                      {tc.path && <span className="text-muted-foreground/60">{tc.path.split("/").pop()}</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Response text */}
              {result.response && (
                <div className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-lg p-3 max-h-60 overflow-y-auto">
                  {result.response}
                </div>
              )}

              {/* Pipeline redirect message */}
              {result.message && result.action === "redirect_to_pipeline" && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <GitBranch className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300">{result.message}</span>
                </div>
              )}

              {/* Error */}
              {result.error && (
                <div className="text-xs text-red-400 bg-red-500/10 rounded-lg p-2">
                  {result.error}
                </div>
              )}

              {/* Tokens */}
              {result.tokensUsed && (
                <div className="font-mono text-[9px] text-muted-foreground/50">
                  {result.tokensUsed.input + result.tokensUsed.output} tokens
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
