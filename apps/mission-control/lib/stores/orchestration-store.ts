"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Workflow, PipelineExecution, WorkflowSlot, SlotStatus, WorkflowStep, QueuedTask } from "@/types";
import { CRM_PIPELINE_TEMPLATE } from "@/lib/pipeline-templates";

const DEFAULT_CRM_TEMPLATE_ID = "default-crm-template";

function getDefaultCrmWorkflow(): Workflow {
  return {
    ...CRM_PIPELINE_TEMPLATE,
    id: DEFAULT_CRM_TEMPLATE_ID,
    isTemplate: true,
    createdAt: "2025-01-01T00:00:00.000Z",
  };
}

function createEmptySlot(id: 0 | 1 | 2 | 3): WorkflowSlot {
  return {
    id,
    workflowId: null,
    workflowName: null,
    status: "empty",
    projectContext: null,
    lastInput: "",
    executionId: null,
    progress: 0,
  };
}

interface OrchestrationState {
  workflows: Workflow[];
  activeExecution: PipelineExecution | null;
  executionHistory: PipelineExecution[];
  selectedStageId: string | null;
  selectedProject: string | null;
  // Pipeline control flags
  pauseRequested: boolean;
  stopRequested: boolean;
  // V2: Slot system
  slots: [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
  activeSlotIndex: 0 | 1 | 2 | 3;
  // V2: Core pipeline per project
  corePipelines: Record<string, string>; // projectId → workflowId
  // Workflow actions
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void;
  deleteWorkflow: (id: string) => void;
  setActiveExecution: (execution: PipelineExecution | null) => void;
  addToHistory: (execution: PipelineExecution) => void;
  selectStage: (id: string | null) => void;
  setSelectedProject: (projectId: string | null) => void;
  approveCheckpoint: (executionId: string) => void;
  rejectCheckpoint: (executionId: string, reason: string) => void;
  requestPause: () => void;
  requestStop: () => void;
  clearControlFlags: () => void;
  // V2: Slot actions
  setActiveSlot: (index: 0 | 1 | 2 | 3) => void;
  loadWorkflowToSlot: (slotIndex: 0 | 1 | 2 | 3, workflow: Workflow) => void;
  clearSlot: (slotIndex: 0 | 1 | 2 | 3) => void;
  updateSlotStatus: (slotIndex: 0 | 1 | 2 | 3, status: SlotStatus) => void;
  updateSlotProject: (slotIndex: 0 | 1 | 2 | 3, projectContext: string | null) => void;
  updateSlotInput: (slotIndex: 0 | 1 | 2 | 3, input: string) => void;
  insertStepAtPosition: (workflowId: string, step: WorkflowStep, position: number) => void;
  removeStep: (workflowId: string, stepId: string) => void;
  reorderStep: (workflowId: string, fromIndex: number, toIndex: number) => void;
  toggleStepDisabled: (workflowId: string, stepId: string) => void;
  toggleStepParallel: (workflowId: string, stepId: string) => void;
  duplicateStep: (workflowId: string, stepId: string) => void;
  duplicateWorkflowToSlot: (workflowId: string) => void;
  // V2: Core pipeline
  setCorePipeline: (projectId: string, workflowId: string) => void;
  clearCorePipeline: (projectId: string) => void;
  getCorePipelineId: (projectId: string) => string | null;
  // Task queue
  taskQueue: QueuedTask[];
  enqueueTask: (task: QueuedTask) => void;
  dequeueTask: () => QueuedTask | null;
  clearQueue: () => void;
}

export const useOrchestrationStore = create<OrchestrationState>()(
  persist(
    (set, get) => ({
      workflows: [getDefaultCrmWorkflow()],
      activeExecution: null,
      executionHistory: [],
      selectedStageId: null,
      pauseRequested: false,
      stopRequested: false,
      selectedProject: null,
      taskQueue: [],
      // V2: Slot defaults
      slots: [
        createEmptySlot(0),
        createEmptySlot(1),
        createEmptySlot(2),
        createEmptySlot(3),
      ] as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot],
      activeSlotIndex: 0 as 0 | 1 | 2 | 3,
      corePipelines: {} as Record<string, string>,

      addWorkflow: (workflow) =>
        set((s) => ({ workflows: [...s.workflows, workflow] })),
      updateWorkflow: (id, updates) =>
        set((s) => ({
          workflows: s.workflows.map((w) =>
            w.id === id ? { ...w, ...updates } : w,
          ),
        })),
      deleteWorkflow: (id) => {
        const { corePipelines } = get();
        // Prevent deleting a core pipeline
        const isCore = Object.values(corePipelines).includes(id);
        if (isCore) return;
        set((s) => ({
          workflows: s.workflows.filter((w) => w.id !== id),
          // Also clear any slot referencing this workflow
          slots: s.slots.map((slot) =>
            slot.workflowId === id ? createEmptySlot(slot.id) : slot,
          ) as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot],
        }));
      },
      setActiveExecution: (execution) =>
        set({ activeExecution: execution }),
      addToHistory: (execution) =>
        set((s) => ({
          executionHistory: [execution, ...s.executionHistory.filter((e) => e.id !== execution.id)].slice(0, 50),
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
      requestPause: () => set({ pauseRequested: true }),
      requestStop: () => set({ stopRequested: true }),
      clearControlFlags: () => set({ pauseRequested: false, stopRequested: false }),

      // V2: Slot actions
      setActiveSlot: (index) => set({ activeSlotIndex: index }),

      loadWorkflowToSlot: (slotIndex, workflow) =>
        set((s) => {
          const slots = [...s.slots] as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
          slots[slotIndex] = {
            id: slotIndex as 0 | 1 | 2 | 3,
            workflowId: workflow.id,
            workflowName: workflow.name,
            status: "idle",
            projectContext: s.selectedProject,
            lastInput: "",
            executionId: null,
            progress: 0,
          };
          return { slots, activeSlotIndex: slotIndex as 0 | 1 | 2 | 3 };
        }),

      clearSlot: (slotIndex) =>
        set((s) => {
          const slots = [...s.slots] as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
          slots[slotIndex] = createEmptySlot(slotIndex as 0 | 1 | 2 | 3);
          return { slots };
        }),

      updateSlotStatus: (slotIndex, status) =>
        set((s) => {
          const slots = [...s.slots] as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
          slots[slotIndex] = { ...slots[slotIndex], status };
          return { slots };
        }),

      updateSlotProject: (slotIndex, projectContext) =>
        set((s) => {
          const slots = [...s.slots] as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
          slots[slotIndex] = { ...slots[slotIndex], projectContext };
          return { slots };
        }),

      updateSlotInput: (slotIndex, input) =>
        set((s) => {
          const slots = [...s.slots] as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
          slots[slotIndex] = { ...slots[slotIndex], lastInput: input };
          return { slots };
        }),

      insertStepAtPosition: (workflowId, step, position) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const steps = [...w.steps];
            steps.splice(position, 0, step);
            return { ...w, steps };
          }),
        })),

