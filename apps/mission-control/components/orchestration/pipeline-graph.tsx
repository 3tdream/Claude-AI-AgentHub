"use client";

import { useState, useCallback } from "react";
import type { WorkflowStep, PipelineExecution } from "@/types";
import { StageNode } from "./stage-node";
import { ParallelBranch } from "./parallel-branch";
import { CheckpointGate } from "./checkpoint-gate";
import { InsertStepButton } from "./insert-step-button";
import { StageContextMenu } from "./stage-context-menu";
import { ArrowRight } from "lucide-react";

interface PipelineGraphProps {
  steps: WorkflowStep[];
  execution: PipelineExecution | null;
  executionHistory?: PipelineExecution[];
  selectedStageId: string | null;
  onSelectStage: (id: string) => void;
  onApproveCheckpoint: () => void;
  onRejectCheckpoint: (reason: string) => void;
  onInsertAtPosition?: (position: number) => void;
  onRemoveStep?: (stepId: string) => void;
  onReorderStep?: (fromIndex: number, toIndex: number) => void;
  onToggleDisabled?: (stepId: string) => void;
  onToggleParallel?: (stepId: string) => void;
  onDuplicateStep?: (stepId: string) => void;
}

interface StepGroup {
  type: "single" | "parallel" | "checkpoint";
  steps: WorkflowStep[];
}

function groupSteps(steps: WorkflowStep[]): StepGroup[] {
  const groups: StepGroup[] = [];
  let i = 0;

  while (i < steps.length) {
    const step = steps[i];

    if (step.metadata?.isCheckpoint) {
      groups.push({ type: "checkpoint", steps: [step] });
      i++;
      continue;
    }

    if (step.metadata?.isParallel && step.metadata?.group) {
      const groupName = step.metadata.group;
      const parallelSteps: WorkflowStep[] = [];
      while (i < steps.length && steps[i].metadata?.group === groupName) {
        parallelSteps.push(steps[i]);
        i++;
      }
      if (parallelSteps.length < 2) {
        parallelSteps.forEach((s) => groups.push({ type: "single", steps: [s] }));
      } else {
        groups.push({ type: "parallel", steps: parallelSteps });
      }
      continue;
    }

    groups.push({ type: "single", steps: [step] });
    i++;
  }

  return groups;
}

function getInsertPositionForGroup(steps: WorkflowStep[], groups: StepGroup[], groupIndex: number): number {
  let pos = 0;
  for (let g = 0; g < groupIndex && g < groups.length; g++) {
    pos += groups[g].steps.length;
  }
  return pos;
}

export function PipelineGraph({
  steps,
  execution,
  executionHistory,
  selectedStageId,
  onSelectStage,
  onApproveCheckpoint,
  onRejectCheckpoint,
  onInsertAtPosition,
  onRemoveStep,
  onReorderStep,
  onToggleDisabled,
  onToggleParallel,
  onDuplicateStep,
}: PipelineGraphProps) {
  const stepGroups = groupSteps(steps);
  const stepResults = execution?.stepResults || {};
  const qualityScores = execution?.qualityScores || {};
  const isEditable = !!onInsertAtPosition;
  const isDraggable = !!onReorderStep;

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number; y: number; stepId: string; stepIndex: number;
  } | null>(null);

  // Drag state
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, stepId: string, stepIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY, stepId, stepIndex });
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex && onReorderStep) {
      onReorderStep(dragIndex, toIndex);
    }
    setDragIndex(null);
  }, [dragIndex, onReorderStep]);

  // Find the step's original index in the flat steps array
  function getStepIndex(stepId: string): number {
    return steps.findIndex((s) => s.id === stepId);
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-center gap-1 min-w-max px-4 py-6">
        {isEditable && (
          <InsertStepButton position={0} onClick={onInsertAtPosition!} />
        )}

        {stepGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {gi > 0 && (
              <ArrowRight className="w-4 h-4 text-border flex-shrink-0 mx-1" />
            )}

            {group.type === "single" && (() => {
              const s = group.steps[0];
              const r = stepResults[s.id];
              const idx = getStepIndex(s.id);
              return (
                <StageNode
                  id={s.id}
                  agentId={s.agentId}
                  agentName={s.agentName}
                  status={r?.status || "pending"}
                  metadata={s.metadata}
                  selected={selectedStageId === s.id}
                  disabled={s.metadata?.disabled}
                  onClick={() => onSelectStage(s.id)}
                  onContextMenu={isEditable ? (e) => handleContextMenu(e, s.id, idx) : undefined}
                  qualityScore={qualityScores[s.id]?.overall}
                  retryCount={r?.retryCount}
                  escalated={r?.escalated}
                  executionHistory={executionHistory}
                  draggable={isDraggable}
                  onDragStart={isDraggable ? (e) => handleDragStart(e, idx) : undefined}
                  onDragOver={isDraggable ? handleDragOver : undefined}
                  onDrop={isDraggable ? (e) => handleDrop(e, idx) : undefined}
                />
              );
            })()}

            {group.type === "parallel" && (
              <ParallelBranch
                steps={group.steps}
                stepResults={stepResults}
                qualityScores={qualityScores}
                selectedStageId={selectedStageId}
                onSelectStage={onSelectStage}
                executionHistory={executionHistory}
                onContextMenu={isEditable ? handleContextMenu : undefined}
                allSteps={steps}
                draggable={isDraggable}
                onDragStart={isDraggable ? handleDragStart : undefined}
                onDragOver={isDraggable ? handleDragOver : undefined}
                onDrop={isDraggable ? handleDrop : undefined}
              />
            )}

            {group.type === "checkpoint" && (
              <CheckpointGate
                isPending={execution?.checkpointPending || false}
                status={stepResults[group.steps[0].id]?.status as "pending" | "awaiting_approval" | "completed" | "failed" || "pending"}
                onApprove={onApproveCheckpoint}
                onReject={onRejectCheckpoint}
                selected={selectedStageId === group.steps[0].id}
                onClick={() => onSelectStage(group.steps[0].id)}
              />
            )}

            {isEditable && (
              <InsertStepButton
                position={getInsertPositionForGroup(steps, stepGroups, gi + 1)}
                onClick={onInsertAtPosition!}
              />
            )}
          </div>
        ))}

        {steps.length === 0 && isEditable && (
          <div className="flex items-center gap-2 text-muted-foreground/50 font-mono text-xs">
            <span>Open Recruitment Center to add agents</span>
          </div>
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <StageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          stepId={contextMenu.stepId}
          isDisabled={steps[contextMenu.stepIndex]?.metadata?.disabled || false}
          isParallel={steps[contextMenu.stepIndex]?.metadata?.isParallel || false}
          onClose={() => setContextMenu(null)}
          onRemove={() => onRemoveStep?.(contextMenu.stepId)}
          onToggleDisable={() => onToggleDisabled?.(contextMenu.stepId)}
          onToggleParallel={() => onToggleParallel?.(contextMenu.stepId)}
          onDuplicate={() => onDuplicateStep?.(contextMenu.stepId)}
        />
      )}
    </div>
  );
}
