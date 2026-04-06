// Shared types for 3D Pipeline Preview

export type AgentStatus =
  | "idle"
  | "running"
  | "completed"
  | "failed"
  | "pending"
  | "paused"
  | "escalated"
  | "skipped";

export type AgentRole =
  | "orchestrator"
  | "pm"
  | "architect"
  | "frontend"
  | "backend"
  | "designer"
  | "qa"
  | "devops"
  | "cyber"
  | "research";

export interface PipelineAgent {
  id: string;
  name: string;
  role: AgentRole;
  status: AgentStatus;
  progress?: number; // 0-100
  model?: string;
  department?: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  retryCount?: number;
  error?: string;
}

export interface PipelineConnection {
  fromId: string;
  toId: string;
  active: boolean;
  dataFlow?: number; // 0-1 animation progress
}

export interface Pipeline3DData {
  id: string;
  name: string;
  status: "idle" | "running" | "completed" | "failed" | "paused";
  agents: PipelineAgent[];
  connections: PipelineConnection[];
  startedAt?: string;
  completedAt?: string;
  progress: number;
}

export interface PipelineListItem {
  id: string;
  name: string;
  status: Pipeline3DData["status"];
  progress: number;
  agentCount: number;
  startedAt?: string;
}

// ── Extended types for 3D preview API wiring ─────────────────────────────────

export type AgentType =
  | "orchestrator"
  | "researcher"
  | "writer"
  | "reviewer"
  | "executor"
  | "validator"
  | "aggregator"
  | "notifier";

export interface AgentNode {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  progress?: number;
  position: { x: number; y: number; z: number };
  metadata?: Record<string, unknown>;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface AgentConnection {
  id: string;
  sourceId: string;
  targetId: string;
  active: boolean;
  dataFlow?: number;
}

export interface PipelineExecution {
  id: string;
  pipelineId: string;
  pipelineName: string;
  status: AgentStatus;
  agents: AgentNode[];
  connections: AgentConnection[];
  startedAt: string;
  completedAt?: string;
  totalAgents: number;
  completedAgents: number;
  failedAgents: number;
  runningAgents: number;
  throughput?: number;
  latencyMs?: number;
}

export interface ExecutionStats {
  totalRuns: number;
  successRate: number;
  avgLatencyMs: number;
  activeExecutions: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}
