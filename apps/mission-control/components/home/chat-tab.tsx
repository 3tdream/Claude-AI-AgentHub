"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAgentPrompt } from "@/lib/hooks/use-agents";
import { useAppStore } from "@/lib/stores/app-store";
import type { Agent } from "@/types";
import { Send, FolderOpen } from "lucide-react";
import { getAgentLucideIcon } from "./constants";

// ── Build agent chat system prompt ──
export function buildAgentChatPrompt(agent: Agent, prompt: string | null, activeProjectId: string | null): string {
  return `You are acting as: ${agent.name}

Role: ${prompt || "General-purpose AI assistant."}

Rules:
- Stay in character as this agent
- Use your specialized knowledge
- If asked to edit files, use edit_file/create_file tools
- Reference KB patterns when relevant

Project Context:
- Active project: ${activeProjectId || "mission-control"}
- Provider: ${agent.llmProvider}
- Model: ${agent.llmModel}`;
}

interface ChatMessage {
  role: "user" | "agent";
  content: string;
}

export function ChatTab({ agent }: { agent: Agent }) {
  const { prompt } = useAgentPrompt(agent.id);
  const { activeProjectId } = useAppStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const AgentIcon = getAgentLucideIcon(agent.name);

  // Reset messages when agent changes
  useEffect(() => {
    setMessages([]);
    setInput("");
  }, [agent.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async () => {
    const userMessage = input.trim();
    if (!userMessage || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const systemPrompt = buildAgentChatPrompt(agent, prompt ?? null, activeProjectId);
      const res = await fetch("/api/ai/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: agent.id,
          model: agent.llmModel || "claude-sonnet-4-6",
          userInput: userMessage,
          systemPromptOverride: systemPrompt,
          useTools: true,
          toolMode: "readwrite",
        }),
      });
      const data = await res.json();
      const agentReply = data.result || data.response || data.error || "No response";
      setMessages((prev) => [...prev, { role: "agent", content: agentReply }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "agent", content: "Error: Failed to reach agent." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, loading, agent, prompt, activeProjectId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Project context indicator */}
      {activeProjectId && (
        <div className="px-4 py-1.5 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50/50">
          <FolderOpen className="w-3 h-3 text-indigo-400" />
          <span className="font-mono text-[10px] text-slate-500">Context:</span>
          <span className="font-mono text-[10px] text-indigo-600 font-medium">{activeProjectId}</span>
        </div>
      )}
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: "calc(100vh - 280px)" }}>
        {messages.length === 0 && !loading && (
          <div className="text-center py-10">
            <AgentIcon className="w-8 h-8 text-muted-foreground block mb-2 mx-auto" />
            <div className="text-sm text-slate-400">Start a conversation with {agent.name}</div>
          </div>
        )}
        {messages.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="bg-indigo-50 text-slate-800 rounded-lg rounded-br-sm px-3 py-2 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex justify-start gap-2">
              <AgentIcon className="w-4 h-4 shrink-0 mt-1 text-muted-foreground" />
              <div className="bg-slate-50 text-slate-800 rounded-lg rounded-bl-sm px-3 py-2 max-w-[80%] text-sm leading-relaxed whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="flex justify-start gap-2">
            <AgentIcon className="w-4 h-4 shrink-0 mt-1 text-muted-foreground" />
            <div className="bg-slate-50 text-slate-800 rounded-lg rounded-bl-sm px-3 py-2 max-w-[80%]">
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
            placeholder={`Message ${agent.name}...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
