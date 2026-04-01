"use client";

import { useState, useEffect, useRef } from "react";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { toast } from "sonner";
import type { WorkflowStep, RoutingDecisionData, PipelineExecution } from "@/types";
import { GitBranch, ShieldCheck, BarChart3, History } from "lucide-react";
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

type PipelineTab = "pipeline" | "contracts" | "analytics";
type PipelineView = "input" | "history";

export function PipelinePanel({ activeProjectId, projects, onSelectProject }: {
  activeProjectId: string | null;
  projects: { id: string; name: string; framework: string; status: string }[];
  onSelectProject: (id: string | null) => void;
}) {
  const [activeTab, setActiveTab] = useState<PipelineTab>("pipeline");
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
            <ProjectDropdown
              activeProjectId={activeProjectId}
              projects={projects}
              onSelectProject={onSelectProject}
            />
          </div>
        </div>
      </div>

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

      {/* Pipeline Graph */}
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
