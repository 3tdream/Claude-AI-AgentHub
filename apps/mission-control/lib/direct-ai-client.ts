/**
 * Direct AI Client — calls Claude/OpenAI/Gemini APIs directly
 * Replaces the SB proxy (agent-hub-client.ts) for pipeline execution
 * Server-side only (uses API keys from env)
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { readFileSync } from "fs";
import { join } from "path";

// --- Provider clients (lazy init) ---

let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

/** Read saved keys from data/api-keys.json (fallback when env vars not set) */
function getSavedKey(key: string): string {
  try {
    const raw = readFileSync(join(process.cwd(), "data", "api-keys.json"), "utf-8");
    const keys = JSON.parse(raw);
    return keys[key] || "";
  } catch {
    return "";
  }
}

function resolveKey(envKey: string): string {
  const envVal = process.env[envKey];
  if (envVal && !envVal.startsWith("your-")) return envVal;
  return getSavedKey(envKey);
}

function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    const apiKey = resolveKey("ANTHROPIC_API_KEY");
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY not configured. Go to /integrations to set it up.");
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    const apiKey = resolveKey("OPENAI_API_KEY");
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured. Go to /integrations to set it up.");
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// --- Model → Provider mapping ---

export type AIProvider = "anthropic" | "openai";

function resolveProvider(model: string): AIProvider {
  if (model.includes("gpt") || model.includes("o1") || model.includes("o3")) return "openai";
  // Default to anthropic (Claude) for sonnet, opus, haiku, and unknown models
  return "anthropic";
}

function resolveModelId(model: string): string {
  // Map shorthand to full model IDs
  const map: Record<string, string> = {
    "sonnet-4-6": "claude-sonnet-4-6",
    "opus-4-6": "claude-opus-4-6",
    "haiku-4-5": "claude-haiku-4-5-20251001",
    "sonnet": "claude-sonnet-4-6",
    "opus": "claude-opus-4-6",
    "haiku": "claude-haiku-4-5-20251001",
  };
  return map[model] || model;
}

// --- Main execution function ---

export interface DirectAIRequest {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  responseFormat?: "json" | "text";
}

export interface ToolCallLog {
  name: string;
  input: Record<string, string>;
  output: string;
  success: boolean;
  durationMs: number;
}

export interface DirectAIResponse {
  success: boolean;
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed: { input: number; output: number };
  durationMs: number;
  toolCalls?: ToolCallLog[];
}

export async function callAI(req: DirectAIRequest): Promise<DirectAIResponse> {
  const provider = resolveProvider(req.model);
  const modelId = resolveModelId(req.model);
  const start = Date.now();

  if (provider === "anthropic") {
    return callAnthropic(modelId, req, start);
  } else {
    return callOpenAI(modelId, req, start);
  }
}

async function callAnthropic(
  modelId: string,
  req: DirectAIRequest,
  start: number,
): Promise<DirectAIResponse> {
  const client = getAnthropic();

  const response = await client.messages.create({
    model: modelId,
    max_tokens: req.maxTokens || 16384,
    temperature: req.temperature ?? 0.7,
    system: req.systemPrompt,
    messages: [{ role: "user", content: req.userPrompt }],
  });

  const content = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");

  return {
    success: true,
    content,
    provider: "anthropic",
    model: modelId,
    tokensUsed: {
      input: response.usage.input_tokens,
      output: response.usage.output_tokens,
    },
    durationMs: Date.now() - start,
  };
}

// --- Tool-use execution (multi-turn) ---

export interface ToolCallAIRequest extends DirectAIRequest {
  tools: any[];
  onToolCall?: (name: string, input: Record<string, string>) => Promise<{ success: boolean; output: string; error?: string }>;
  maxToolSteps?: number;
}

export async function callAIWithTools(req: ToolCallAIRequest): Promise<DirectAIResponse> {
  const client = getAnthropic();
  const modelId = resolveModelId(req.model);
  const start = Date.now();
  const maxSteps = req.maxToolSteps || 15;

  const messages: Anthropic.Messages.MessageParam[] = [
    { role: "user", content: req.userPrompt },
  ];

  let totalInput = 0;
  let totalOutput = 0;
  let finalContent = "";
  const toolCallLogs: ToolCallLog[] = [];

  // System prompt with cache_control for multi-turn efficiency
  const systemWithCache = [
    {
      type: "text" as const,
      text: req.systemPrompt,
      cache_control: { type: "ephemeral" as const },
    },
  ];

  for (let step = 0; step < maxSteps; step++) {
    // Use streaming to avoid 10-minute timeout on long requests
    const stream = client.messages.stream({
      model: modelId,
      max_tokens: req.maxTokens || 32768,
      temperature: req.temperature ?? 0.3,
      system: systemWithCache,
      messages,
      tools: req.tools as Anthropic.Messages.Tool[],
    });

    const response = await stream.finalMessage();

    totalInput += response.usage.input_tokens;
    totalOutput += response.usage.output_tokens;

    // Extract text content
    const textBlocks = response.content.filter((b): b is Anthropic.Messages.TextBlock => b.type === "text");
    if (textBlocks.length > 0) {
      finalContent = textBlocks.map((b) => b.text).join("\n");
    }

    // Check for tool use
    const toolUseBlocks = response.content.filter((b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use");

    if (toolUseBlocks.length === 0 || response.stop_reason === "end_turn") {
      break;
    }

    // Execute tools and build response
    messages.push({ role: "assistant", content: response.content });

    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const toolUse of toolUseBlocks) {
      if (req.onToolCall) {
        const toolStart = Date.now();
        const result = await req.onToolCall(toolUse.name, toolUse.input as Record<string, string>);
        toolCallLogs.push({
          name: toolUse.name,
          input: toolUse.input as Record<string, string>,
          output: result.output.substring(0, 500),
          success: result.success,
          durationMs: Date.now() - toolStart,
        });
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result.success ? result.output : `ERROR: ${result.error}\n${result.output}`,
          is_error: !result.success,
        });
      } else {
        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: "Tool execution not available",
          is_error: true,
        });
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  return {
    success: true,
    content: finalContent,
    provider: "anthropic",
    model: modelId,
    tokensUsed: { input: totalInput, output: totalOutput },
    durationMs: Date.now() - start,
    toolCalls: toolCallLogs,
  };
}

async function callOpenAI(
  modelId: string,
  req: DirectAIRequest,
  start: number,
): Promise<DirectAIResponse> {
  const client = getOpenAI();

  const response = await client.chat.completions.create({
    model: modelId,
    messages: [
      { role: "system", content: req.systemPrompt },
      { role: "user", content: req.userPrompt },
    ],
    max_completion_tokens: req.maxTokens || 16384,
    temperature: req.temperature ?? 0.7,
  });

  const content = response.choices[0]?.message?.content || "";

  return {
    success: true,
    content,
    provider: "openai",
    model: modelId,
    tokensUsed: {
      input: response.usage?.prompt_tokens || 0,
      output: response.usage?.completion_tokens || 0,
    },
    durationMs: Date.now() - start,
  };
}
