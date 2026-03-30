"use client";

import { useState, useEffect, useRef } from "react";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { toast } from "sonner";
import type { WorkflowStep, RoutingDecisionData, PipelineExecution } from "@/types";
import { X, FileText, ExternalLink, Plus, ChevronDown, Send, GitBranch, FileDown, ShieldCheck, BarChart3, Link2, Pause, Square, Play, CheckCircle2, XCircle, History, BookTemplate, FolderOpen, Layers } from "lucide-react";
import { ContractsTab } from "@/components/orchestration/contracts-tab";
import { AnalyticsTab } from "@/components/orchestration/analytics-tab";
import { InvestigationCard } from "@/components/orchestration/investigation-card";
import type { InvestigationData } from "@/components/orchestration/investigation-card";
import { PipelineGraph } from "@/components/orchestration/pipeline-graph";
import { StageDetailPanel } from "@/components/orchestration/stage-detail-panel";
import { executePipeline } from "@/lib/pipeline-executor";
import { filterStepsForRouting } from "@/lib/pipeline-step-filter";

type PipelineTab = "pipeline" | "contracts" | "analytics";
type PipelineView = "input" | "history";

export function PipelinePanel({ activeProjectId, projects, onSelectProject }: {
  activeProjectId: string | null;
  projects: { id: string; name: string; framework: string; status: string }[];
  onSelectProject: (id: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<PipelineTab>("pipeline");
  const [pipelineView, setPipelineView] = useState<PipelineView>("input");
  const [projectOpen, setProjectOpen] = useState(false);
  const projectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) setProjectOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: "direct" | "pipeline" | "error";
    response?: string;
    toolCalls?: { name: string; path?: string; success: boolean }[];
    message?: string;
    intent?: { intent: string; confidence: number; reason: string };
    investigation?: InvestigationData;
    jiraKey?: string;
  } | null>(null);

  // Pipeline routing state
  const [routingDecision, setRoutingDecision] = useState<RoutingDecisionData | null>(null);
  const [pipelineInput, setPipelineInput] = useState("");
  const [routingLoading, setRoutingLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const checkpointResolveRef = useRef<((v: boolean) => void) | null>(null);

  // Store connections for live execution, checkpoint, pause/stop/resume
  const activeExecution = useOrchestrationStore((s) => s.activeExecution);
  const executionHistory = useOrchestrationStore((s) => s.executionHistory);
  const setActiveExecution = useOrchestrationStore((s) => s.setActiveExecution);
  const addToHistory = useOrchestrationStore((s) => s.addToHistory);
  const pauseRequested = useOrchestrationStore((s) => s.pauseRequested);
  const stopRequested = useOrchestrationStore((s) => s.stopRequested);
  const requestPause = useOrchestrationStore((s) => s.requestPause);
  const requestStop = useOrchestrationStore((s) => s.requestStop);
  const clearControlFlags = useOrchestrationStore((s) => s.clearControlFlags);
  const approveCheckpoint = useOrchestrationStore((s) => s.approveCheckpoint);
  const rejectCheckpoint = useOrchestrationStore((s) => s.rejectCheckpoint);
  const workflows = useOrchestrationStore((s) => s.workflows);

  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  // Local viewing state — for browsing history WITHOUT polluting store's activeExecution
  const [viewingExecution, setViewingExecution] = useState<PipelineExecution | null>(null);

  // Display execution = viewing history OR live execution
  const displayExecution = viewingExecution || activeExecution;
  const displayWorkflow = displayExecution ? workflows.find((w) => w.id === displayExecution.workflowId) : null;
  const displaySteps: WorkflowStep[] = displayWorkflow?.steps || [];
  // Fallback: build step from stepResult if workflow not found (for viewing history)
  const selectedStep = displaySteps.find((s) => s.id === selectedStageId)
    || (selectedStageId && displayExecution?.stepResults[selectedStageId]
      ? { id: selectedStageId, agentId: selectedStageId, agentName: selectedStageId.replace(/^s\d+-/, "").replace(/-/g, " "), prompt: "", dependsOn: [], metadata: {} } as unknown as WorkflowStep
      : null);
  const selectedStepResult = selectedStep && displayExecution ? displayExecution.stepResults[selectedStep.id] : undefined;
  const selectedQualityScore = selectedStep && displayExecution?.qualityScores ? displayExecution.qualityScores[selectedStep.id] : undefined;

  // Resolve checkpoint from store changes
  useEffect(() => {
    if (activeExecution && !activeExecution.checkpointPending && checkpointResolveRef.current) {
      checkpointResolveRef.current(true);
      checkpointResolveRef.current = null;
    }
  }, [activeExecution?.checkpointPending]);

  const execute = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    setRoutingDecision(null);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, projectId: activeProjectId }),
      });
      const data = await res.json();

      if (data.error) {
        setResult({ type: "error", message: data.error });
      } else if (data.action === "executed") {
        setResult({
          type: "direct",
          response: data.response,
          toolCalls: data.toolCalls,
          intent: data.intent,
          investigation: data.investigation || null,
          jiraKey: data.jiraKey || null,
        });
      } else if (data.action === "redirect_to_pipeline") {
        // Instead of redirect — fetch routing decision
        setPipelineInput(input);
        setRoutingLoading(true);
        try {
          const routeRes = await fetch("/api/pipeline/route", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ input, selectedProject: activeProjectId }),
          });
          const routeData = await routeRes.json();
          if (routeData.success && routeData.decision) {
            setRoutingDecision(routeData.decision);
            setResult({
              type: "pipeline",
              message: `Routed as ${routeData.decision.mode} pipeline`,
              intent: data.intent,
            });
          } else {
            setResult({ type: "error", message: routeData.error || "Routing failed" });
          }
        } catch (e) {
          setResult({ type: "error", message: `Routing error: ${e}` });
        }
        setRoutingLoading(false);
      }
    } catch (e) {
      setResult({ type: "error", message: String(e) });
    }

    setLoading(false);
    setInput("");
  };

  // Confirm & Execute pipeline (or resume from previous)
  const confirmAndExecute = async (resumeFrom?: PipelineExecution) => {
    const taskInput = resumeFrom?.input || pipelineInput;
    if (!taskInput || executing) return;

    // Find workflow — prefer matching workflowId from previous execution
    const wf = resumeFrom
      ? (workflows.find((w) => w.id === resumeFrom.workflowId) || workflows.find((w) => w.steps.length > 0))
      : (workflows.find((w) => !w.isTemplate && w.steps.length > 0) || workflows.find((w) => w.steps.length > 0));
    if (!wf) {
      toast.error("No workflow found with steps");
      return;
    }

    setExecuting(true);
    setResult(null);
    setViewingExecution(null);
    setSelectedStageId(null);
    clearControlFlags();
    setPipelineView("input");

    const completedCount = resumeFrom ? Object.values(resumeFrom.stepResults).filter((r) => r.status === "completed").length : 0;
    if (resumeFrom && completedCount > 0) {
      toast(`Resuming — reusing ${completedCount} completed stages`, { duration: 3000 });
    }

    try {
      const steps = routingDecision ? filterStepsForRouting(wf.steps, routingDecision) : wf.steps;
      const result = await executePipeline(
        steps,
        taskInput,
        wf.id,
        wf.name,
        {
          onUpdate: (exec) => {
            setActiveExecution(exec);
            addToHistory(exec);
          },
          onCheckpointReached: () => new Promise<boolean>((resolve) => {
            checkpointResolveRef.current = resolve;
          }),
          getCheckpointStatus: () => {
            const state = useOrchestrationStore.getState();
            const exec = state.activeExecution;
            return {
              approved: exec ? !exec.checkpointPending && exec.status === "running" : false,
              rejected: exec ? !exec.checkpointPending && exec.status === "failed" : false,
              reason: exec?.checkpointRejectionReason,
            };
          },
          isPauseRequested: () => useOrchestrationStore.getState().pauseRequested,
          isStopRequested: () => useOrchestrationStore.getState().stopRequested,
        },
        routingDecision || undefined,
        activeProjectId,
        resumeFrom || undefined,
      );

      addToHistory(result);
      setActiveExecution(null);
      toast.success(`Pipeline ${result.status}: ${Object.values(result.stepResults).filter((r) => r.status === "completed").length}/${Object.keys(result.stepResults).length} steps`);
    } catch (e) {
      toast.error(`Pipeline failed: ${e}`);
    }

    setExecuting(false);
    setRoutingDecision(null);
    setPipelineInput("");
  };

  const exportResult = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mc-result-${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 200);
    toast.success("Exported result JSON");
  };

  const handleResume = () => {
    clearControlFlags();
    if (activeExecution) {
      confirmAndExecute(activeExecution);
    } else {
      toast.success("Control flags cleared");
    }
  };

  const TABS: { id: PipelineTab; label: string; icon: typeof GitBranch }[] = [
    { id: "pipeline", label: "Pipeline", icon: GitBranch },
    { id: "contracts", label: "Contracts", icon: ShieldCheck },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const completedSteps = activeExecution ? Object.values(activeExecution.stepResults).filter((r) => r.status === "completed").length : 0;
  const totalSteps = activeExecution ? Object.keys(activeExecution.stepResults).length : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="px-4 py-2 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    active
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-transparent"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "pipeline" && (
              <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
                <button
                  onClick={() => setPipelineView("input")}
                  className={`px-2 py-1 rounded text-[10px] font-medium transition-colors ${pipelineView === "input" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`}
                >
                  Input
                </button>
                <button
                  onClick={() => setPipelineView("history")}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${pipelineView === "history" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`}
                >
                  <History className="w-3 h-3" />
                  History
                  {executionHistory.length > 0 && (
                    <span className="font-mono text-[9px] bg-slate-200 text-slate-600 px-1 rounded">{executionHistory.length}</span>
                  )}
                </button>
              </div>
            )}
            {/* Project selector */}
            <div ref={projectRef} className="relative">
              <button
                onClick={() => setProjectOpen(!projectOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  activeProjectId
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700"
                    : "bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                <FolderOpen className="w-3 h-3" />
                <span className="max-w-[100px] truncate">
                  {projects.find((p) => p.id === activeProjectId)?.name || "Select project"}
                </span>
                <ChevronDown className={`w-2.5 h-2.5 transition-transform ${projectOpen ? "rotate-180" : ""}`} />
              </button>
              {projectOpen && (
                <div className="absolute top-full mt-1 right-0 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                  <button
                    onClick={() => { onSelectProject(null); setProjectOpen(false); }}
                    className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                      !activeProjectId ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-slate-500"
                    }`}
                  >
                    No project (global)
                  </button>
                  <div className="border-t border-slate-100" />
                  {projects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => { onSelectProject(p.id); setProjectOpen(false); }}
                      className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors hover:bg-slate-50 ${
                        activeProjectId === p.id ? "bg-indigo-50/50 text-indigo-700" : "text-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className="text-xs font-medium truncate">{p.name}</span>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 shrink-0">{p.framework}</span>
                    </button>
                  ))}
                  {projects.length === 0 && (
                    <div className="px-3 py-3 text-xs text-slate-400 text-center">No projects discovered</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sprint 2 #8: Live Execution Status Bar ── */}
      {activeExecution && activeExecution.status !== "completed" && activeExecution.status !== "failed" && (
        <div className="px-4 py-2 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                activeExecution.status === "running" ? "bg-emerald-500 animate-pulse" :
                activeExecution.status === "paused" ? "bg-amber-500" : "bg-slate-400"
              }`} />
              <span className="text-xs font-medium text-slate-700">{activeExecution.workflowName}</span>
              <span className="font-mono text-[10px] text-slate-400">
                {completedSteps}/{totalSteps} steps
              </span>
            </div>
            <div className="flex items-center gap-1">
              {/* Resume button (#11) */}
              {(pauseRequested || activeExecution.status === "paused") && (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  Resume
                </button>
              )}
              {/* Pause */}
              {activeExecution.status === "running" && !pauseRequested && (
                <button
                  onClick={requestPause}
                  className="p-1 rounded text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                  title="Pause pipeline"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              )}
              {/* Stop */}
              {activeExecution.status === "running" && !stopRequested && (
                <button
                  onClick={requestStop}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Stop pipeline"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                pauseRequested ? "bg-amber-500" : "bg-indigo-500"
              }`}
              style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Sprint 2 #10: Checkpoint Gate ── */}
      {activeExecution?.checkpointPending && (
        <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-600 animate-pulse" />
              <span className="text-xs font-medium text-amber-800">Checkpoint — awaiting approval</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => approveCheckpoint(activeExecution.id)}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
              >
                <CheckCircle2 className="w-3 h-3" />
                Approve
              </button>
              {!showRejectInput ? (
                <button
                  onClick={() => setShowRejectInput(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
                >
                  <XCircle className="w-3 h-3" />
                  Reject
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <input
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Reason..."
                    className="border border-rose-200 rounded px-2 py-0.5 text-[10px] w-32 focus:outline-none focus:ring-1 focus:ring-rose-300"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && rejectReason.trim()) {
                        rejectCheckpoint(activeExecution.id, rejectReason.trim());
                        setShowRejectInput(false);
                        setRejectReason("");
                      }
                    }}
                    autoFocus
                  />
                  <button
                    onClick={() => {
                      if (rejectReason.trim()) {
                        rejectCheckpoint(activeExecution.id, rejectReason.trim());
                        setShowRejectInput(false);
                        setRejectReason("");
                      }
                    }}
                    disabled={!rejectReason.trim()}
                    className="px-1.5 py-0.5 rounded text-[10px] bg-rose-600 text-white disabled:opacity-30"
                  >
                    Send
                  </button>
                  <button
                    onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Sprint 3 #13: Pipeline Graph ── */}
      {activeTab === "pipeline" && displayExecution && displaySteps.length > 0 && (
        <div className="border-b border-slate-200 overflow-x-auto">
          <PipelineGraph
            steps={displaySteps}
            execution={displayExecution}
            executionHistory={executionHistory}
            selectedStageId={selectedStageId}
            onSelectStage={setSelectedStageId}
            onApproveCheckpoint={() => activeExecution && approveCheckpoint(activeExecution.id)}
            onRejectCheckpoint={(reason) => activeExecution && rejectCheckpoint(activeExecution.id, reason)}
          />
        </div>
      )}

      {/* ── Sprint 3 #14: Stage Detail Panel + #15: Stage Files & Deploy ── */}
      {activeTab === "pipeline" && selectedStep && (
        <div className="max-h-[50vh] overflow-y-auto border-b border-slate-200">
          <StageDetailPanel
            step={selectedStep}
            result={selectedStepResult}
            qualityScore={selectedQualityScore}
            onClose={() => { setSelectedStageId(null); setViewingExecution(null); }}
          />
        </div>
      )}

      {/* Tab content */}
      {activeTab === "contracts" ? (
        <div className="flex-1 overflow-y-auto">
          <ContractsTab />
        </div>
      ) : activeTab === "analytics" ? (
        <div className="flex-1 overflow-y-auto">
          <AnalyticsTab />
        </div>
      ) : pipelineView === "history" ? (
        /* ── Sprint 2 #9: Execution History ── */
        <div className="flex-1 overflow-y-auto p-4">
          {executionHistory.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <History className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <div className="text-sm text-slate-400">No executions yet</div>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Deduplicate by ID */}
              {executionHistory.filter((exec, idx, arr) => arr.findIndex((e) => e.id === exec.id) === idx).map((exec) => {
                const steps = Object.values(exec.stepResults);
                const done = steps.filter((s) => s.status === "completed").length;
                const failed = steps.filter((s) => s.status === "failed").length;
                const elapsed = exec.totalDuration ? `${Math.round(exec.totalDuration / 1000)}s` : "\u2014";
                const isStale = (exec.status === "paused" || exec.status === "running") && activeExecution?.id !== exec.id;
                const displayStatus = isStale ? "interrupted" : exec.status;
                const stepsWithOutput = steps.filter((s) => s.output);
                const hasFiles = stepsWithOutput.some((s) => s.output && (s.output.includes('```') || s.output.includes('"files"')));
                const isViewing = viewingExecution?.id === exec.id;
                return (
                  <div key={exec.id} className={`bg-white border rounded-lg p-3 transition-all cursor-pointer ${isViewing ? "border-indigo-300 shadow-md ring-1 ring-indigo-200" : "border-slate-200 hover:shadow-sm hover:border-slate-300"}`}>
                    {/* Clickable card body */}
                    <div
                      onClick={() => {
                        if (isViewing) {
                          setViewingExecution(null);
                          setSelectedStageId(null);
                        } else {
                          setViewingExecution(exec);
                          setSelectedStageId(null);
                          setPipelineView("input");
                        }
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-xs text-slate-700 truncate">{exec.input?.substring(0, 60)}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`font-mono text-[10px] uppercase tracking-wide font-medium ${
                              displayStatus === "completed" ? "text-emerald-600" : displayStatus === "failed" ? "text-rose-600" : displayStatus === "interrupted" || displayStatus === "paused" || displayStatus === "stopped" ? "text-amber-600" : "text-indigo-600"
                            }`}>
                              {displayStatus}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{done}/{steps.length} steps</span>
                            {failed > 0 && <span className="font-mono text-[10px] text-rose-400">{failed} failed</span>}
                            <span className="font-mono text-[10px] text-slate-400">{elapsed}</span>
                            {exec.jiraKey && (
                              <span className="font-mono text-[10px] text-blue-500 bg-blue-50 px-1.5 rounded">{exec.jiraKey}</span>
                            )}
                            {hasFiles && (
                              <span className="font-mono text-[10px] text-violet-500 bg-violet-50 px-1.5 rounded flex items-center gap-0.5">
                                <FileText className="w-2.5 h-2.5" />
                                files
                              </span>
                            )}
                            {stepsWithOutput.length > 0 && (
                              <span className="font-mono text-[10px] text-slate-400">{stepsWithOutput.length} outputs</span>
                            )}
                          </div>
                        </div>
                        <span className="font-mono text-[9px] text-slate-300 shrink-0 ml-2">
                          {new Date(exec.startedAt).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {/* Step results mini bar */}
                      <div className="flex gap-0.5 mt-2">
                        {steps.map((step) => (
                          <div
                            key={step.stepId}
                            className={`h-1 flex-1 rounded-full ${
                              step.status === "completed" ? "bg-emerald-400" :
                              step.status === "failed" ? "bg-rose-400" :
                              step.status === "running" ? "bg-indigo-400 animate-pulse" :
                              "bg-slate-200"
                          }`}
                          title={`${step.stepId}: ${step.status}`}
                        />
                      ))}
                    </div>
                    </div>{/* end clickable body */}

                    {/* Action buttons row */}
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
                      {/* View stages */}
                      {stepsWithOutput.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewingExecution(exec);
                            setSelectedStageId(null);
                            setPipelineView("input");
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          <Layers className="w-3 h-3" />
                          View Stages
                        </button>
                      )}
                      {/* Deploy */}
                      {hasFiles && exec.status === "completed" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const stepWithFiles = stepsWithOutput.find((s) => s.output && (s.output.includes('```') || s.output.includes('"files"')));
                            if (stepWithFiles) {
                              setViewingExecution(exec);
                              setSelectedStageId(stepWithFiles.stepId);
                              setPipelineView("input");
                            }
                          }}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Deploy Files
                        </button>
                      )}
                      {/* Resume — reuses completed stages, reruns failed/pending */}
                      {(isStale || exec.status === "stopped" || exec.status === "failed") && exec.input && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmAndExecute(exec);
                          }}
                          disabled={executing}
                          className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-amber-600 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          <Play className="w-3 h-3" />
                          {done > 0 ? `Resume (skip ${done} done)` : "Re-run"}
                        </button>
                      )}
                      {/* Export */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const blob = new Blob([JSON.stringify(exec, null, 2)], { type: "application/json" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `pipeline-${exec.id.substring(0, 8)}.json`;
                          a.click();
                          setTimeout(() => URL.revokeObjectURL(url), 200);
                          toast.success("Exported pipeline JSON");
                        }}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-slate-500 hover:bg-slate-100 transition-colors ml-auto"
                      >
                        <FileDown className="w-3 h-3" />
                        Export
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Pipeline tab — result area */}
          <div className="flex-1 overflow-y-auto p-4">
            {result ? (
              <div className="space-y-3">
                {/* Top row: intent badge + actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {result.intent && (
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        result.type === "direct" ? "bg-emerald-50 text-emerald-600" : result.type === "pipeline" ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                      }`}>
                        {result.intent.intent.toUpperCase()}
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
                    <button onClick={exportResult} className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Export JSON">
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
                        onClick={() => confirmAndExecute()}
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
                        onClick={() => { setRoutingDecision(null); setResult(null); }}
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

                <button onClick={() => setResult(null)} className="text-xs text-slate-400 hover:text-slate-600">
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
                  onClick={() => { setInput(`Run pipeline: ${wf.name}`); }}
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
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") execute(); }}
                placeholder="Describe your task..."
                disabled={loading}
                className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 disabled:opacity-50"
              />
              <button
                onClick={execute}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-30 transition-colors"
              >
                {loading ? "..." : "Run"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
