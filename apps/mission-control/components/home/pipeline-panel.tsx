"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import useSWR from "swr";
import { toast } from "sonner";
import type { WorkflowStep, RoutingDecisionData, PipelineExecution } from "@/types";
import { GitBranch, ShieldCheck, BarChart3, History, Box, Rows3 } from "lucide-react";
import { Pipeline3D } from "./pipeline-3d";
import { ContractsTab } from "@/components/orchestration/contracts-tab";
import { AnalyticsTab } from "@/components/orchestration/analytics-tab";
import { PipelineGraph } from "@/components/orchestration/pipeline-graph";
import { StageDetailPanel } from "@/components/orchestration/stage-detail-panel";
import { executePipeline } from "@/lib/pipeline-executor";
import { filterStepsForRouting } from "@/lib/pipeline-step-filter";

import { ProjectDropdown } from "./project-dropdown";
import { ExecutionBar } from "./execution-bar";
import { CheckpointBar } from "./checkpoint-bar";
import { PipelineHistory } from "./pipeline-history";
import { PipelineInput } from "./pipeline-input";
import type { PipelineInputResult } from "./pipeline-input";
import { ResumeBanner } from "./resume-banner";
import { QueueIndicator } from "./queue-indicator";

type PipelineTab = "pipeline" | "contracts" | "analytics";
type PipelineView = "input" | "history";

