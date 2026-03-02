"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workflow, PipelineExecution } from "@/types";

interface OrchestrationState {
  workflows: Workflow[];
  activeExecution: PipelineExecution | null;
  executionHistory: PipelineExecution[];
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveExecution: (execution: PipelineExecution | null) => void;
  addToHistory: (execution: PipelineExecution) => void;
}

export const useOrchestrationStore = create<OrchestrationState>()(
  persist(
    (set) => ({
      workflows: [],
      activeExecution: null,
      executionHistory: [],
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
    }),
    {
      name: "mission-control-orchestration",
      partialize: (state) => ({ workflows: state.workflows }),
    },
  ),
);
