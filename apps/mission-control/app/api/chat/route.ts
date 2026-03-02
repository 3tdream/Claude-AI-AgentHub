import { NextRequest } from "next/server";
import OpenAI from "openai";
import { getAgentPrompt } from "@/lib/agent-prompts-cache";
import { cachedAgents } from "@/lib/agent-hub-cache";
import { addLog } from "@/lib/logs-storage";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Map Agent Hub models to OpenAI-compatible models
function mapModel(llmModel: string): string {
  if (llmModel.includes("gpt")) return llmModel;
  // For non-OpenAI models, use gpt-4.1-mini as fallback
  return "gpt-4.1-mini";
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
    const systemPrompt = getAgentPrompt(agentId);
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

    // Return SSE stream with proper cleanup on client disconnect
    const encoder = new TextEncoder();
    let aborted = false;
    let fullResponse = "";
    const userMsg = messages[messages.length - 1]?.content || "";
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
            // Fire-and-forget: log chat to activity log
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

    console.log("[Chat API] Starting SSE stream");
    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "Transfer-Encoding": "chunked",
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