const PIPELINE_TABS: { id: PipelineTab; label: string; icon: typeof GitBranch }[] = [
  { id: "pipeline", label: "Pipeline", icon: GitBranch },
  { id: "contracts", label: "Contracts", icon: ShieldCheck },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

export function PipelinePanel({ activeProjectId, projects, onSelectProject }: {
  activeProjectId: string | null;
  projects: { id: string; name: string; framework: string; status: string }[];
  onSelectProject: (id: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<PipelineTab>("pipeline");
  const [graphMode, setGraphMode] = useState<"2d" | "3d">("3d");
  const [pipelineView, setPipelineView] = useState<PipelineView>("input");

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PipelineInputResult | null>(null);

  // Pipeline routing state
  const [routingDecision, setRoutingDecision] = useState<RoutingDecisionData | null>(null);
  const [pipelineInput, setPipelineInput] = useState("");
  const [routingLoading, setRoutingLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const checkpointResolveRef = useRef<((v: boolean) => void) | null>(null);

  // Store connections for live execution, checkpoint, pause/stop/resume
  const activeExecution = useOrchestrationStore((s) => s.activeExecution);
  const storeHistory = useOrchestrationStore((s) => s.executionHistory);
  // Fetch file-based history (includes CLI/API tasks not in browser store)
  const { data: fileHistory } = useSWR("/api/pipeline/history", (url: string) => fetch(url).then(r => r.json()), { revalidateOnFocus: false });
  // Merge: store history + file history, deduplicate by ID
  const executionHistory = useMemo(() => {
    const fileRuns = (fileHistory?.runs || []).map((r: any) => ({
      id: r.id,
      shortId: r.shortId || "",
      workflowId: r.workflowName === "Direct Execution" ? "direct" : r.id,
      workflowName: r.workflowName || "Unknown",
      status: r.status,
      input: r.input,
      stepResults: {},
      startedAt: r.startedAt,
      completedAt: r.completedAt,
      totalDuration: r.totalDuration,
      jiraKey: r.jiraKey,
      projectId: r.projectId || undefined,
    }));
    const storeIds = new Set(storeHistory.map(e => e.id));
    const merged = [...storeHistory, ...fileRuns.filter((r: any) => !storeIds.has(r.id))];
    return merged.sort((a: any, b: any) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  }, [storeHistory, fileHistory]);
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
  const taskQueue = useOrchestrationStore((s) => s.taskQueue);
  const enqueueTask = useOrchestrationStore((s) => s.enqueueTask);
  const dequeueTask = useOrchestrationStore((s) => s.dequeueTask);
  const clearQueue = useOrchestrationStore((s) => s.clearQueue);

  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);
  // Local viewing state — for browsing history WITHOUT polluting store's activeExecution
  const [viewingExecution, setViewingExecution] = useState<PipelineExecution | null>(null);

  // Resume banner — detect interrupted/paused execution on mount
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  useEffect(() => {
    if (activeExecution && (activeExecution.status === "interrupted" || activeExecution.status === "paused") && !executing) {
      setShowResumeBanner(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    const taskInput = input;
    const taskId = Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    setLoading(true);
    setResult(null);
    setRoutingDecision(null);

    try {
      const res = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: taskInput, projectId: activeProjectId }),
      });
      const data = await res.json();

      if (data.error) {
        setResult({ type: "error", message: data.error, userInput: taskInput, taskId });
      } else if (data.action === "executed") {
        // Determine status from tool calls
        const edits = data.toolCalls?.filter((t: { name: string; success: boolean }) => t.name === "edit_file" || t.name === "create_file") || [];
        const successEdits = edits.filter((t: { success: boolean }) => t.success);
        const status = edits.length === 0 ? "no-edit" as const
          : successEdits.length === edits.length ? "success" as const
          : successEdits.length > 0 ? "partial" as const
          : "failed" as const;

        // Estimate task cost from tool calls (rough: $0.05 per tool call for sonnet)
        const taskCost = (data.toolCalls?.length ?? 0) * 0.05;

        // Fetch current balance and deduct task cost
        let remainingBalance: number | undefined;
        try {
          const costRes = await fetch("/api/costs/real");
          if (costRes.ok) {
            const costData = await costRes.json();
            const currentBalance = costData.data?.apiBalances?.items?.find((b: { provider: string }) => b.provider === "anthropic")?.balance;
            if (currentBalance !== undefined) {
              remainingBalance = Math.max(0, currentBalance - taskCost);
              // Deduct from stored balance
              fetch("/api/costs/real", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ updateBalance: { provider: "anthropic", balance: remainingBalance } }),
              }).catch(() => {});
            }
          }
        } catch {
          // non-fatal
        }

        const directResult = {
          type: "direct" as const,
          response: data.response,
          toolCalls: data.toolCalls,
          intent: data.intent,
          investigation: data.investigation || null,
          jiraKey: data.jiraKey || null,
          taskId,
          userInput: taskInput,
          status,
          taskCost,
          remainingBalance,
        };
        setResult(directResult);

        // Save direct task to execution history
        addToHistory({
          id: taskId,
          workflowId: "direct",
          workflowName: "Direct Execution",
          status: status === "success" ? "completed" : status === "failed" ? "failed" : "completed",
          input: taskInput,
          stepResults: {
            "direct": {
              stepId: "direct",
              status: status === "success" || status === "no-edit" ? "completed" : status === "partial" ? "completed" : "failed",
              output: data.response?.substring(0, 5000),
            },
          },
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        } as any);
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
    if (!taskInput) return;

    // Queue if already executing
    if (executing && !resumeFrom) {
      enqueueTask({
        id: Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        input: taskInput,
        projectId: activeProjectId,
        routingDecision: routingDecision || undefined,
        enqueuedAt: new Date().toISOString(),
      });
      toast(`Task queued (${taskQueue.length + 1} in queue)`);
      setRoutingDecision(null);
      setPipelineInput("");
      return;
    }

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
      // Use routing decision from resume execution if available, otherwise component state
      const effectiveRouting = resumeFrom?.routingDecision || routingDecision || undefined;
      const steps = effectiveRouting ? filterStepsForRouting(wf.steps, effectiveRouting) : wf.steps;
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
        effectiveRouting,
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

    // Auto-dequeue next task
    const next = dequeueTask();
    if (next) {
      setPipelineInput(next.input);
      setRoutingDecision(next.routingDecision || null);
      toast(`Starting queued task: ${next.input.substring(0, 40)}...`);
      setTimeout(() => confirmAndExecute(), 200);
    }
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

  const completedSteps = activeExecution ? Object.values(activeExecution.stepResults).filter((r) => r.status === "completed").length : 0;
  const totalSteps = activeExecution ? Object.keys(activeExecution.stepResults).length : 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header with tabs */}
      <div className="px-4 py-2 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {PIPELINE_TABS.map((tab) => {
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
                    <span className="font-mono text-[9px] bg-slate-200 text-slate-600 px-1 rounded">{fileHistory?.total ?? executionHistory.length}</span>
                  )}
                </button>
              </div>
            )}
            {/* Project selector */}
            <ProjectDropdown
              activeProjectId={activeProjectId}
              projects={projects}
              onSelectProject={onSelectProject}
            />
          </div>
        </div>
      </div>

      {/* Resume Banner — interrupted/paused execution from previous session */}
      {showResumeBanner && activeExecution && !executing && (
        <ResumeBanner
          execution={activeExecution}
          onResume={() => { setShowResumeBanner(false); confirmAndExecute(activeExecution); }}
          onDiscard={() => { setShowResumeBanner(false); setActiveExecution(null); }}
        />
      )}

      {/* Live Execution Status Bar */}
      {activeExecution && (
        <ExecutionBar
          activeExecution={activeExecution}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          pauseRequested={pauseRequested}
          stopRequested={stopRequested}
          onResume={handleResume}
          onPause={requestPause}
          onStop={requestStop}
        />
      )}

      {/* Checkpoint Gate */}
      {activeExecution?.checkpointPending && (
        <CheckpointBar
          executionId={activeExecution.id}
          onApprove={approveCheckpoint}
          onReject={rejectCheckpoint}
        />
      )}

      {/* Task Queue */}
      <QueueIndicator queue={taskQueue} onClear={clearQueue} />

      {/* Pipeline Graph — 2D or 3D toggle */}
      {activeTab === "pipeline" && displayExecution && displaySteps.length > 0 && (
        <div className="border-b border-slate-200">
          {/* View mode toggle */}
          <div className="flex items-center justify-end px-3 py-1 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-md p-0.5">
              <button
                onClick={() => setGraphMode("3d")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${graphMode === "3d" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`}
                aria-label="3D visualization"
              >
                <Box className="w-3 h-3" />
                3D
              </button>
              <button
                onClick={() => setGraphMode("2d")}
                className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${graphMode === "2d" ? "bg-white text-slate-700 shadow-sm" : "text-slate-400"}`}
                aria-label="2D graph"
              >
                <Rows3 className="w-3 h-3" />
                2D
              </button>
            </div>
          </div>

          {graphMode === "3d" ? (
            <div className="h-[350px]">
              <Pipeline3D
                steps={displaySteps}
                execution={displayExecution}
                onSelectStage={setSelectedStageId}
                selectedStageId={selectedStageId}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
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
        </div>
      )}

      {/* Stage Detail Panel */}
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
        <PipelineHistory
          executionHistory={executionHistory}
          activeExecution={activeExecution}
          viewingExecution={viewingExecution}
          executing={executing}
          onViewExecution={setViewingExecution}
          onSelectStage={setSelectedStageId}
          onSetPipelineView={setPipelineView}
          onResumeExecution={confirmAndExecute}
          projectIds={fileHistory?.projectIds || []}
        />
      ) : (
        <PipelineInput
          input={input}
          loading={loading}
          executing={executing}
          routingLoading={routingLoading}
          result={result}
          routingDecision={routingDecision}
          workflows={workflows}
          onInputChange={setInput}
          onExecute={execute}
          onExportResult={exportResult}
          onClearResult={() => setResult(null)}
          onConfirmAndExecute={() => confirmAndExecute()}
          onCancelRouting={() => { setRoutingDecision(null); setResult(null); }}
        />
      )}
    </div>
  );
}
