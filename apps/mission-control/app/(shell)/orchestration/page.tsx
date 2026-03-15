"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GitBranch, Plus, Play, Trash2, History, Clock, CheckCircle2, XCircle, ExternalLink, Brain, Loader2, Download, FolderOpen, ChevronDown, ChevronRight, FileCode2, Rocket, Pencil, Check } from "lucide-react";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { CRM_PIPELINE_TEMPLATE } from "@/lib/pipeline-templates";
import { executePipeline } from "@/lib/pipeline-executor";
import { filterStepsForRouting } from "@/lib/pipeline-step-filter";
import { recalculateForMode } from "@/lib/pipeline-mode-utils";
import { parseCodeBlocks, type ParsedCodeBlock } from "@/lib/code-block-parser";
import { PipelineGraph } from "@/components/orchestration/pipeline-graph";
import { StageDetailPanel } from "@/components/orchestration/stage-detail-panel";
import { RoutingDecisionPanel } from "@/components/orchestration/routing-decision-panel";
import type { Workflow, PipelineExecution, RoutingDecisionData, ExecutionMode } from "@/types";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function OrchestrationPage() {
  const {
    workflows, addWorkflow, deleteWorkflow, updateWorkflow,
    activeExecution, setActiveExecution, addToHistory,
    executionHistory,
    selectedStageId, selectStage,
    selectedProject, setSelectedProject,
    approveCheckpoint, rejectCheckpoint,
  } = useOrchestrationStore();
  const [input, setInput] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
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

  // Available projects for context injection
  const [availableProjects, setAvailableProjects] = useState<string[]>([]);
  useEffect(() => {
    fetch("/api/projects/list")
      .then((r) => r.json())
      .then((d) => setAvailableProjects(d.projects || []))
      .catch(() => {});
  }, []);

  // Checkpoint resolution refs
  const checkpointResolveRef = useRef<((approved: boolean) => void) | null>(null);
  const checkpointStatusRef = useRef<{ approved: boolean; rejected: boolean; reason?: string }>({
    approved: false,
    rejected: false,
  });

  function createFromTemplate() {
    const wf: Workflow = {
      ...CRM_PIPELINE_TEMPLATE,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    addWorkflow(wf);
    setSelectedWorkflow(wf);
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
      },
      routingDecision,
      selectedProject,
    );

    addToHistory(result);
    setRoutingDecision(null);
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
        // staged=true, success=false: files are staged but NOT yet deployed
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
    // Save feedback to knowledge base
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
    // Delete staged files
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
    URL.revokeObjectURL(url);
  }

  function toggleFileView(execId: string, idx: number) {
    setExpandedFileIdx((prev) => ({
      ...prev,
      [execId]: prev[execId] === idx ? null : idx,
    }));
  }

  // Keep selectedWorkflow in sync with store (so rename reflects immediately in header)
  const syncedSelectedWorkflow = selectedWorkflow
    ? (workflows.find((w) => w.id === selectedWorkflow.id) ?? selectedWorkflow)
    : null;

  const selectedStep = syncedSelectedWorkflow?.steps.find((s) => s.id === selectedStageId);

  const statusColors: Record<string, string> = {
    pending: "text-muted-foreground",
    running: "text-blue-500",
    completed: "text-emerald-500",
    failed: "text-red-500",
    paused: "text-amber-500",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Orchestration</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Smart multi-agent workflow pipelines
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={createFromTemplate} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm hover:border-primary/50 transition-colors">
            <GitBranch className="w-4 h-4" /> CRM Pipeline Template
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs uppercase tracking-wider hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> New Workflow
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-12rem)]">
        {/* Workflow list */}
        <div className="w-72 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-bold text-sm">Workflows</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {workflows.map((wf) => (
              <div key={wf.id} className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                selectedWorkflow?.id === wf.id ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
              }`}>
                <button onClick={() => setSelectedWorkflow(wf)} className="text-left flex-1 min-w-0">
                  {editingWfId === wf.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          const trimmed = editingName.trim();
                          if (trimmed) updateWorkflow(wf.id, { name: trimmed });
                          setEditingWfId(null);
                        }
                        if (e.key === "Escape") setEditingWfId(null);
                      }}
                      onBlur={() => {
                        const trimmed = editingName.trim();
                        if (trimmed) updateWorkflow(wf.id, { name: trimmed });
                        setEditingWfId(null);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      maxLength={100}
                      className="w-full bg-background border border-primary/30 rounded px-1.5 py-0.5 text-sm font-medium focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <div className="text-sm font-medium truncate">{wf.name}</div>
                  )}
                  <div className="font-mono text-[10px] text-muted-foreground">{wf.steps.length} steps</div>
                </button>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingWfId(wf.id); setEditingName(wf.name); }}
                    className="p-1 hover:text-primary transition-colors"
                    title="Rename"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteWorkflow(wf.id)} className="p-1 hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {workflows.length === 0 && (
              <p className="text-center font-mono text-[10px] text-muted-foreground py-8">
                No workflows yet. Create from template.
              </p>
            )}
          </div>
        </div>

        {/* Workflow detail + execution */}
        <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
          {selectedWorkflow ? (
            <>
              <div className="px-6 py-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-bold text-lg">{selectedWorkflow.name}</h2>
                      <button
                        onClick={() => { setEditingWfId(selectedWorkflow.id); setEditingName(selectedWorkflow.name); }}
                        className="p-1 hover:text-primary transition-colors opacity-50 hover:opacity-100"
                        title="Rename pipeline"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{selectedWorkflow.description}</p>
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
                  selectedStageId={selectedStageId}
                  onSelectStage={selectStage}
                  onApproveCheckpoint={handleApproveCheckpoint}
                  onRejectCheckpoint={handleRejectCheckpoint}
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
                      onChange={(e) => setSelectedProject(e.target.value || null)}
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
                    onChange={(e) => setInput(e.target.value)}
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
              <p className="font-mono text-sm">Select or create a workflow</p>
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
                        <p className="font-mono text-[10px] text-muted-foreground whitespace-pre-wrap break-words mt-0.5">
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

                      {/* Action buttons — two-step: Stage → Deploy */}
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
    </div>
  );
}
