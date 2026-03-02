export type LogEntryType = "chat" | "decision" | "manual" | "system";

export interface LogEntry {
  id: string;
  type: LogEntryType;
  agentId?: string;
  agentName?: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface CreateLogParams {
  type: LogEntryType;
  agentId?: string;
  agentName?: string;
  content: string;
  metadata?: Record<string, unknown>;
}
