"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GitBranch, Plus, Play, Trash2, History, Clock, CheckCircle2, XCircle, ExternalLink, Brain, Loader2, Download, FolderOpen, ChevronDown, ChevronRight, FileCode2, Rocket, Pencil, Check, X, UserPlus, Pin, PinOff } from "lucide-react";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { CRM_PIPELINE_TEMPLATE } from "@/lib/pipeline-templates";
import { executePipeline } from "@/lib/pipeline-executor";
import { filterStepsForRouting } from "@/lib/pipeline-step-filter";
import { recalculateForMode } from "@/lib/pipeline-mode-utils";
import { parseCodeBlocks, type ParsedCodeBlock } from "@/lib/code-block-parser";
import { PipelineGraph } from "@/components/orchestration/pipeline-graph";
import { StageDetailPanel } from "@/components/orchestration/stage-detail-panel";
import { RoutingDecisionPanel } from "@/components/orchestration/routing-decision-panel";
import { SlotBar } from "@/components/orchestration/slot-bar";
import { TemplateLibrary } from "@/components/orchestration/template-library";
import { RecruitmentCenter } from "@/components/orchestration/recruitment-center";
import type { Workflow, PipelineExecution, RoutingDecisionData, ExecutionMode, AgentCatalogEntry } from "@/types";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

const EMPTY_SLOTS: [import("@/types").WorkflowSlot, import("@/types").WorkflowSlot, import("@/types").WorkflowSlot, import("@/types").WorkflowSlot] = [
  { id: 0, workflowId: null, workflowName: null, status: "empty", projectContext: null, lastInput: "", executionId: null, progress: 0 },
  { id: 1, workflowId: null, workflowName: null, status: "empty", projectContext: null, lastInput: "", executionId: null, progress: 0 },
  { id: 2, workflowId: null, workflowName: null, status: "empty", projectContext: null, lastInput: "", executionId: null, progress: 0 },
  { id: 3, workflowId: null, workflowName: null, status: "empty", projectContext: null, lastInput: "", executionId: null, progress: 0 },
];

