"use client";

import type { WorkflowStep, PipelineExecution, QualityScore } from "@/types";
import { StageNode } from "./stage-node";
import { ParallelBranch } from "./parallel-branch";
import { CheckpointGate } from "./checkpoint-gate";
import { ArrowRight } from "lucide-react";

interface PipelineGraphProps {
  steps: WorkflowStep[];
  execution: PipelineExecution | null;
  selectedStageId: string | null;
  onSelectStage: (id: string) => void;
  onApproveCheckpoint: () => void;
  onRejectCheckpoint: (reason: string) => void;
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

    // Checkpoint
    if (step.metadata?.isCheckpoint) {
      groups.push({ type: "checkpoint", steps: [step] });
      i++;
      continue;
    }

    // Parallel group — collect consecutive steps with same group
    if (step.metadata?.isParallel && step.metadata?.group) {
      const groupName = step.metadata.group;
      const parallelSteps: WorkflowStep[] = [];
      while (i < steps.length && steps[i].metadata?.group === groupName) {
        parallelSteps.push(steps[i]);
        i++;
      }
      groups.push({ type: "parallel", steps: parallelSteps });
      continue;
    }

    // Single step
    groups.push({ type: "single", steps: [step] });
    i++;
  }

  return groups;
}

export function PipelineGraph({
  steps,
  execution,
  selectedStageId,
  onSelectStage,
  onApproveCheckpoint,
  onRejectCheckpoint,
}: PipelineGraphProps) {
  const stepGroups = groupSteps(steps);
  const stepResults = execution?.stepResults || {};
  const qualityScores = execution?.qualityScores || {};

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-center gap-1 min-w-max px-4 py-6">
        {stepGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1">
            {/* Connector arrow (not before first) */}
            {gi > 0 && (
              <ArrowRight className="w-4 h-4 text-border flex-shrink-0 mx-1" />
            )}

            {group.type === "single" && (() => {
              const s = group.steps[0];
              const r = stepResults[s.id];
              return (
                <StageNode
                  id={s.id}
                  agentId={s.agentId}
                  agentName={s.agentName}
                  status={r?.status || "pending"}
                  metadata={s.metadata}
                  selected={selectedStageId === s.id}
                  onClick={() => onSelectStage(s.id)}
                  qualityScore={qualityScores[s.id]?.overall}
                  retryCount={r?.retryCount}
                  escalated={r?.escalated}
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
          </div>
        ))}
      </div>
    </div>
  );
}
