export interface WorkflowStep {
  id: string;
  agentId: string;
  agentName: string;
  promptTemplate: string;
  dependsOn: string[];
  outputKey: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
}

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface StepResult {
  stepId: string;
  status: StepStatus;
  output?: string;
  error?: string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
}

export type PipelineStatus = "pending" | "running" | "completed" | "failed";

export interface PipelineExecution {
  id: string;
  workflowId: string;
  workflowName: string;
  status: PipelineStatus;
  input: string;
  stepResults: Record<string, StepResult>;
  startedAt: string;
  completedAt?: string;
  totalDuration?: number;
}
