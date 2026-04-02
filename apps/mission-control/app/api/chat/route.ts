import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { getAgentPrompt } from "@/lib/agent-prompts-cache";
import { cachedAgents } from "@/lib/agent-hub-cache";
import { addLog } from "@/lib/logs-storage";
import { executeAgent } from "@/lib/agent-hub-client";
import { readFile } from "fs/promises";
import { join } from "path";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Build conversation context string for Agent Hub
function buildContextInput(messages: Array<{ role: string; content: string }>): string {
  if (messages.length <= 1) {
    return messages[messages.length - 1]?.content || "";
  }
  const current = messages[messages.length - 1].content;
  const history = messages.slice(-5, -1);
  if (history.length === 0) return current;
  const contextLines = history.map(
    (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
  );
  return `[Conversation context]\n${contextLines.join("\n")}\n\n[Current message]\n${current}`;
}

// Load prompt: check prompt-overrides.json first, then cached prompts
async function loadPrompt(agentId: string): Promise<string> {
  try {
    const overridesPath = join(process.cwd(), "data", "prompt-overrides.json");
    const raw = await readFile(overridesPath, "utf-8");
    const overrides = JSON.parse(raw);
    if (overrides[agentId]) return overrides[agentId];
  } catch { /* file not found or parse error */ }
  return getAgentPrompt(agentId);
}

// Map model names to Anthropic models
function mapToAnthropicModel(llmModel: string): string {
  if (llmModel.includes("claude")) return llmModel;
  if (llmModel.includes("sonnet")) return "claude-sonnet-4-20250514";
  if (llmModel.includes("haiku")) return "claude-haiku-4-5-20251001";
  return "claude-sonnet-4-20250514";
}

// Map model names to OpenAI models
function mapToOpenAIModel(llmModel: string): string {
  if (llmModel.includes("gpt")) return llmModel;
  return "gpt-4.1-mini";
}

export async function POST(request: NextRequest) {
  try {
    const { agentId, messages } = await request.json();

    if (!agentId || !messages?.length) {
      return Response.json(
        { error: "agentId and messages are required" },
        { status: 400 },
      );
    }

    const agent = cachedAgents.find((a) => a.id === agentId);
    const userMsg = messages[messages.length - 1]?.content || "";

    // ── Tier 1: Agent Hub executeAgent() ──
    try {
      const userInput = buildContextInput(messages);
      const result = await executeAgent({ assistantId: agentId, userInput });
      const responseText = result.content || "No response from agent.";

      const encoder = new TextEncoder();
      const body = encoder.encode(
        `data: ${JSON.stringify({ text: responseText })}\n\ndata: [DONE]\n\n`
      );

      addLog({
        type: "chat", agentId, agentName: agent?.name,
        content: `User: ${userMsg.slice(0, 200)}\nAgent: ${responseText.slice(0, 300)}`,
      }).catch(() => {});

      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Chat-Source": "agent-hub",
        },
      });
    } catch {
      // Agent Hub unavailable — fall through to Anthropic
    }

    // ── Tier 2: Anthropic Claude (primary fallback — with streaming) ──
    const systemPrompt = await loadPrompt(agentId);

    try {
      const anthropicModel = mapToAnthropicModel(agent?.llmModel || "claude-sonnet-4-20250514");

      const stream = anthropic.messages.stream({
        model: anthropicModel,
        max_tokens: 4096,
        system: systemPrompt,
        messages: messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });

      const encoder = new TextEncoder();
      let aborted = false;
      let fullResponse = "";

      const readable = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              if (aborted) break;
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                const text = event.delta.text;
                if (text) {
                  fullResponse += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                }
              }
            }
            if (!aborted) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              addLog({
                type: "chat", agentId, agentName: agent?.name,
                content: `User: ${userMsg.slice(0, 200)}\nAgent: ${fullResponse.slice(0, 300)}`,
              }).catch(() => {});
            }
          } catch {
            if (!aborted) controller.close();
          }
        },
        cancel() { aborted = true; stream.abort(); },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
          "Transfer-Encoding": "chunked",
          "X-Chat-Source": "anthropic",
        },
      });
    } catch {
      // Anthropic unavailable — fall through to OpenAI
    }

    // ── Tier 3: OpenAI (secondary fallback) ──
    const openaiModel = mapToOpenAIModel(agent?.llmModel || "gpt-4.1-mini");

    const stream = await openai.chat.completions.create({
      model: openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
      stream: true,
      max_tokens: 2000,
    });

    const encoder = new TextEncoder();
    let aborted = false;
    let fullResponse = "";
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (aborted) break;
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              fullResponse += text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }
          if (!aborted) {
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            addLog({
              type: "chat", agentId, agentName: agent?.name,
              content: `User: ${userMsg.slice(0, 200)}\nAgent: ${fullResponse.slice(0, 300)}`,
            }).catch(() => {});
          }
        } catch {
          if (!aborted) controller.close();
        }
      },
      cancel() {
        aborted = true;
        stream.controller.abort();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "Transfer-Encoding": "chunked",
        "X-Chat-Source": "openai-fallback",
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 },
    );
  }
}
