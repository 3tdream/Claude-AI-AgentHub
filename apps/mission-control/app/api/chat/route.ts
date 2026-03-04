import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getAgentPrompt } from "@/lib/agent-prompts-cache";
import { cachedAgents } from "@/lib/agent-hub-cache";
import { addLog } from "@/lib/logs-storage";
import { executeAgent } from "@/lib/agent-hub-client";
import { readFile } from "fs/promises";
import { join } from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Map Agent Hub models to OpenAI-compatible models
function mapModel(llmModel: string): string {
  if (llmModel.includes("gpt")) return llmModel;
  return "gpt-4.1-mini";
}

// Build conversation context string for Agent Hub (last 4 messages + current)
function buildContextInput(messages: Array<{ role: string; content: string }>): string {
  if (messages.length <= 1) {
    return messages[messages.length - 1]?.content || "";
  }

  const current = messages[messages.length - 1].content;
  const history = messages.slice(-5, -1); // last 4 messages before current

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
  } catch {
    // file not found or parse error — fall through
  }
  return getAgentPrompt(agentId);
}

export async function POST(request: NextRequest) {
  console.log("[Chat API] POST received");
  try {
    const { agentId, messages } = await request.json();
    console.log("[Chat API] agentId:", agentId, "messages:", messages.length);

    if (!agentId || !messages?.length) {
      return Response.json(
        { error: "agentId and messages are required" },
        { status: 400 },
      );
    }

    const agent = cachedAgents.find((a) => a.id === agentId);
    const userMsg = messages[messages.length - 1]?.content || "";

    // ── Primary path: Agent Hub executeAgent() ──
    try {
      console.log("[Chat API] Trying Agent Hub for agent:", agentId);
      const userInput = buildContextInput(messages);

      const result = await executeAgent({
        assistantId: agentId,
        userInput,
      });

      const responseText = result.content || "No response from agent.";
      console.log("[Chat API] Agent Hub success, response length:", responseText.length);

      // Wrap as SSE: single chunk + DONE
      const encoder = new TextEncoder();
      const body = encoder.encode(
        `data: ${JSON.stringify({ text: responseText })}\n\ndata: [DONE]\n\n`
      );

      // Fire-and-forget log
      addLog({
        type: "chat",
        agentId,
        agentName: agent?.name,
        content: `User: ${userMsg.slice(0, 200)}${userMsg.length > 200 ? "..." : ""}\nAgent: ${responseText.slice(0, 300)}${responseText.length > 300 ? "..." : ""}`,
      }).catch(() => {});

      return new Response(body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Chat-Source": "agent-hub",
        },
      });
    } catch (hubError) {
      console.warn("[Chat API] Agent Hub failed, falling back to OpenAI:", hubError instanceof Error ? hubError.message : hubError);
    }

    // ── Fallback path: Direct OpenAI streaming ──
    console.log("[Chat API] Using OpenAI fallback");
    const systemPrompt = await loadPrompt(agentId);
    const model = mapModel(agent?.llmModel || "gpt-4.1-mini");

    const stream = await openai.chat.completions.create({
      model,
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
              type: "chat",
              agentId,
              agentName: agent?.name,
              content: `User: ${userMsg.slice(0, 200)}${userMsg.length > 200 ? "..." : ""}\nAgent: ${fullResponse.slice(0, 300)}${fullResponse.length > 300 ? "..." : ""}`,
            }).catch(() => {});
          }
        } catch (err) {
          if (!aborted) {
            console.error("[Chat API] Stream error:", err);
            controller.close();
          }
        }
      },
      cancel() {
        aborted = true;
        stream.controller.abort();
      },
    });

    console.log("[Chat API] Starting OpenAI SSE stream");
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
    console.error("[Chat API] Error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Chat failed" },
      { status: 500 },
    );
  }
}
