"use client";

import type { WorkflowStep, StepResult, QualityScore } from "@/types";
import { StageNode } from "./stage-node";

interface ParallelBranchProps {
  steps: WorkflowStep[];
  stepResults: Record<string, StepResult>;
  qualityScores?: Record<string, QualityScore>;
  selectedStageId: string | null;
  onSelectStage: (id: string) => void;
}

export function ParallelBranch({
  steps,
  stepResults,
  qualityScores,
  selectedStageId,
  onSelectStage,
}: ParallelBranchProps) {
  return (
    <div className="flex items-center gap-0">
      {/* Fork line */}
      <div className="relative w-6 flex-shrink-0">
        <svg width="24" height={steps.length * 80} viewBox={`0 0 24 ${steps.length * 80}`} className="overflow-visible">
          {steps.map((_, i) => {
            const y = i * 80 + 40;
            const midY = (steps.length * 80) / 2;
            return (
              <path
                key={i}
                d={`M 0 ${midY} C 12 ${midY}, 12 ${y}, 24 ${y}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
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
          return (
            <StageNode
              key={step.id}
              id={step.id}
              agentId={step.agentId}
              agentName={step.agentName}
              status={result?.status || "pending"}
              metadata={step.metadata}
              selected={selectedStageId === step.id}
              onClick={() => onSelectStage(step.id)}
              qualityScore={score?.overall}
              retryCount={result?.retryCount}
              escalated={result?.escalated}
            />
          );
        })}
      </div>

      {/* Join line */}
      <div className="relative w-6 flex-shrink-0">
        <svg width="24" height={steps.length * 80} viewBox={`0 0 24 ${steps.length * 80}`} className="overflow-visible">
          {steps.map((_, i) => {
            const y = i * 80 + 40;
            const midY = (steps.length * 80) / 2;
            return (
              <path
                key={i}
                d={`M 0 ${y} C 12 ${y}, 12 ${midY}, 24 ${midY}`}
                fill="none"
                stroke="hsl(var(--border))"
                strokeWidth="2"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}