export default function OrchestrationPage() {
  const {
    workflows, addWorkflow, deleteWorkflow, updateWorkflow,
    activeExecution, setActiveExecution, addToHistory,
    executionHistory,
    selectedStageId, selectStage,
    selectedProject, setSelectedProject,
    approveCheckpoint, rejectCheckpoint,
    // V2: Slots
    slots, activeSlotIndex,
    setActiveSlot, loadWorkflowToSlot, clearSlot,
    updateSlotInput, updateSlotProject,
    insertStepAtPosition, removeStep,
    // V2 Phase 2
    reorderStep, toggleStepDisabled, toggleStepParallel,
    duplicateStep, duplicateWorkflowToSlot,
    // V2: Core pipelines
    corePipelines, setCorePipeline, clearCorePipeline,
  } = useOrchestrationStore();
  const [input, setInput] = useState("");
  const [routingDecision, setRoutingDecision] = useState<RoutingDecisionData | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const [expandedExecId, setExpandedExecId] = useState<string | null>(null);
  const [expandedFileIdx, setExpandedFileIdx] = useState<Record<string, number | null>>({});
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<Record<string, { success: boolean; staged: boolean; summary: { staged?: number; created?: number; updated?: number; errors: number } | null } | null>>({});
  const [deployingId, setDeployingId] = useState<string | null>(null);
  const [editingWfId, setEditingWfId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [discardTarget, setDiscardTarget] = useState<string | null>(null);
  const [discardReason, setDiscardReason] = useState("");
  const [discardCategory, setDiscardCategory] = useState<string>("other");
  const [showNameDialog, setShowNameDialog] = useState<"template" | "new" | null>(null);
  const [newWfName, setNewWfName] = useState("");
  const [showRecruitment, setShowRecruitment] = useState(false);
  const [insertPosition, setInsertPosition] = useState<number | null>(null);

  // Available projects for context injection
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/projects/list")
      .then((r) => r.json())
      .then((d) => setAvailableProjects(d.projects || []))
      .catch(() => {});
  }, []);

  // Derive the selected workflow from the active slot (guard against hydration with old localStorage)
  const activeSlot = slots?.[activeSlotIndex] ?? { workflowId: null, workflowName: null, status: "empty" as const, projectContext: null, lastInput: "", executionId: null, progress: 0, id: 0 as const };
  const selectedWorkflow = activeSlot.workflowId
    ? (workflows.find((w) => w.id === activeSlot.workflowId) ?? null)
    : null;

  // Sync input from slot when switching
  useEffect(() => {
    setInput(activeSlot.lastInput || "");
    setSelectedProject(activeSlot.projectContext);
    setRoutingDecision(null);
    // Restore last execution for this slot's workflow
    if (activeSlot.workflowId) {
      const lastExec = executionHistory.find((e) => e.workflowId === activeSlot.workflowId);
      if (lastExec) {
        setActiveExecution(lastExec);
      } else {
        setActiveExecution(null);
      }
    } else {
      setActiveExecution(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlotIndex]);

  // Auto-load core pipeline when project context changes
  const currentCorePipelineId = selectedProject ? (corePipelines?.[selectedProject] ?? null) : null;
  const isCurrentWorkflowCore = selectedWorkflow ? currentCorePipelineId === selectedWorkflow.id : false;

  useEffect(() => {
    if (!selectedProject || !corePipelines) return;
    const coreId = corePipelines[selectedProject];
    if (!coreId) return;
    // If active slot is empty, auto-load core pipeline
    if (activeSlot.status === "empty") {
      const coreWf = workflows.find((w) => w.id === coreId);
      if (coreWf) loadWorkflowToSlot(activeSlotIndex, coreWf);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProject]);

  // Save input changes back to slot
  function handleInputChange(val: string) {
    setInput(val);
    updateSlotInput(activeSlotIndex, val);
  }

  // Checkpoint resolution refs
  const checkpointResolveRef = useRef<((approved: boolean) => void) | null>(null);
  const checkpointStatusRef = useRef<{ approved: boolean; rejected: boolean; reason?: string }>({
    approved: false,
    rejected: false,
  });

  function openCreateFromTemplate() {
    setNewWfName("");
    setShowNameDialog("template");
  }

  function openCreateNew() {
    setNewWfName("");
    setShowNameDialog("new");
  }

  function confirmCreateWorkflow() {
    const name = newWfName.trim() || (showNameDialog === "template"
      ? `CRM Pipeline — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
      : `Workflow — ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}`);

    const wf: Workflow = showNameDialog === "template"
      ? { ...CRM_PIPELINE_TEMPLATE, id: generateId(), name, createdAt: new Date().toISOString() }
      : { id: generateId(), name, description: "Custom multi-agent workflow", steps: [], createdAt: new Date().toISOString() };

    addWorkflow(wf);
    // Auto-load into first empty slot, or the active slot
    const emptySlotIdx = slots.findIndex((s) => s.status === "empty");
    const targetSlot = emptySlotIdx !== -1 ? (emptySlotIdx as 0 | 1 | 2 | 3) : activeSlotIndex;
    loadWorkflowToSlot(targetSlot, wf);
    setShowNameDialog(null);
    setNewWfName("");
  }

  function handleLoadToSlot(wf: Workflow) {
    const emptySlotIdx = slots.findIndex((s) => s.status === "empty");
    const targetSlot = emptySlotIdx !== -1 ? (emptySlotIdx as 0 | 1 | 2 | 3) : activeSlotIndex;
    loadWorkflowToSlot(targetSlot, wf);
  }

  function handleSaveAsTemplate(wf: Workflow) {
    const templateWf: Workflow = {
      ...wf,
      id: generateId(),
      name: `${wf.name} (Template)`,
      isTemplate: true,
      createdAt: new Date().toISOString(),
    };
    addWorkflow(templateWf);
  }

  function handleSlotAdd(index: 0 | 1 | 2 | 3) {
    setActiveSlot(index);
    if (workflows.length === 0) {
      openCreateFromTemplate();
    }
  }

  // Recruitment Center: add agent to pipeline
  function handleAddAgent(agent: AgentCatalogEntry) {
    if (!selectedWorkflow) return;
    const step = {
      id: `s${selectedWorkflow.steps.length}-${agent.agentId}`,
      agentId: agent.agentId,
      agentName: agent.agentName,
      promptTemplate: `{{input}}`,
      dependsOn: selectedWorkflow.steps.length > 0
        ? [selectedWorkflow.steps[selectedWorkflow.steps.length - 1].id]
        : [],
      outputKey: agent.agentId.replace("-agent", ""),
      metadata: {
        stageNumber: String(selectedWorkflow.steps.length),
        qualityThreshold: agent.qualityThreshold,
        leadAgent: agent.agentId,
        model: agent.model,
      },
    };

    if (insertPosition !== null) {
      insertStepAtPosition(selectedWorkflow.id, step, insertPosition);
      setInsertPosition(null);
    } else {
      // Append at end
      insertStepAtPosition(selectedWorkflow.id, step, selectedWorkflow.steps.length);
    }
    setShowRecruitment(false);
  }

  // Recruitment Center: add multiple agents as parallel stage
  function handleAddParallelAgents(agents: AgentCatalogEntry[]) {
    if (!selectedWorkflow || agents.length < 2) return;
    const groupId = `parallel-${generateId()}`;
    const pos = Math.min(insertPosition ?? selectedWorkflow.steps.length, selectedWorkflow.steps.length);
    agents.forEach((agent, i) => {
      const step = {
        id: `s${pos + i}-${agent.agentId}`,
        agentId: agent.agentId,
        agentName: agent.agentName,
        promptTemplate: `{{input}}`,
        dependsOn: pos > 0 ? [selectedWorkflow.steps[pos - 1]?.id].filter(Boolean) : [],
        outputKey: agent.agentId.replace("-agent", ""),
        metadata: {
          stageNumber: String(pos + i),
          qualityThreshold: agent.qualityThreshold,
          leadAgent: agent.agentId,
          model: agent.model,
          isParallel: true,
          group: groupId,
        },
      };
      insertStepAtPosition(selectedWorkflow.id, step, pos + i);
    });
    setInsertPosition(null);
  }

  // Insert at position — opens recruitment center
  function handleInsertAtPosition(position: number) {
    setInsertPosition(position);
    setShowRecruitment(true);
  }

  // Drag-to-slot from library
  function handleDropToSlot(workflowId: string, slotIndex: 0 | 1 | 2 | 3) {
    const wf = workflows.find((w) => w.id === workflowId);
    if (wf) loadWorkflowToSlot(slotIndex, wf);
  }

  const handleApproveCheckpoint = useCallback(() => {
    if (!activeExecution) return;
    checkpointStatusRef.current = { approved: true, rejected: false };
    approveCheckpoint(activeExecution.id);
    checkpointResolveRef.current?.(true);
    checkpointResolveRef.current = null;
  }, [activeExecution, approveCheckpoint]);

  const handleRejectCheckpoint = useCallback((reason: string) => {
    if (!activeExecution) return;
    checkpointStatusRef.current = { approved: false, rejected: true, reason };
    rejectCheckpoint(activeExecution.id, reason);
    checkpointResolveRef.current?.(false);
    checkpointResolveRef.current = null;
  }, [activeExecution, rejectCheckpoint]);

  // Step 1: Route the task (Smart Router)
  async function routeTask() {
    if (!selectedWorkflow || !input.trim()) return;
    setIsRouting(true);
    setRoutingDecision(null);

    try {
      const res = await fetch("/api/pipeline/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();

      if (data.success && data.decision) {
        setRoutingDecision(data.decision);
      } else {
        // Fallback: full pipeline
        setRoutingDecision({
          mode: "full",
          selectedAgents: selectedWorkflow.steps.map((s) => s.agentId),
          selectedStepIds: selectedWorkflow.steps.map((s) => s.id),
          skippedStepIds: [],
          reasoning: "Router unavailable — using full pipeline",
          complexity: 7,
          estimatedDuration: "~5min",
          includeCheckpoint: true,
          includeQualityEval: true,
          routedAt: new Date().toISOString(),
          routerModel: "fallback",
        });
      }
    } catch {
      // Network error — default to full
      setRoutingDecision({
        mode: "full",
        selectedAgents: selectedWorkflow.steps.map((s) => s.agentId),
        selectedStepIds: selectedWorkflow.steps.map((s) => s.id),
        skippedStepIds: [],
        reasoning: "Router error — using full pipeline",
        complexity: 7,
        estimatedDuration: "~5min",
        includeCheckpoint: true,
        includeQualityEval: true,
        routedAt: new Date().toISOString(),
        routerModel: "fallback",
      });
    } finally {
      setIsRouting(false);
    }
  }

  // Step 2: Execute with the routing decision
  async function executeWithRouting() {
    if (!selectedWorkflow || !input.trim() || !routingDecision) return;

    checkpointStatusRef.current = { approved: false, rejected: false };

    // Filter steps based on routing decision
    const steps = filterStepsForRouting(selectedWorkflow.steps, routingDecision);

    const result = await executePipeline(
      steps,
      input,
      selectedWorkflow.id,
      selectedWorkflow.name,
      {
        onUpdate: (execution: PipelineExecution) => {
          setActiveExecution({ ...execution });
        },
        onCheckpointReached: () => {
          return new Promise<boolean>((resolve) => {
            checkpointResolveRef.current = resolve;
          });
        },
        getCheckpointStatus: () => checkpointStatusRef.current,
        isPauseRequested: () => useOrchestrationStore.getState().pauseRequested,
        isStopRequested: () => useOrchestrationStore.getState().stopRequested,
      },
      routingDecision,
      selectedProject,
    );

    addToHistory(result);
    setRoutingDecision(null);
    useOrchestrationStore.getState().clearControlFlags();
  }

  // Resume a paused/failed/stopped execution
  async function resumeExecution(exec: PipelineExecution) {
    if (!selectedWorkflow) return;
    const effectiveRouting = exec.routingDecision ?? routingDecision ?? null;
    const steps = effectiveRouting
      ? filterStepsForRouting(selectedWorkflow.steps, effectiveRouting)
      : selectedWorkflow.steps;

    checkpointStatusRef.current = { approved: false, rejected: false };
    useOrchestrationStore.getState().clearControlFlags();

    const result = await executePipeline(
      steps,
      exec.input,
      exec.workflowId,
      exec.workflowName,
      {
        onUpdate: (execution: PipelineExecution) => {
          setActiveExecution({ ...execution });
        },
        onCheckpointReached: () => {
          return new Promise<boolean>((resolve) => {
            checkpointResolveRef.current = resolve;
          });
        },
        getCheckpointStatus: () => checkpointStatusRef.current,
        isPauseRequested: () => useOrchestrationStore.getState().pauseRequested,
        isStopRequested: () => useOrchestrationStore.getState().stopRequested,
      },
      effectiveRouting || undefined,
      selectedProject,
      exec, // previousExecution — resume from here
    );

    addToHistory(result);
    useOrchestrationStore.getState().clearControlFlags();
  }

  // Override routing mode — recalculates steps and thresholds for the new mode
  function handleOverrideMode(mode: ExecutionMode) {
    if (!routingDecision) return;
    setRoutingDecision(recalculateForMode(routingDecision, mode));
  }

  function getDetectedFiles(exec: PipelineExecution): ParsedCodeBlock[] {
    const allOutput = Object.values(exec.stepResults)
      .map((r) => r.output || "")
      .join("\n\n");
    return parseCodeBlocks(allOutput);
  }

  // Step 1: Stage files into data/applied/{pipelineId}/
  async function handleStageFiles(exec: PipelineExecution) {
    setApplyingId(exec.id);
    try {
      const files = getDetectedFiles(exec);
      const res = await fetch("/api/orchestration/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          files: files.map((f) => ({ filePath: f.filePath, content: f.content, language: f.language })),
          pipelineId: exec.id,
        }),
      });
      const data = await res.json();
      setApplyResult((prev) => ({
        ...prev,
        [exec.id]: { success: false, staged: data.success, summary: data.summary },
      }));
    } catch {
      setApplyResult((prev) => ({
        ...prev,
        [exec.id]: { success: false, staged: false, summary: null },
      }));
    } finally {
      setApplyingId(null);
    }
  }

  // Step 2: Deploy staged files to real project
  async function handleDeployToSource(execId: string) {
    setDeployingId(execId);
    try {
      const res = await fetch("/api/orchestration/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipelineId: execId }),
      });
      const data = await res.json();
      setApplyResult((prev) => ({
        ...prev,
        [execId]: { success: data.success, staged: false, summary: data.summary },
      }));
    } catch {
      setApplyResult((prev) => ({
        ...prev,
        [execId]: { success: false, staged: false, summary: null },
      }));
    } finally {
      setDeployingId(null);
    }
  }

  // Discard staged files — opens feedback dialog
  function handleDiscardStaged(execId: string) {
    setDiscardTarget(execId);
    setDiscardReason("");
    setDiscardCategory("other");
  }

  // Confirm discard with feedback
  async function handleConfirmDiscard() {
    if (!discardTarget) return;
    if (discardReason.trim()) {
      fetch("/api/knowledge/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipelineId: discardTarget,
          reason: discardReason.trim(),
          category: discardCategory,
        }),
      }).catch(() => {});
    }
    await fetch(`/api/orchestration/deploy?pipelineId=${discardTarget}`, { method: "DELETE" });
    setApplyResult((prev) => {
      const next = { ...prev };
      delete next[discardTarget!];
      return next;
    });
    setDiscardTarget(null);
  }

  function downloadFile(file: ParsedCodeBlock) {
    const blob = new Blob([file.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.filePath.split("/").pop() || "file.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
  }

  function toggleFileView(execId: string, idx: number) {
    setExpandedFileIdx((prev) => ({
      ...prev,
      [execId]: prev[execId] === idx ? null : idx,
    }));
  }

  const selectedStep = selectedWorkflow?.steps.find((s) => s.id === selectedStageId);

  const statusColors: Record<string, string> = {
    pending: "text-muted-foreground",
    running: "text-blue-500",
    completed: "text-emerald-500",
    failed: "text-red-500",
    paused: "text-amber-500",
  };

  return (
    <div className="space-y-6">
      {/* Header with SlotBar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Orchestration</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Smart multi-agent workflow pipelines
          </p>
        </div>
        <div className="flex items-center gap-4">
          <SlotBar
            slots={slots ?? EMPTY_SLOTS}
            activeSlotIndex={activeSlotIndex ?? 0}
            onSelectSlot={setActiveSlot}
            onClearSlot={clearSlot}
            onAddToSlot={handleSlotAdd}
          />
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        {/* Template Library sidebar */}
        <TemplateLibrary
          workflows={workflows}
          selectedWorkflowId={selectedWorkflow?.id ?? null}
          slots={slots ?? EMPTY_SLOTS}
          onSelectWorkflow={(wf) => handleLoadToSlot(wf)}
          onLoadToSlot={handleLoadToSlot}
          onSaveAsTemplate={handleSaveAsTemplate}
          onDeleteWorkflow={deleteWorkflow}
          onCreateFromTemplate={openCreateFromTemplate}
          onCreateNew={openCreateNew}
          onDuplicateToSlot={duplicateWorkflowToSlot}
          onDropToSlot={handleDropToSlot}
          corePipelineIds={new Set(Object.values(corePipelines ?? {}))}
        />

        {/* Workflow detail + execution */}
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          {selectedWorkflow ? (
            <>
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      {editingWfId === selectedWorkflow.id ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const trimmed = editingName.trim();
                              if (trimmed) updateWorkflow(selectedWorkflow.id, { name: trimmed });
                              setEditingWfId(null);
                            }
                            if (e.key === "Escape") setEditingWfId(null);
                          }}
                          onBlur={() => {
                            const trimmed = editingName.trim();
                            if (trimmed) updateWorkflow(selectedWorkflow.id, { name: trimmed });
                            setEditingWfId(null);
                          }}
                          maxLength={100}
                          className="bg-background border border-primary/30 rounded px-2 py-0.5 text-lg font-bold focus:outline-none focus:border-primary"
                        />
                      ) : (
                        <>
                          <h2 className="font-bold text-lg">{selectedWorkflow.name}</h2>
                          <button
                            onClick={() => { setEditingWfId(selectedWorkflow.id); setEditingName(selectedWorkflow.name); }}
                            className="p-1 hover:text-primary transition-colors opacity-50 hover:opacity-100"
                            title="Rename pipeline"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => { setInsertPosition(null); setShowRecruitment(true); }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground hover:text-primary hover:border-primary/50 transition-all ml-2"
                        title="Add agent to pipeline"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="font-mono text-[10px] uppercase tracking-wider">Recruit</span>
                      </button>
                      {/* Core Pipeline pin */}
                      {selectedProject && (
                        <button
                          onClick={() => {
                            if (isCurrentWorkflowCore) {
                              clearCorePipeline(selectedProject);
                            } else {
                              setCorePipeline(selectedProject, selectedWorkflow.id);
                            }
                          }}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-all ml-1 ${
                            isCurrentWorkflowCore
                              ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                              : "border-border text-muted-foreground hover:text-amber-400 hover:border-amber-500/50"
                          }`}
                          title={isCurrentWorkflowCore ? `Unpin core pipeline for ${selectedProject}` : `Set as core pipeline for ${selectedProject}`}
                        >
                          {isCurrentWorkflowCore ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                          <span className="font-mono text-[10px] uppercase tracking-wider">
                            {isCurrentWorkflowCore ? "Core" : "Pin"}
                          </span>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground max-w-[700px]">{selectedWorkflow.description}</p>
                      {isCurrentWorkflowCore && selectedProject && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-mono text-[9px] border border-amber-500/20">
                          Core: {selectedProject}
                        </span>
                      )}
                    </div>
                  </div>
                  {activeExecution && (
                    <div className="flex items-center gap-3">
                      {activeExecution.routingDecision && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          activeExecution.routingDecision.mode === "quick"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : activeExecution.routingDecision.mode === "medium"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {activeExecution.routingDecision.mode}
                        </span>
                      )}
                      {activeExecution.jiraKey && (
                        <a
                          href={activeExecution.jiraUrl || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 font-mono text-[10px] hover:bg-blue-500/20 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {activeExecution.jiraKey}
                        </a>
                      )}
                      <span className={`font-mono text-xs font-semibold ${statusColors[activeExecution.status] || ""}`}>
                        {activeExecution.status.toUpperCase()}
                      </span>
                      {activeExecution.status === "running" && (
                        <>
                          <button
                            onClick={() => useOrchestrationStore.getState().requestPause()}
                            className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                          >
                            Pause
                          </button>
                          <button
                            onClick={() => useOrchestrationStore.getState().requestStop()}
                            className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                          >
                            Stop
                          </button>
                        </>
                      )}
                      {activeExecution.totalDuration && (
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {(activeExecution.totalDuration / 1000).toFixed(1)}s
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Routing decision panel */}
              {routingDecision && !activeExecution?.status?.match(/running|paused/) && (
                <div className="px-6 py-4">
                  <RoutingDecisionPanel
                    decision={routingDecision}
                    onConfirm={executeWithRouting}
                    onOverrideMode={handleOverrideMode}
                    isExecuting={activeExecution?.status === "running"}
                  />
                </div>
              )}

              {/* Pipeline visualization */}
              <div className="flex-1 overflow-y-auto">
                <PipelineGraph
                  steps={selectedWorkflow.steps}
                  execution={activeExecution}
                  executionHistory={executionHistory}
                  selectedStageId={selectedStageId}
                  onSelectStage={selectStage}
                  onApproveCheckpoint={handleApproveCheckpoint}
                  onRejectCheckpoint={handleRejectCheckpoint}
                  onInsertAtPosition={handleInsertAtPosition}
                  onRemoveStep={(stepId) => removeStep(selectedWorkflow.id, stepId)}
                  onReorderStep={(from, to) => reorderStep(selectedWorkflow.id, from, to)}
                  onToggleDisabled={(stepId) => toggleStepDisabled(selectedWorkflow.id, stepId)}
                  onToggleParallel={(stepId) => toggleStepParallel(selectedWorkflow.id, stepId)}
                  onDuplicateStep={(stepId) => duplicateStep(selectedWorkflow.id, stepId)}
                />

                {/* Stage detail panel */}
                {selectedStep && (
                  <StageDetailPanel
                    step={selectedStep}
                    result={activeExecution?.stepResults[selectedStep.id]}
                    qualityScore={activeExecution?.qualityScores?.[selectedStep.id]}
                    onClose={() => selectStage(null)}
                  />
                )}
              </div>

              {/* Execute bar — two-step: Route → then Confirm */}
              <div className="border-t border-border p-4 space-y-2">
                {/* Project context selector */}
                {availableProjects.length > 0 && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="font-mono text-[10px] text-muted-foreground uppercase">Project Context:</span>
                    <select
                      value={selectedProject || ""}
                      onChange={(e) => {
                        const val = e.target.value || null;
                        setSelectedProject(val);
                        updateSlotProject(activeSlotIndex, val);
                      }}
                      className="bg-background border border-border rounded-md px-2 py-1 font-mono text-xs text-foreground focus:border-primary focus:outline-none transition-colors"
                    >
                      <option value="">None (no context injection)</option>
                      {availableProjects.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    {selectedProject && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-mono text-[9px]">
                        Active
                      </span>
                    )}
                  </div>
                )}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && input.trim() && !isRouting) routeTask();
                    }}
                    placeholder="Describe your task — Smart Router will pick the right agents..."
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <button
                    onClick={routeTask}
                    disabled={!input.trim() || isRouting || activeExecution?.status === "running"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all font-mono text-xs uppercase tracking-wider"
                  >
                    {isRouting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Routing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" /> Route
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <GitBranch className="w-12 h-12 mb-4 opacity-20" />
              <p className="font-mono text-sm">Select a workflow from the library or click (+) on a slot</p>
            </div>
          )}
        </div>
      </div>

      {/* Execution History */}
      {executionHistory.length > 0 && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              <h2 className="font-bold text-sm">Execution History</h2>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(executionHistory, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `pipeline-history-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-mono text-[10px] uppercase tracking-wider"
            >
              <Download className="w-3 h-3" />
              Export All
            </button>
          </div>
          <div className="p-2 space-y-1 max-h-[500px] overflow-y-auto">
            {executionHistory.map((exec) => {
              const isExpanded = expandedExecId === exec.id;
              const detectedFiles = isExpanded ? getDetectedFiles(exec) : [];

              return (
                <div key={exec.id} className="rounded-lg overflow-hidden">
                  <button
                    onClick={() => setExpandedExecId(isExpanded ? null : exec.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {exec.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{exec.workflowName}</p>
                          {exec.routingDecision && (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                              exec.routingDecision.mode === "quick"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : exec.routingDecision.mode === "medium"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-blue-500/10 text-blue-400"
                            }`}>
                              {exec.routingDecision.mode}
                            </span>
                          )}
                          {exec.jiraKey && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[9px]">
                              {exec.jiraKey}
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5 truncate max-w-[600px]">
                          {exec.input}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                      <div className="text-right">
                        <p className={`font-mono text-xs font-semibold ${statusColors[exec.status] || ""}`}>
                          {exec.status}
                        </p>
                        {exec.totalDuration && (
                          <p className="font-mono text-[10px] text-muted-foreground flex items-center justify-end gap-1">
                            <Clock className="w-3 h-3" />
                            {(exec.totalDuration / 1000).toFixed(1)}s
                          </p>
                        )}
                      </div>
                      {isExpanded
                        ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      }
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-3 pb-3 pt-2 space-y-3 border-t border-border/30 ml-7">
                      {/* Full task input — selectable */}
                      <div className="space-y-1">
                        <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">Task Input</p>
                        <div className="bg-background rounded-lg p-3 border border-border/30 select-text cursor-text">
                          <p className="font-mono text-xs text-foreground/90 whitespace-pre-wrap break-words">{exec.input}</p>
                        </div>
                      </div>

                      {/* Step results — selectable logs */}
                      {Object.keys(exec.stepResults).length > 0 && (
                        <div className="space-y-1.5">
                          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">
                            Stage Results ({Object.keys(exec.stepResults).length} steps)
                          </p>
                          <div className="space-y-1 max-h-[300px] overflow-y-auto">
                            {Object.values(exec.stepResults)
                              .sort((a, b) => (a.startedAt || "").localeCompare(b.startedAt || ""))
                              .map((step) => {
                                const score = exec.qualityScores?.[step.stepId]?.overall;
                                return (
                              <details key={step.stepId} className="rounded-lg border border-border/30 overflow-hidden group">
                                <summary className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors">
                                  {step.status === "completed" ? (
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                                  ) : step.status === "failed" ? (
                                    <XCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
                                  ) : (
                                    <Clock className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                  )}
                                  <span className="font-mono text-[11px] font-medium">{step.stepId}</span>
                                  {score != null && (
                                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${
                                      score >= 8 ? "bg-emerald-500/10 text-emerald-400" :
                                      score >= 6 ? "bg-amber-500/10 text-amber-400" :
                                      "bg-red-500/10 text-red-400"
                                    }`}>{score}/10</span>
                                  )}
                                  {step.retryCount ? <span className="font-mono text-[9px] text-amber-400">R{step.retryCount}</span> : null}
                                  {step.error && <span className="font-mono text-[9px] text-red-400 truncate max-w-[200px]">{step.error}</span>}
                                </summary>
                                <div className="bg-background p-3 border-t border-border/30 select-text cursor-text max-h-[200px] overflow-y-auto">
                                  {step.evaluationFeedback && (
                                    <p className="font-mono text-[10px] text-amber-400/80 mb-2 whitespace-pre-wrap break-words">Feedback: {step.evaluationFeedback}</p>
                                  )}
                                  <pre className="font-mono text-[10px] text-foreground/80 whitespace-pre-wrap break-words">{step.output || step.error || "(no output)"}</pre>
                                </div>
                              </details>
                                );
                            })}
                          </div>
                        </div>
                      )}

                      {exec.status === "completed" && (
                        <div className="space-y-1.5">
                          <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <FileCode2 className="w-3 h-3" />
                            Detected Files ({detectedFiles.length})
                          </p>
                          {detectedFiles.length === 0 ? (
                            <p className="text-xs text-muted-foreground italic">No code blocks detected in output</p>
                          ) : (
                            <div className="space-y-1">
                              {detectedFiles.map((file, idx) => (
                                <div key={idx} className="rounded-lg border border-border/50 overflow-hidden">
                                  <div className="flex items-center justify-between px-2 py-1.5 bg-muted/30">
                                    <button
                                      onClick={() => toggleFileView(exec.id, idx)}
                                      className="flex items-center gap-2 text-left flex-1 min-w-0"
                                    >
                                      {expandedFileIdx[exec.id] === idx
                                        ? <ChevronDown className="w-3 h-3 text-primary flex-shrink-0" />
                                        : <ChevronRight className="w-3 h-3 text-primary flex-shrink-0" />
                                      }
                                      <span className="font-mono text-[11px] text-foreground truncate">{file.filePath}</span>
                                      <span className={`font-mono text-[9px] flex-shrink-0 ${file.action === "modify" ? "text-amber-400" : "text-emerald-400"}`}>{file.action}</span>
                                      <span className="font-mono text-[9px] text-muted-foreground flex-shrink-0">{file.language} · {file.content.split("\n").length} lines</span>
                                    </button>
                                    <button
                                      onClick={() => downloadFile(file)}
                                      className="p-1 hover:bg-muted rounded transition-colors flex-shrink-0"
                                      title={`Download ${file.filePath}`}
                                    >
                                      <Download className="w-3 h-3 text-muted-foreground" />
                                    </button>
                                  </div>
                                  {expandedFileIdx[exec.id] === idx && (
                                    <pre className="p-3 text-[10px] font-mono text-foreground/80 bg-background overflow-x-auto max-h-[250px] overflow-y-auto border-t border-border/30">
                                      <code>{file.content}</code>
                                    </pre>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {/* Resume button for failed/paused/stopped */}
                        {(exec.status === "failed" || exec.status === "paused" || exec.status === "stopped") && (
                          <button
                            onClick={() => resumeExecution(exec)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 font-mono text-[10px] uppercase tracking-wider transition-all"
                          >
                            <Play className="w-3 h-3" />
                            Resume
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {exec.status === "completed" && detectedFiles.length > 0 && !applyResult[exec.id]?.staged && !applyResult[exec.id]?.success && (
                          <button
                            onClick={() => handleStageFiles(exec)}
                            disabled={applyingId === exec.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                          >
                            {applyingId === exec.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Rocket className="w-3 h-3" />
                            )}
                            Stage Files
                          </button>
                        )}

                        {/* Staged — show Deploy + Discard */}
                        {applyResult[exec.id]?.staged && (
                          <>
                            <span className="font-mono text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {applyResult[exec.id]!.summary?.staged ?? 0} files staged
                            </span>
                            <button
                              onClick={() => handleDeployToSource(exec.id)}
                              disabled={deployingId === exec.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/20 font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-50"
                            >
                              {deployingId === exec.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3 h-3" />
                              )}
                              Deploy to Source
                            </button>
                            <button
                              onClick={() => handleDiscardStaged(exec.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-red-400 hover:border-red-500/50 font-mono text-[10px] uppercase tracking-wider transition-all"
                            >
                              <XCircle className="w-3 h-3" />
                              Discard
                            </button>
                          </>
                        )}

                        {/* Deployed successfully */}
                        {applyResult[exec.id]?.success && !applyResult[exec.id]?.staged && (
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono text-[10px] uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Deployed ({applyResult[exec.id]!.summary?.created ?? 0} created, {applyResult[exec.id]!.summary?.updated ?? 0} updated)
                          </span>
                        )}

                        <button
                          onClick={() => {
                            const blob = new Blob([JSON.stringify(exec, null, 2)], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `pipeline-${exec.routingDecision?.mode || "run"}-${exec.id.slice(0, 8)}.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors font-mono text-[10px] uppercase tracking-wider"
                        >
                          <Download className="w-3 h-3" />
                          Export JSON
                        </button>
                      </div>

                      {/* Error feedback */}
                      {applyResult[exec.id]?.success === false && !applyResult[exec.id]?.staged && (
                        <div className="font-mono text-[10px] px-2 py-1.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                          {deployingId ? "Deploy" : "Stage"} failed{applyResult[exec.id]!.summary?.errors ? ` — ${applyResult[exec.id]!.summary!.errors} errors` : ""}. Check file paths.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Discard Feedback Dialog */}
      {discardTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setDiscardTarget(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-[420px] space-y-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-sm">Why are you discarding?</h3>
            <p className="text-xs text-muted-foreground">This feedback helps agents learn from mistakes and avoid repeating them.</p>
            <select
              value={discardCategory}
              onChange={(e) => setDiscardCategory(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              <option value="wrong-files">Wrong files or paths</option>
              <option value="bad-code">Code doesn&apos;t compile or has bugs</option>
              <option value="wrong-approach">Wrong architectural approach</option>
              <option value="broke-something">Broke existing functionality</option>
              <option value="other">Other</option>
            </select>
            <textarea
              value={discardReason}
              onChange={(e) => setDiscardReason(e.target.value)}
              placeholder="Describe what went wrong (optional but helps future runs)..."
              rows={3}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDiscardTarget(null)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDiscard}
                className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 text-sm font-medium transition-colors"
              >
                Discard & Save Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow naming dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setShowNameDialog(null)}>
          <div className="bg-card border border-border rounded-xl p-6 w-[420px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {showNameDialog === "template" ? "Create from CRM Template" : "New Workflow"}
              </h3>
              <button onClick={() => setShowNameDialog(null)} className="p-1 hover:text-destructive transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {showNameDialog === "template"
                ? "13-step CRM pipeline with all agents. Name your workflow or leave blank for auto-generated name."
                : "Create an empty workflow and add steps manually."}
            </p>
            <input
              autoFocus
              value={newWfName}
              onChange={(e) => setNewWfName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") confirmCreateWorkflow(); if (e.key === "Escape") setShowNameDialog(null); }}
              placeholder={showNameDialog === "template" ? "e.g. Beauty CRM v2" : "e.g. My Custom Pipeline"}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors mb-4"
              maxLength={100}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNameDialog(null)} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors">
                Cancel
              </button>
              <button onClick={confirmCreateWorkflow} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recruitment Center */}
      <RecruitmentCenter
        open={showRecruitment}
        onClose={() => { setShowRecruitment(false); setInsertPosition(null); }}
        onAddAgent={handleAddAgent}
        onAddParallelAgents={handleAddParallelAgents}
        existingAgentIds={selectedWorkflow?.steps.map((s) => s.agentId) || []}
      />
    </div>
  );
}
