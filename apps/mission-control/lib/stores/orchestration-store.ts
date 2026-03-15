"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workflow, PipelineExecution } from "@/types";

interface OrchestrationState {
  workflows: Workflow[];
  activeExecution: PipelineExecution | null;
  executionHistory: PipelineExecution[];
  selectedStageId: string | null;
  selectedProject: string | null;
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveExecution: (execution: PipelineExecution | null) => void;
  addToHistory: (execution: PipelineExecution) => void;
  selectStage: (id: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  approveCheckpoint: (executionId: string) => void;
  rejectCheckpoint: (executionId: string, reason: string) => void;
}

export const useOrchestrationStore = create<OrchestrationState>()(
  persist(
    (set, get) => ({
      workflows: [],
      activeExecution: null,
      executionHistory: [],
      selectedStageId: null,
      selectedProject: null,
      addWorkflow: (workflow) =>
        set((s) => ({ workflows: [...s.workflows, workflow] })),
      updateWorkflow: (id, updates) =>
        set((s) => ({
          workflows: s.workflows.map((w) =>
            w.id === id ? { ...w, ...updates } : w,
          ),
        })),
      deleteWorkflow: (id) =>
        set((s) => ({
          workflows: s.workflows.filter((w) => w.id !== id),
        })),
      setActiveExecution: (execution) =>
        set({ activeExecution: execution }),
      addToHistory: (execution) =>
        set((s) => ({
          executionHistory: [execution, ...s.executionHistory].slice(0, 50),
        })),
      selectStage: (id) =>
        set({ selectedStageId: id }),
      setSelectedProject: (projectId) =>
        set({ selectedProject: projectId }),
      approveCheckpoint: (executionId) => {
        const { activeExecution } = get();
        if (!activeExecution || activeExecution.id !== executionId) return;
        set({
          activeExecution: {
            ...activeExecution,
            checkpointPending: false,
            status: "running",
          },
        });
      },
      rejectCheckpoint: (executionId, reason) => {
        const { activeExecution } = get();
        if (!activeExecution || activeExecution.id !== executionId) return;
        const updated: PipelineExecution = {
          ...activeExecution,
          checkpointPending: false,
          checkpointRejectionReason: reason,
          status: "failed",
          completedAt: new Date().toISOString(),
        };
        // Mark checkpoint step as failed
        const checkpointStep = Object.values(updated.stepResults).find(
          (r) => r.status === "awaiting_approval",
        );
        if (checkpointStep) {
          updated.stepResults[checkpointStep.stepId] = {
            ...checkpointStep,
            status: "failed",
            error: `Rejected: ${reason}`,
            completedAt: new Date().toISOString(),
          };
        }
        set({ activeExecution: updated });
      },
    }),
    {
      name: "mission-control-orchestration",
      partialize: (state) => ({
        workflows: state.workflows,
        executionHistory: state.executionHistory,
        selectedProject: state.selectedProject,
      }),
    },
  ),
);
