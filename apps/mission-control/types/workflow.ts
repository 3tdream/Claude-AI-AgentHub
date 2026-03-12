export interface StageMetadata {
  qualityThreshold: number;
  leadAgent: string;
  model: string;
  isCheckpoint?: boolean;
  isParallel?: boolean;
  group?: string;
  stageNumber: string;
  conditional?: string;
}

export interface QualityScore {
  completeness: number;
  specificity: number;
  actionability: number;
  overall: number;
}

export interface WorkflowStep {
  id: string;
  agentId: string;
  agentName: string;
  promptTemplate: string;
  dependsOn: string[];
  outputKey: string;
  metadata?: StageMetadata;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  createdAt: string;
}

export type StepStatus = "pending" | "running" | "completed" | "failed" | "skipped" | "awaiting_approval" | "retrying";

export interface StepResult {
  stepId: string;
  status: StepStatus;
  output?: string;
  error?: string;
  duration?: number;
  startedAt?: string;
  completedAt?: string;
  retryCount?: number;
  evaluationFeedback?: string;
  escalated?: boolean;
}

export type PipelineStatus = "pending" | "running" | "completed" | "failed" | "paused";

export type ExecutionMode = "quick" | "medium" | "full";

export interface RoutingDecisionData {
  mode: ExecutionMode;
  selectedAgents: string[];
  selectedStepIds: string[];
  skippedStepIds: string[];
  reasoning: string;
  complexity: number;
  estimatedDuration: string;
  includeCheckpoint: boolean;
  includeQualityEval: boolean;
  routedAt: string;
  routerModel: string;
}

export interface StepTokenUsage {
  provider: string;
  model: string;
  input: number;
  output: number;
  durationMs: number;
}

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
  checkpointPending?: boolean;
  checkpointRejectionReason?: string;
  qualityScores?: Record<string, QualityScore>;
  escalatedSteps?: string[];
  jiraKey?: string;
  jiraUrl?: string;
  routingDecision?: RoutingDecisionData;
  tokenUsage?: Record<string, StepTokenUsage>;
}
