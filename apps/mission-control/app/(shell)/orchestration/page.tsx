"use client";

import { useState } from "react";
import { GitBranch, Plus, Play, Trash2 } from "lucide-react";
import { useAgents } from "@/lib/hooks/use-agents";
import { useOrchestrationStore } from "@/lib/stores/orchestration-store";
import { postLog } from "@/lib/hooks/use-logs";
import type { Workflow, WorkflowStep, PipelineExecution, StepResult } from "@/types";

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// Pre-built template
const CRM_PIPELINE_TEMPLATE: Omit<Workflow, "id" | "createdAt"> = {
  name: "Beauty CRM Full Pipeline",
  description: "Full development pipeline: PM → Architect → Backend/Frontend → QA → DevOps",
  steps: [
    { id: "s1", agentId: "pm-agent", agentName: "PM-Agent", promptTemplate: "Create a detailed PRD for: {{input}}", dependsOn: [], outputKey: "prd" },
    { id: "s2", agentId: "architect-agent", agentName: "Architect-Agent", promptTemplate: "Design technical architecture based on this PRD:\n{{step_s1_output}}", dependsOn: ["s1"], outputKey: "architecture" },
    { id: "s3", agentId: "backend-agent", agentName: "Backend-Agent", promptTemplate: "Create backend implementation plan based on:\n{{step_s2_output}}", dependsOn: ["s2"], outputKey: "backend_plan" },
    { id: "s4", agentId: "frontend-agent", agentName: "Frontend-Agent", promptTemplate: "Create frontend implementation plan based on:\n{{step_s2_output}}", dependsOn: ["s2"], outputKey: "frontend_plan" },
    { id: "s5", agentId: "qa-agent", agentName: "QA-Agent", promptTemplate: "Generate test cases for:\nBackend: {{step_s3_output}}\nFrontend: {{step_s4_output}}", dependsOn: ["s3", "s4"], outputKey: "test_plan" },
  ],
};

export default function OrchestrationPage() {
  const { agents } = useAgents();
  const { workflows, addWorkflow, deleteWorkflow, activeExecution, setActiveExecution } = useOrchestrationStore();
  const [input, setInput] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  function createFromTemplate() {
    const wf: Workflow = {
      ...CRM_PIPELINE_TEMPLATE,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    addWorkflow(wf);
    setSelectedWorkflow(wf);
  }

  async function executeWorkflow() {
    if (!selectedWorkflow || !input.trim()) return;

    const execution: PipelineExecution = {
      id: generateId(),
      workflowId: selectedWorkflow.id,
      workflowName: selectedWorkflow.name,
      status: "running",
      input,
      stepResults: {},
      startedAt: new Date().toISOString(),
    };

    // Initialize all steps as pending
    selectedWorkflow.steps.forEach((s) => {
      execution.stepResults[s.id] = { stepId: s.id, status: "pending" };
    });
    setActiveExecution({ ...execution });

    // Log pipeline start
    postLog({
      type: "system",
      content: `Pipeline "${selectedWorkflow!.name}" started with input: ${input.slice(0, 200)}`,
    }).catch(() => {});

    // Topological execution
    const completed = new Set<string>();
    const context: Record<string, string> = {};

    async function executeStep(step: WorkflowStep) {
      execution.stepResults[step.id] = { stepId: step.id, status: "running", startedAt: new Date().toISOString() };
      setActiveExecution({ ...execution });

      let prompt = step.promptTemplate.replace(/\{\{input\}\}/g, input);
      for (const [key, val] of Object.entries(context)) {
        prompt = prompt.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
      }

      try {
        const res = await fetch("/api/agent-hub/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assistantId: step.agentId, userInput: prompt }),
        });
        const data = await res.json();

        if (data.success && data.content) {
          context[`step_${step.id}_output`] = data.content;
          execution.stepResults[step.id] = {
            stepId: step.id,
            status: "completed",
            output: data.content.substring(0, 500),
            duration: Date.now() - new Date(execution.stepResults[step.id].startedAt!).getTime(),
            completedAt: new Date().toISOString(),
          };
        } else {
          throw new Error(data.error || "Execution failed");
        }
        // Log step completion
        postLog({
          type: "decision",
          agentId: step.agentId,
          agentName: step.agentName,
          content: `Step completed in pipeline "${selectedWorkflow!.name}": ${data.content?.slice(0, 200) || "no output"}`,
        }).catch(() => {});
      } catch (err) {
        execution.stepResults[step.id] = {
          stepId: step.id,
          status: "failed",
          error: err instanceof Error ? err.message : "Unknown error",
          completedAt: new Date().toISOString(),
        };

        // Log step failure
        postLog({
          type: "system",
          agentId: step.agentId,
          agentName: step.agentName,
          content: `Step FAILED in pipeline "${selectedWorkflow!.name}": ${err instanceof Error ? err.message : "Unknown error"}`,
        }).catch(() => {});
      }

      completed.add(step.id);
      setActiveExecution({ ...execution });
    }

    // Simple sequential execution (respecting deps)
    const steps = [...selectedWorkflow.steps];
    while (steps.length > 0) {
      const ready = steps.filter((s) => s.dependsOn.every((d) => completed.has(d)));
      if (ready.length === 0) break;
      await Promise.all(ready.map(executeStep));
      ready.forEach((r) => {
        const idx = steps.findIndex((s) => s.id === r.id);
        if (idx >= 0) steps.splice(idx, 1);
      });
    }

    execution.status = Object.values(execution.stepResults).some((r) => r.status === "failed") ? "failed" : "completed";
    execution.completedAt = new Date().toISOString();
    setActiveExecution({ ...execution });
  }

  const statusIcons: Record<string, string> = {
    pending: "⏳",
    running: "🔄",
    completed: "✅",
    failed: "❌",
    skipped: "⏭️",
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
                <h2 className="font-bold text-lg">{selectedWorkflow!.name}</h2>
                <p className="text-xs text-muted-foreground mt-1">{selectedWorkflow.description}</p>
              </div>

              {/* Pipeline visualization */}
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {selectedWorkflow.steps.map((step, i) => {
                  const result = activeExecution?.stepResults[step.id];
                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg border ${
                          result?.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" :
                          result?.status === "running" ? "bg-blue-500/10 border-blue-500/30 animate-pulse" :
                          result?.status === "failed" ? "bg-red-500/10 border-red-500/30" :
                          "bg-muted border-border"
                        }`}>
                          {result ? statusIcons[result.status] : (i + 1)}
                        </div>
                        {i < selectedWorkflow.steps.length - 1 && (
                          <div className="w-px h-6 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm">{step.agentName}</span>
                          {step.dependsOn.length > 0 && (
                            <span className="font-mono text-[9px] text-muted-foreground">
                              depends: {step.dependsOn.join(", ")}
                            </span>
                          )}
                          {result?.duration && (
                            <span className="font-mono text-[10px] text-secondary">
                              {(result.duration / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <p className="font-mono text-[11px] text-muted-foreground mt-1 line-clamp-2">
                          {step.promptTemplate.substring(0, 100)}...
                        </p>
                        {result?.output && (
                          <div className="mt-2 p-3 bg-background rounded-lg border border-border">
                            <p className="font-mono text-[11px] text-foreground/80 line-clamp-4">{result.output}</p>
                          </div>
                        )}
                        {result?.error && (
                          <p className="mt-1 font-mono text-[11px] text-destructive">{result.error}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
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
    </div>
  );
}
