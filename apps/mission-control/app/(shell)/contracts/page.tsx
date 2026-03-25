"use client";

import { useState } from "react";
import useSWR from "swr";
import {
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  BookMarked,
  TrendingUp,
  Zap,
  Target,
} from "lucide-react";
import type { SimulationReport } from "@/lib/preflight-simulation";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ContractSummary {
  stageId: string;
  stageName: string;
  agentId: string;
  inputCount: number;
  outputCount: number;
  constraintCount: number;
  riskCount: number;
  staticConstraints: number;
  dynamicConstraints: number;
  blockingConstraints: number;
}

interface ContractDetail {
  stageId: string;
  stageName: string;
  agentId: string;
  inputs: { field: string; fromStage: string; required: boolean; description: string }[];
  outputs: { field: string; type: string; required: boolean; description: string }[];
  constraints: { id: string; rule: string; verification: string; severity: string }[];
  risks: { id: string; description: string; probability: string; impact: string; mitigation: string }[];
}

const riskColors: Record<string, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

export default function ContractsPage() {
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [simInput, setSimInput] = useState("");
  const [simResult, setSimResult] = useState<SimulationReport | null>(null);
  const [simLoading, setSimLoading] = useState(false);

  // Fetch contracts list (enriched with KB)
  const { data: contractsData } = useSWR<{ data: ContractSummary[]; total: number; _meta: { kbEntriesLoaded: number } }>(
    "/api/pipeline/contracts",
    fetcher,
    { revalidateOnFocus: false },
  );

  // Fetch detail for expanded stage
  const { data: detailData } = useSWR<{ data: ContractDetail; _meta: { kbEntriesLoaded: number; dynamicConstraints: number } }>(
    expandedStage ? `/api/pipeline/contracts?stageId=${expandedStage}` : null,
    fetcher,
    { revalidateOnFocus: false },
  );

  const contracts = contractsData?.data || [];
  const detail = detailData?.data;
  const kbLoaded = contractsData?._meta?.kbEntriesLoaded || 0;

  const totalStatic = contracts.reduce((s, c) => s + c.staticConstraints, 0);
  const totalDynamic = contracts.reduce((s, c) => s + c.dynamicConstraints, 0);
  const totalBlocking = contracts.reduce((s, c) => s + c.blockingConstraints, 0);

  const runSimulation = async () => {
    if (!simInput.trim()) return;
    setSimLoading(true);
    try {
      const res = await fetch("/api/pipeline/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: simInput }),
      });
      const data = await res.json();
      setSimResult(data.data);
    } catch { /* ignore */ }
    setSimLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Stage Contracts</h1>
        <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
          {contracts.length} contracts · {totalStatic} static + {totalDynamic} KB-dynamic constraints · {kbLoaded} KB entries loaded
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Contracts</span>
          </div>
          <p className="text-2xl font-extrabold">{contracts.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-blue-400" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">Blocking</span>
          </div>
          <p className="text-2xl font-extrabold">{totalBlocking}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <BookMarked className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">KB Dynamic</span>
          </div>
          <p className="text-2xl font-extrabold text-amber-400">{totalDynamic}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-[10px] text-muted-foreground uppercase">KB Entries</span>
          </div>
          <p className="text-2xl font-extrabold">{kbLoaded}</p>
        </div>
      </div>

      {/* Contracts table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-bold text-sm">Pipeline Stage Contracts</h3>
        </div>
        <div className="divide-y divide-border">
          {contracts.map((c) => {
            const isExpanded = expandedStage === c.stageId;
            return (
              <div key={c.stageId}>
                <button
                  onClick={() => setExpandedStage(isExpanded ? null : c.stageId)}
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-muted/30 transition-colors text-left"
                >
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  }
                  <span className="font-mono text-xs text-muted-foreground w-24 shrink-0">{c.stageId}</span>
                  <span className="font-medium text-sm flex-1">{c.stageName}</span>
                  <span className="font-mono text-[10px] text-muted-foreground w-20">{c.agentId.replace("-agent", "")}</span>
                  <div className="flex items-center gap-3 text-[10px] font-mono shrink-0">
                    <span className="text-muted-foreground">{c.inputCount} in</span>
                    <span className="text-muted-foreground">{c.outputCount} out</span>
                    <span className="text-blue-400">{c.staticConstraints} static</span>
                    {c.dynamicConstraints > 0 && (
                      <span className="text-amber-400 font-bold">+{c.dynamicConstraints} KB</span>
                    )}
                    <span className="text-red-400">{c.blockingConstraints} blocking</span>
                  </div>
                </button>
                {isExpanded && detail && detail.stageId === c.stageId && (
                  <div className="px-10 pb-5 space-y-4">
                    {/* Inputs */}
                    <div>
                      <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Inputs</h4>
                      <div className="space-y-1">
                        {detail.inputs.map((inp) => (
                          <div key={inp.field} className="flex items-center gap-2 text-xs">
                            <span className="font-mono text-primary w-32">{inp.field}</span>
                            <span className="text-muted-foreground">from {inp.fromStage}</span>
                            {inp.required && <span className="text-[9px] text-red-400 font-mono">REQUIRED</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Outputs */}
                    <div>
                      <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">Required Outputs</h4>
                      <div className="space-y-1">
                        {detail.outputs.map((out) => (
                          <div key={out.field} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="font-mono text-emerald-300 w-32">{out.field}</span>
                            <span className="text-muted-foreground/60">{out.type}</span>
                            <span className="text-muted-foreground">{out.description}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Constraints */}
                    <div>
                      <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                        Constraints ({detail.constraints.length})
                      </h4>
                      <div className="space-y-1">
                        {detail.constraints.map((con) => (
                          <div key={con.id} className="flex items-start gap-2 text-xs">
                            {con.severity === "blocking"
                              ? <XCircle className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                              : <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            }
                            <span className={`font-mono w-16 shrink-0 ${con.id.startsWith("KB") ? "text-amber-400" : "text-muted-foreground"}`}>
                              {con.id}
                            </span>
                            <span className={con.id.startsWith("KB") ? "text-amber-200" : ""}>{con.rule}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Risks */}
                    {detail.risks.length > 0 && (
                      <div>
                        <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                          Risks ({detail.risks.length})
                        </h4>
                        <div className="space-y-1">
                          {detail.risks.map((risk) => (
                            <div key={risk.id} className="flex items-start gap-2 text-xs">
                              <AlertTriangle className={`w-3 h-3 shrink-0 mt-0.5 ${riskColors[risk.impact] || "text-muted-foreground"}`} />
                              <span className="font-mono w-12 shrink-0 text-muted-foreground">{risk.id}</span>
                              <span>{risk.description}</span>
                              <span className="text-muted-foreground shrink-0">({risk.probability}/{risk.impact})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulation runner */}
      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-sm">Preflight Simulation</h3>
          <span className="font-mono text-[10px] text-muted-foreground">predict pipeline outcome before running</span>
        </div>
        <div className="flex gap-2">
          <input
            value={simInput}
            onChange={(e) => setSimInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") runSimulation(); }}
            placeholder="Describe the task to simulate..."
            className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          />
          <button
            onClick={runSimulation}
            disabled={simLoading || !simInput.trim()}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-30 transition-colors"
          >
            {simLoading ? "Simulating..." : "Simulate"}
          </button>
        </div>

        {/* Simulation results */}
        {simResult && (
          <div className="space-y-4 pt-2 border-t border-border">
            {/* Overall */}
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-2xl font-extrabold ${riskColors[simResult.overallRisk]}`}>
                  {simResult.overallProbability}%
                </span>
                <span className="text-sm text-muted-foreground ml-2">predicted success</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                <span>{simResult.inputAnalysis.complexityScore}</span>
                <span>{simResult.estimates.totalTokens.toLocaleString()} tok</span>
                <span>{simResult.estimates.totalDuration}</span>
                <span>{simResult.estimates.estimatedCost}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  simResult.overallProbability >= 70 ? "bg-emerald-500"
                    : simResult.overallProbability >= 45 ? "bg-amber-500"
                    : simResult.overallProbability >= 25 ? "bg-orange-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${simResult.overallProbability}%` }}
              />
            </div>

            {/* Per-stage bars */}
            <div className="space-y-1">
              {simResult.stages.map((s) => (
                <div key={s.stageId} className="flex items-center gap-2">
                  <span className="font-mono text-[9px] text-muted-foreground w-28 shrink-0 truncate">{s.stageId}</span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        s.successProbability >= 70 ? "bg-emerald-500"
                          : s.successProbability >= 45 ? "bg-amber-500"
                          : s.successProbability >= 25 ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${s.successProbability}%` }}
                    />
                  </div>
                  <span className={`font-mono text-[9px] w-8 text-right ${riskColors[s.riskLevel]}`}>
                    {s.successProbability}%
                  </span>
                  {s.dynamicConstraintCount > 0 && (
                    <span className="text-[8px] text-amber-400 font-mono">+{s.dynamicConstraintCount}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Bottlenecks */}
            {simResult.bottlenecks.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Bottlenecks</h4>
                {simResult.bottlenecks.map((b) => (
                  <div key={b.stageId} className="flex items-start gap-2 text-xs">
                    <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0 mt-0.5" />
                    <span className="font-mono text-orange-300">{b.stageId}</span>
                    <span className="text-muted-foreground">{b.probability}% — {b.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommendations */}
            {simResult.recommendations.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Recommendations</h4>
                {simResult.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