      removeStep: (workflowId, stepId) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            return { ...w, steps: w.steps.filter((st) => st.id !== stepId) };
          }),
        })),

      reorderStep: (workflowId, fromIndex, toIndex) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const steps = [...w.steps];
            const [moved] = steps.splice(fromIndex, 1);
            steps.splice(toIndex, 0, moved);
            return { ...w, steps };
          }),
        })),

      toggleStepDisabled: (workflowId, stepId) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            return {
              ...w,
              steps: w.steps.map((st) =>
                st.id !== stepId ? st : {
                  ...st,
                  metadata: {
                    qualityThreshold: 7, leadAgent: st.agentId, model: "unknown", stageNumber: "0",
                    ...st.metadata,
                    disabled: !st.metadata?.disabled,
                  },
                },
              ),
            };
          }),
        })),

      toggleStepParallel: (workflowId, stepId) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            return {
              ...w,
              steps: w.steps.map((st) => {
                if (st.id !== stepId) return st;
                const wasParallel = st.metadata?.isParallel;
                return {
                  ...st,
                  metadata: {
                    qualityThreshold: 7, leadAgent: st.agentId, model: "unknown", stageNumber: "0",
                    ...st.metadata,
                    isParallel: !wasParallel,
                    group: wasParallel ? undefined : `parallel-${stepId}`,
                  },
                };
              }),
            };
          }),
        })),

      duplicateStep: (workflowId, stepId) =>
        set((s) => ({
          workflows: s.workflows.map((w) => {
            if (w.id !== workflowId) return w;
            const idx = w.steps.findIndex((st) => st.id === stepId);
            if (idx === -1) return w;
            const original = w.steps[idx];
            const clone: WorkflowStep = {
              ...original,
              id: `${original.id}-copy-${Math.random().toString(36).slice(2, 6)}`,
              metadata: original.metadata ? { ...original.metadata } : undefined,
            };
            const steps = [...w.steps];
            steps.splice(idx + 1, 0, clone);
            return { ...w, steps };
          }),
        })),

      setCorePipeline: (projectId, workflowId) =>
        set((s) => ({
          corePipelines: { ...s.corePipelines, [projectId]: workflowId },
        })),

      clearCorePipeline: (projectId) =>
        set((s) => {
          const next = { ...s.corePipelines };
          delete next[projectId];
          return { corePipelines: next };
        }),

      getCorePipelineId: (projectId) => {
        return get().corePipelines[projectId] ?? null;
      },

      duplicateWorkflowToSlot: (workflowId) => {
        const { workflows, slots } = get();
        const wf = workflows.find((w) => w.id === workflowId);
        if (!wf) return;
        const emptyIdx = slots.findIndex((s) => s.status === "empty");
        if (emptyIdx === -1) return; // No empty slots
        const cloneId = Math.random().toString(36).substring(2, 10);
        const clone: Workflow = {
          ...wf,
          id: cloneId,
          name: `${wf.name} (copy)`,
          steps: wf.steps.map((s) => ({ ...s, metadata: s.metadata ? { ...s.metadata } : undefined })),
          createdAt: new Date().toISOString(),
          isTemplate: false,
        };
        const slotIdx = emptyIdx as 0 | 1 | 2 | 3;
        const newSlots = [...slots] as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
        newSlots[slotIdx] = {
          id: slotIdx,
          workflowId: cloneId,
          workflowName: clone.name,
          status: "idle",
          projectContext: null,
          lastInput: "",
          executionId: null,
          progress: 0,
        };
        set({
          workflows: [...workflows, clone],
          slots: newSlots,
          activeSlotIndex: slotIdx,
        });
      },

      // Task queue
      enqueueTask: (task) => set((s) => ({ taskQueue: [...s.taskQueue, task] })),
      dequeueTask: () => {
        const { taskQueue } = get();
        if (taskQueue.length === 0) return null;
        const [next, ...rest] = taskQueue;
        set({ taskQueue: rest });
        return next;
      },
      clearQueue: () => set({ taskQueue: [] }),
    }),
    {
      name: "mission-control-orchestration",
      version: 2,
      partialize: (state) => ({
        workflows: state.workflows,
        executionHistory: state.executionHistory,
        selectedProject: state.selectedProject,
        slots: state.slots,
        activeSlotIndex: state.activeSlotIndex,
        corePipelines: state.corePipelines,
        activeExecution: state.activeExecution,
        taskQueue: state.taskQueue,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<OrchestrationState> | undefined;
        const isValidSlot = (s: unknown): s is WorkflowSlot =>
          typeof s === "object" && s !== null && "id" in s && "status" in s && "workflowId" in s;
        // Seed default CRM template if not present
        const workflows = Array.isArray(p?.workflows) ? p.workflows : [];
        const hasDefault = workflows.some((w: Workflow) => w.id === DEFAULT_CRM_TEMPLATE_ID);
        const seededWorkflows = hasDefault ? workflows : [getDefaultCrmWorkflow(), ...workflows];
        // Recover activeExecution — mark as interrupted if it was mid-run when browser closed
        const recoveredExecution = (() => {
          const exec = p?.activeExecution;
          if (!exec || !exec.id) return null;
          if (exec.status === "running") return { ...exec, status: "interrupted" as const };
          if (exec.status === "paused") return exec;
          // completed/failed/stopped — no need to persist
          return null;
        })();

        return {
          ...current,
          ...p,
          activeExecution: recoveredExecution,
          workflows: seededWorkflows,
          slots: (p?.slots && Array.isArray(p.slots) && p.slots.length === 4 && p.slots.every(isValidSlot)
            ? p.slots
            : [createEmptySlot(0), createEmptySlot(1), createEmptySlot(2), createEmptySlot(3)]
          ) as [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot],
          activeSlotIndex: (p?.activeSlotIndex != null && p.activeSlotIndex >= 0 && p.activeSlotIndex <= 3
            ? p.activeSlotIndex
            : 0
          ) as 0 | 1 | 2 | 3,
          corePipelines: (typeof p?.corePipelines === "object" && p.corePipelines !== null)
            ? Object.fromEntries(
                Object.entries(p.corePipelines as Record<string, unknown>)
                  .filter((entry): entry is [string, string] => typeof entry[1] === "string")
              )
            : {},
        };
      },
    },
  ),
);
