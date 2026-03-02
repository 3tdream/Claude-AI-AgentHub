"use client";

import { create } from "zustand";
import type { Message } from "@/types";

interface ChatState {
  activeSessionId: string | null;
  selectedAgentId: string | null;
  messages: Record<string, Message[]>;
  isTyping: boolean;
  setActiveSession: (sessionId: string | null) => void;
  setSelectedAgent: (agentId: string | null) => void;
  addMessage: (sessionId: string, message: Message) => void;
  setMessages: (sessionId: string, messages: Message[]) => void;
  setIsTyping: (typing: boolean) => void;
  clearMessages: (sessionId: string) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  activeSessionId: null,
  selectedAgentId: null,
  messages: {},
  isTyping: false,
  setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
  setSelectedAgent: (agentId) => set({ selectedAgentId: agentId }),
  addMessage: (sessionId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [sessionId]: [...(s.messages[sessionId] || []), message],
      },
    })),
  setMessages: (sessionId, messages) =>
    set((s) => ({
      messages: { ...s.messages, [sessionId]: messages },
    })),
  setIsTyping: (typing) => set({ isTyping: typing }),
  clearMessages: (sessionId) =>
    set((s) => ({
      messages: { ...s.messages, [sessionId]: [] },
    })),
}));
