"use client";

import type { WorkflowStep, StepResult, QualityScore, PipelineExecution } from "@/types";
import { StageNode } from "./stage-node";

interface ParallelBranchProps {
  steps: WorkflowStep[];
  stepResults: Record<string, StepResult>;
  qualityScores?: Record<string, QualityScore>;
  selectedStageId: string | null;
  onSelectStage: (id: string) => void;
  executionHistory?: PipelineExecution[];
  onContextMenu?: (e: React.MouseEvent, stepId: string, stepIndex: number) => void;
  allSteps?: WorkflowStep[];
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, index: number) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, toIndex: number) => void;
}

export function ParallelBranch({
  steps,
  stepResults,
  qualityScores,
  selectedStageId,
  onSelectStage,
  executionHistory,
  onContextMenu,
  allSteps,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
}: ParallelBranchProps) {
  function getStepIndex(stepId: string): number {
    return allSteps ? allSteps.findIndex((s) => s.id === stepId) : -1;
  }

  return (
    <div className="flex items-center gap-0">
      {/* Fork line */}
      <div className="relative w-5 flex-shrink-0">
        <svg width="20" height={steps.length * 64} viewBox={`0 0 20 ${steps.length * 64}`} className="overflow-visible">
          {steps.map((_, i) => {
            const y = i * 64 + 32;
            const midY = (steps.length * 64) / 2;
            return (
              <path
                key={i}
                d={`M 0 ${midY} C 10 ${midY}, 10 ${y}, 20 ${y}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>

      {/* Parallel nodes */}
      <div className="flex flex-col gap-2 py-2">
        {steps.map((step) => {
          const result = stepResults[step.id];
          const score = qualityScores?.[step.id];
          const idx = getStepIndex(step.id);
          return (
            <StageNode
              key={step.id}
              id={step.id}
              agentId={step.agentId}
              agentName={step.agentName}
              status={result?.status || "pending"}
              metadata={step.metadata}
              disabled={step.metadata?.disabled}
              selected={selectedStageId === step.id}
              onClick={() => onSelectStage(step.id)}
              onContextMenu={onContextMenu ? (e) => onContextMenu(e, step.id, idx) : undefined}
              qualityScore={score?.overall}
              retryCount={result?.retryCount}
              escalated={result?.escalated}
              executionHistory={executionHistory}
              draggable={draggable}
              onDragStart={draggable && onDragStart ? (e) => onDragStart(e, idx) : undefined}
              onDragOver={draggable && onDragOver ? onDragOver : undefined}
              onDrop={draggable && onDrop ? (e) => onDrop(e, idx) : undefined}
            />
          );
        })}
      </div>

      {/* Join line */}
      <div className="relative w-5 flex-shrink-0">
        <svg width="20" height={steps.length * 64} viewBox={`0 0 20 ${steps.length * 64}`} className="overflow-visible">
          {steps.map((_, i) => {
            const y = i * 64 + 32;
            const midY = (steps.length * 64) / 2;
            return (
              <path
                key={i}
                d={`M 0 ${y} C 10 ${y}, 10 ${midY}, 20 ${midY}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="1.5"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
