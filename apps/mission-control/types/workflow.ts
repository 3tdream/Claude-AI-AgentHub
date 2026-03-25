export interface StageMetadata {
  qualityThreshold: number;
  leadAgent: string;
  model: string;
  isCheckpoint?: boolean;
  isParallel?: boolean;
  group?: string;
  stageNumber: string;
  conditional?: string;
  disabled?: boolean;
}

export interface QualityScore {
  completeness: number;
  specificity: number;
  actionability: number;
  taskCompletion?: number;
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
  isTemplate?: boolean;
}

// === Workflow V2: Slot System ===

export type SlotStatus = "empty" | "idle" | "running" | "paused" | "failed";

export interface QARetryCycle {
  count: number;
  status: "fixing" | "re-evaluating" | "resolved" | "escalated";
  failedCriteriaIds: string[];
}

export interface CyberRedesignCycle {
  count: number;
  status: "redesigning" | "re-evaluating" | "resolved" | "escalated";
  criticalFindings: string[];
}

export interface WorkflowSlot {
  id: 0 | 1 | 2 | 3;
  workflowId: string | null;
  workflowName: string | null;
  status: SlotStatus;
  projectContext: string | null;
  lastInput: string;
  executionId: string | null;
  progress: number; // 0-100
  retryCycles?: Record<string, QARetryCycle>; // stepId → retry state
}

export type AgentDepartment = "Strategy" | "Engineering" | "Security" | "Support" | "Herald";

export interface AgentCatalogEntry {
  agentId: string;
  agentName: string;
  department: AgentDepartment;
  description: string;
  model: string;
  provider: string;
  qualityThreshold: number;
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
  // Analytics
  inputTokens?: number;
  outputTokens?: number;
  outputChars?: number;
  provider?: string;
  model?: string;
  // Tool-Belt logs
  toolCalls?: Array<{
    name: string;
    input: Record<string, string>;
    output: string;
    success: boolean;
    durationMs: number;
  }>;
  toolCallCount?: number;
  // Source tracking for resume/cache
  source?: "live" | "cached" | "resumed";
  cachedFromRun?: string; // pipeline run ID if cached
}

export type PipelineStatus = "pending" | "running" | "completed" | "failed" | "paused" | "stopped" | "escalated";

export type StepSourceType = "live" | "cached" | "resumed";

export type ExecutionMode = "quick" | "medium" | "full";

// === ADR-007: Smart Router Escalation — Stop-and-Propose Pattern ===

export type EscalationTriggerId = "T1" | "T2" | "T3" | "T4" | "T5";
export type EscalationAgentId = "cyber-agent" | "qa-agent" | "architect-agent";
export type EscalationSourceMode = "quick" | "medium";
export type EscalationTargetMode = "medium" | "full";

/** T1: Cyber Critical (any probability) — immediate stop
 *  T2: Cyber High severity + High probability — immediate stop
 *  T3: QA Critical bug found — stop after current step
 *  T4: QA score < 5 after 2 retries — stop after current step
 *  T5: Architect [ESCALATE] tag: files≥4 OR stores≥2 — stop after current step */
export interface EscalationTriggerData {
  triggerId: EscalationTriggerId;
  agentId: EscalationAgentId;
  stepId: string;                          // e.g. "s3-architect", "s3.5-cyber"
  severity?: "critical" | "high" | "medium" | "low"; // T1, T2
  qualityScore?: number;                   // T4
  retryCount?: number;                     // T4
  filesAffected?: number;                  // T5
  storesAffected?: string[];               // T5
  reason: string;                          // human-readable, max 100 chars
  stopsImmediately: boolean;               // true for T1/T2, false for T3/T4/T5
}

export interface EscalationRecord {
  escalatedFrom: EscalationSourceMode;
  escalatedTo: EscalationTargetMode;
  triggeredBy: EscalationTriggerData;
  triggeredAt: string;                     // ISO timestamp
  reusedSteps: string[];                   // step IDs from previous run
  proposedAt: string;                      // ISO timestamp — when banner shown
  confirmedAt?: string;                    // ISO timestamp — user clicked "Run Full"
  confirmedBy?: string;                    // user identifier (MEDIUM PII — encrypt at rest)
  rejectedAt?: string;                     // ISO timestamp — user dismissed
}

// Keep for backward compat — alias old enum values to new trigger IDs
export enum EscalationTrigger {
  CROSS_CUTTING = "cross_cutting",
  SECURITY      = "security",
  QA_FAIL       = "qa_fail",
}

/** @deprecated Use EscalationTriggerData instead */
export interface EscalationSignal {
  escalate: boolean;
  reason: string;
  core_files_touched: string[];
  trigger_type: EscalationTrigger;
  severity?: "critical" | "high";
}

/** @deprecated Use EscalationRecord instead */
export interface EscalationEvent {
  triggeredAt: string;
  trigger: EscalationTrigger;
  reason: string;
  agentId: string;
  stepId: string;
  severity?: "critical" | "high";
  stepsInserted: string[];
  userConfirmed?: boolean;
}

export interface SimulationAdjustmentData {
  type: "mode_upgrade" | "stage_warning" | "stage_split" | "guard_added";
  stageId?: string;
  description: string;
  reason: string;
}

export interface RoutingSimulationData {
  overallProbability: number;
  overallRisk: string;
  bottlenecks: { stageId: string; probability: number; reason: string }[];
  adjustments: SimulationAdjustmentData[];
  estimates: { totalTokens: number; totalDuration: string; estimatedCost: string };
  inputComplexity: string;
}

export interface RoutingReplanData {
  needed: boolean;
  initialScore?: number;
  finalScore?: number;
  totalLift?: number;
  liftRate?: number;
  iterations?: number;
  stopReason?: string;
  durationMs?: number;
  actions?: { type: string; stageId: string; description: string }[];
}

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
  /** Preflight simulation results (when available) */
  simulation?: RoutingSimulationData;
  /** S0.2 Strategy Architect replan results (when triggered) */
  replan?: RoutingReplanData;
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
