"use client";

import { useState, useCallback, useRef } from "react";
import { GitBranch, Plus, Play, Trash2, History, Clock, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { CRM_PIPELINE_TEMPLATE } from "@/lib/pipeline-templates";
import { executePipeline } from "@/lib/pipeline-executor";
import { PipelineGraph } from "@/components/orchestration/pipeline-graph";
import { StageDetailPanel } from "@/components/orchestration/stage-detail-panel";
import type { Workflow, PipelineExecution } from "@/types";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

export default function OrchestrationPage() {
  const {
    workflows, addWorkflow, deleteWorkflow,
    activeExecution, setActiveExecution, addToHistory,
    executionHistory,
    selectedStageId, selectStage,
    approveCheckpoint, rejectCheckpoint,
  } = useOrchestrationStore();
  const [input, setInput] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

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

  async function executeWorkflow() {
    if (!selectedWorkflow || !input.trim()) return;

    checkpointStatusRef.current = { approved: false, rejected: false };

    const result = await executePipeline(
      selectedWorkflow.steps,
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
    );

    addToHistory(result);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Orchestration</h1>
          <p className="font-mono text-xs text-muted-foreground mt-1 tracking-wider uppercase">
            Multi-agent workflow pipelines
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
                <button onClick={() => setSelectedWorkflow(wf)} className="text-left flex-1">
                  <div className="text-sm font-medium">{wf.name}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">{wf.steps.length} steps</div>
                </button>
                <button onClick={() => deleteWorkflow(wf.id)} className="p-1 hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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
                    <h2 className="font-bold text-lg">{selectedWorkflow.name}</h2>
                    <p className="text-xs text-muted-foreground mt-1">{selectedWorkflow.description}</p>
                  </div>
                  {activeExecution && (
                    <div className="flex items-center gap-3">
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

              {/* Execute bar */}
              <div className="border-t border-border p-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Enter task to execute pipeline..."
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                  <button
                    onClick={executeWorkflow}
                    disabled={!input.trim() || activeExecution?.status === "running"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all font-mono text-xs uppercase tracking-wider"
                  >
                    <Play className="w-4 h-4" /> Execute
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
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <h2 className="font-bold text-sm">Execution History</h2>
          </div>
          <div className="p-2 space-y-1 max-h-[200px] overflow-y-auto">
            {executionHistory.map((exec) => (
              <div key={exec.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  {exec.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{exec.workflowName}</p>
                    <p className="font-mono text-[10px] text-muted-foreground truncate max-w-[300px]">
                      {exec.input}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className={`font-mono text-xs font-semibold ${statusColors[exec.status] || ""}`}>
                      {exec.status}
                    </p>
                    {exec.totalDuration && (
                      <p className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {(exec.totalDuration / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
