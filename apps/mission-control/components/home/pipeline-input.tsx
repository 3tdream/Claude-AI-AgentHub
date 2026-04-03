"use client";

import { GitBranch, FileDown, Link2, Play, BookTemplate } from "lucide-react";
import { InvestigationCard } from "@/components/orchestration/investigation-card";
import type { InvestigationData } from "@/components/orchestration/investigation-card";
import type { RoutingDecisionData, Workflow } from "@/types";

export interface PipelineInputResult {
  type: "direct" | "pipeline" | "error";
  response?: string;
  toolCalls?: { name: string; path?: string; success: boolean }[];
  message?: string;
  intent?: { intent: string; confidence: number; reason: string };
  investigation?: InvestigationData;
  jiraKey?: string;
  // Task tracking
  taskId?: string;
  userInput?: string;
  status?: "success" | "partial" | "failed" | "no-edit";
}

export interface PipelineInputProps {
  input: string;
  loading: boolean;
  executing: boolean;
  routingLoading: boolean;
  result: PipelineInputResult | null;
  routingDecision: RoutingDecisionData | null;
  workflows: Workflow[];
  onInputChange: (value: string) => void;
  onExecute: () => void;
  onExportResult: () => void;
  onClearResult: () => void;
  onConfirmAndExecute: () => void;
  onCancelRouting: () => void;
}

