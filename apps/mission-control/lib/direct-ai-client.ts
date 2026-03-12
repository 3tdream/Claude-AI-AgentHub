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

export interface DirectAIResponse {
  success: boolean;
  content: string;
  provider: AIProvider;
  model: string;
  tokensUsed: { input: number; output: number };
  durationMs: number;
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
    max_tokens: req.maxTokens || 4096,
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
    max_tokens: req.maxTokens || 4096,
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
