export type LLMProvider = "anthropic" | "openai" | "google" | "openrouter";

export interface Agent {
  id: string;
  name: string;
  description?: string;
  llmProvider: LLMProvider;
  llmModel: string;
  maxTokens: number;
  maxOutputTokens?: number;
  maxToolSteps: number;
  teams: string[]; // array of team IDs
  lastAccessedAt?: string;
  assistantId?: string; // present on herald sub-agents
}

export interface AgentKPI {
  agentId: string;
  agentName: string;
  icon: string;
  group: string;
  llmProvider: LLMProvider;
  llmModel: string;
  cost: number;
  requests: number;
  tokens: number;
  lastAccessed: string | null;
}

export interface CreateAgentParams {
  name: string;
  llmProvider: LLMProvider;
  llmModel: string;
  description?: string;
  llmPrompt?: string;
  maxTokens?: number;
  maxOutputTokens?: number;
  maxToolSteps?: number;
  teamIds?: string[];
}

export interface UpdateAgentParams {
  name?: string;
  description?: string;
  prompt?: string;
  llmProvider?: LLMProvider;
  llmModel?: string;
  maxTokens?: number;
  maxOutputTokens?: number;
  maxToolSteps?: number;
}

export interface PromptVersion {
  version: number;
  changeType: string;
  description: string;
  preview: string;
  createdAt: string;
}

export interface ExecuteParams {
  assistantId: string;
  userInput: string;
  includeToolCalls?: boolean;
  systemPromptOverride?: string;
  sessionId?: string;
  attachments?: Attachment[];
  responseFormat?: { type: "json_object" };
}

export interface Attachment {
  type: "url" | "base64";
  mimeType: string;
  url?: string;
  data?: string;
  fileName?: string;
}

export interface ExecuteResult {
  success: boolean;
  content?: string;
  error?: string;
  toolCalls?: unknown[];
}
