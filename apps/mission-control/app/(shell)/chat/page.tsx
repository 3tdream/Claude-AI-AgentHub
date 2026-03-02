"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { useAgents } from "@/lib/hooks/use-agents";
import type { Agent } from "@/types";

const agentIcons: Record<string, string> = {
  orchestrator: "\u{1F9E0}", "pm-agent": "\u{1F4CB}", "architect-agent": "\u{1F3D7}\uFE0F",
  "backend-agent": "\u2699\uFE0F", "frontend-agent": "\u{1F5A5}\uFE0F", "designer-agent": "\u{1F3A8}",
  "qa-agent": "\u{1F50D}", "devops-agent": "\u{1F680}", "cyber-agent": "\u{1F6E1}\uFE0F",
  "research-agent": "\u{1F52C}", "michael-personal-bot": "\u{1F4AC}",
  "email & calendar manager": "\u{1F4E7}", "tech-support-agent": "\u{1F527}",
  assistant: "\u{1F916}", "herald-avatar-prompter": "\u{1F5BC}\uFE0F", "herald-profile-generator": "\u{1F4DD}",
};

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export default function ChatPage() {
  const { agents } = useAgents();
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  function selectAgent(agent: Agent) {
    setSelectedAgent(agent);
    setMessages([]);
    setInput("");
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function clearChat() {
    setMessages([]);
  }

  async function handleSend() {
    if (!input.trim() || !selectedAgent || isStreaming) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsStreaming(true);

    // Create placeholder assistant message for streaming
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
    ]);

    try {
      // Timeout after 30 seconds
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentId: selectedAgent.id,
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Chat failed");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      let fullText = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last potentially incomplete line in buffer
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("data: ")) {
            const data = trimmed.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: fullText } : m,
                  ),
                );
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      }
    } catch (error) {
      const msg =
        error instanceof DOMException && error.name === "AbortError"
          ? "Request timed out (30s). Try again."
          : error instanceof Error
            ? error.message
            : "Failed to get response";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: `Error: ${msg}` }
            : m,
        ),
      );
    } finally {
      setIsStreaming(false);
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-8rem)]">
      {/* Left panel — agent selector */}
      <div className="w-72 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="font-bold text-base">Agents</h2>
          <p className="font-mono text-sm text-muted-foreground mt-0.5">Select to start chat</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {agents.map((agent: Agent) => (
            <button
              key={agent.id}
              onClick={() => selectAgent(agent)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all ${
                selectedAgent?.id === agent.id
                  ? "bg-primary/10 border border-primary/20"
                  : "hover:bg-muted"
              }`}
            >
              <span className="text-lg flex-shrink-0">
                {agentIcons[agent.name.toLowerCase()] || "\u{1F916}"}
              </span>
              <div className="overflow-hidden">
                <div className="text-base font-medium truncate">{agent.name}</div>
                <div className="font-mono text-sm text-muted-foreground truncate">
                  {agent.llmModel}
                </div>
              </div>
            </button>
          ))}
          {agents.length === 0 && (
            <p className="font-mono text-xs text-muted-foreground text-center py-8">
              No agents loaded
            </p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-card border border-border rounded-xl flex flex-col overflow-hidden">
        {/* Chat header */}
        {selectedAgent && (
          <div className="flex items-center justify-between px-6 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <span className="text-xl">
                {agentIcons[selectedAgent.name.toLowerCase()] || "\u{1F916}"}
              </span>
              <div>
                <div className="font-bold text-base">{selectedAgent.name}</div>
                <div className="font-mono text-sm text-muted-foreground">
                  {selectedAgent.llmModel} &middot; via OpenAI
                </div>
              </div>
            </div>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!selectedAgent && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <MessageSquare className="w-16 h-16 mb-4 opacity-15" />
              <p className="text-xl font-semibold mb-1">Mission Control Chat</p>
              <p className="font-mono text-base">Select an agent to start conversation</p>
            </div>
          )}
          {selectedAgent && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <span className="text-5xl mb-4">
                {agentIcons[selectedAgent.name.toLowerCase()] || "\u{1F916}"}
              </span>
              <p className="text-xl font-semibold mb-1">{selectedAgent.name}</p>
              <p className="font-mono text-sm text-center max-w-md">
                {selectedAgent.description || "Ready to chat"}
              </p>
            </div>
          )}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                <p className="text-base whitespace-pre-wrap leading-relaxed">
                  {msg.content || (
                    <span className="inline-flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-muted-foreground">Thinking...</span>
                    </span>
                  )}
                </p>
                <span className="font-mono text-xs opacity-40 mt-1.5 block">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                selectedAgent
                  ? `Message ${selectedAgent.name}...`
                  : "Select an agent first..."
              }
              disabled={!selectedAgent || isStreaming}
              className="flex-1 bg-background border border-border rounded-xl px-5 py-3 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:opacity-50 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || !selectedAgent || isStreaming}
              className="px-5 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 transition-all flex items-center gap-2"
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
