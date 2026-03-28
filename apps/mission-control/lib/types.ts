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