export function PipelineInput({
  input,
  loading,
  executing,
  routingLoading,
  result,
  routingDecision,
  workflows,
  onInputChange,
  onExecute,
  onExportResult,
  onClearResult,
  onConfirmAndExecute,
  onCancelRouting,
}: PipelineInputProps) {
  return (
    <>
      {/* Pipeline tab — result area */}
      <div className="flex-1 overflow-y-auto p-4">
        {result ? (
          <div className="space-y-3">
            {/* User input (what was asked) */}
            {result.userInput && (
              <div className="bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                  {result.taskId && (
                    <span className="font-mono text-[9px] text-slate-400">#{result.taskId}</span>
                  )}
                  <span className="text-[10px] text-slate-400">Your request:</span>
                </div>
                <p className="text-xs text-slate-700">{result.userInput}</p>
              </div>
            )}

            {/* Top row: intent + status + actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {result.intent && (
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    result.type === "direct" ? "bg-emerald-50 text-emerald-600" : result.type === "pipeline" ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {result.intent.intent.toUpperCase()}
                  </span>
                )}
                {/* Task status badge */}
                {result.status && (
                  <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    result.status === "success" ? "bg-emerald-50 text-emerald-700" :
                    result.status === "partial" ? "bg-amber-50 text-amber-700" :
                    result.status === "no-edit" ? "bg-slate-100 text-slate-600" :
                    "bg-rose-50 text-rose-700"
                  }`}>
                    {result.status === "success" ? "✓ DONE" :
                     result.status === "partial" ? "⚠ PARTIAL" :
                     result.status === "no-edit" ? "— NO CHANGES" :
                     "✗ FAILED"}
                  </span>
                )}
                {result.intent && (
                  <span className="text-xs text-slate-400">{result.intent.reason}</span>
                )}
                {result.jiraKey && (
                  <a
                    href={`/jira?issue=${result.jiraKey}`}
                    className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Link2 className="w-2.5 h-2.5" />
                    {result.jiraKey}
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={onExportResult} className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Export JSON">
                  <FileDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Tool calls */}
            {result.toolCalls && result.toolCalls.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {result.toolCalls.map((tc, i) => (
                  <span key={i} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${
                    tc.success ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                  }`}>
                    {tc.name}{tc.path && <span className="text-slate-400">{tc.path.split("/").pop()}</span>}
                  </span>
                ))}
              </div>
            )}

            {/* Direct response */}
            {result.response && (
              <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50 rounded-lg p-4 max-h-80 overflow-y-auto">
                {result.response}
              </div>
            )}

            {/* Investigation card */}
            {result.investigation && (
              <InvestigationCard investigation={result.investigation} />
            )}

            {/* Pipeline routing preview + confirm */}
            {result.type === "pipeline" && routingDecision && (
              <div className="space-y-3 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100">
                {/* Mode + complexity */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-semibold text-indigo-700">
                      {routingDecision.mode === "quick" ? "Quick" : routingDecision.mode === "full" ? "Full Pipeline" : "Medium"} Mode
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">complexity {routingDecision.complexity}/10</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{routingDecision.estimatedDuration}</span>
                </div>

                {/* Simulation bar */}
                {routingDecision.simulation && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-medium text-slate-600">Preflight Simulation</span>
                      <span className={`text-[10px] font-bold ${
                        routingDecision.simulation.overallProbability >= 70 ? "text-emerald-600" :
                        routingDecision.simulation.overallProbability >= 45 ? "text-amber-600" : "text-rose-600"
                      }`}>
                        {routingDecision.simulation.overallProbability}% success
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          routingDecision.simulation.overallProbability >= 70 ? "bg-emerald-500" :
                          routingDecision.simulation.overallProbability >= 45 ? "bg-amber-500" : "bg-rose-500"
                        }`}
                        style={{ width: `${routingDecision.simulation.overallProbability}%` }}
                      />
                    </div>
                    {/* Bottlenecks */}
                    {routingDecision.simulation.bottlenecks?.length > 0 && (
                      <div className="mt-1.5 space-y-0.5">
                        {routingDecision.simulation.bottlenecks.slice(0, 3).map((b: { stageId: string; probability: number; reason: string }) => (
                          <div key={b.stageId} className="flex items-center gap-1 text-[9px] text-slate-500">
                            <span className="text-amber-500">!</span>
                            <span className="font-medium">{b.stageId}</span>
                            <span>{b.probability}% — {b.reason.length > 50 ? b.reason.slice(0, 50) + "..." : b.reason}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Selected agents */}
                {routingDecision.selectedStepIds && (
                  <div className="flex flex-wrap gap-1">
                    {routingDecision.selectedStepIds.map((id: string) => (
                      <span key={id} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-600">{id}</span>
                    ))}
                  </div>
                )}

                {/* Reasoning */}
                <p className="text-[11px] text-slate-600">{routingDecision.reasoning}</p>

                {/* Confirm & Execute */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onConfirmAndExecute}
                    disabled={executing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                  >
                    {executing ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        Confirm &amp; Execute
                      </>
                    )}
                  </button>
                  <button
                    onClick={onCancelRouting}
                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Pipeline routing in progress */}
            {result.type === "pipeline" && routingLoading && (
              <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                <div className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                <span className="text-sm text-indigo-600">Routing task through simulation...</span>
              </div>
            )}

            {/* Error */}
            {result.type === "error" && (
              <div className="text-sm text-rose-600 bg-rose-50 rounded-lg p-3">{result.message}</div>
            )}

            <button onClick={onClearResult} className="text-xs text-slate-400 hover:text-slate-600">
              Clear
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <GitBranch className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <div className="text-sm text-slate-400 mb-1">Enter a task below</div>
              <div className="text-xs text-slate-300">Simple edits → direct execution · Complex tasks → pipeline</div>
            </div>
          </div>
        )}
      </div>

      {/* ── Sprint 2 #12: Workflow Library (compact selector) ── */}
      {workflows.length > 1 && (
        <div className="px-4 py-1.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto">
          <BookTemplate className="w-3 h-3 text-slate-400 shrink-0" />
          {workflows.slice(0, 6).map((wf) => (
            <button
              key={wf.id}
              onClick={() => { onInputChange(`Run pipeline: ${wf.name}`); }}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono text-slate-500 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 hover:border-indigo-200 transition-colors whitespace-nowrap"
            >
              {wf.isTemplate && <BookTemplate className="w-2.5 h-2.5" />}
              {wf.name.length > 20 ? wf.name.substring(0, 20) + "..." : wf.name}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onExecute(); }}
            placeholder="Describe your task..."
            disabled={loading}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 disabled:opacity-50"
          />
          <button
            onClick={onExecute}
            disabled={loading || !input.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-30 transition-colors"
          >
            {loading ? "..." : "Run"}
          </button>
        </div>
      </div>
    </>
  );
}
