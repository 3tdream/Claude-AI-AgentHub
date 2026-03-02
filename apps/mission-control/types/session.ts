export type MessageSender = "user" | "assistant" | "system";

export type SessionChannel = "web" | "telegram" | "whatsapp" | "email" | "api";

export interface Session {
  id: string;
  agentId: string;
  agentName?: string;
  channel: SessionChannel;
  status: "active" | "inactive";
  messageCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  sessionId: string;
  sender: MessageSender;
  content: string;
  createdAt: string;
}

export interface CreateSessionParams {
  agentId: string;
  channel?: SessionChannel;
  metadata?: Record<string, unknown>;
}

export interface SendMessageParams {
  sessionId: string;
  message: string;
  waitForResponse?: boolean;
  timeout?: number;
  attachments?: Array<{ type: "url" | "base64"; mimeType: string; url?: string; data?: string }>;
}
