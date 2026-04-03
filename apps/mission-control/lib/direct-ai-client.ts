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
  readBudget?: number;
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

  let readOnlyCallCount = 0;
  const READ_LIMIT = req.readBudget || 10;

  for (let step = 0; step < maxSteps; step++) {
    // Use streaming to avoid 10-minute timeout on long requests
    const stream = client.messages.stream({
      model: modelId,
      max_tokens: req.maxTokens || 65536,
      temperature: req.temperature ?? 0.3,
      system: systemWithCache,
      messages,
      tools: req.tools as Anthropic.Messages.Tool[],
    });

    const response = await stream.finalMessage();

    totalInput += response.usage.input_tokens;
    totalOutput += response.usage.output_tokens;

    // Extract text content — accumulate across turns (don't overwrite)
    const textBlocks = response.content.filter((b): b is Anthropic.Messages.TextBlock => b.type === "text");
    if (textBlocks.length > 0) {
      const turnText = textBlocks.map((b) => b.text).join("\n");
      finalContent = finalContent ? finalContent + "\n" + turnText : turnText;
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
      // Шаг 4: Force first tool call enforcement for implementation agents
      if (toolCallLogs.length === 0 && req.readBudget !== undefined && req.readBudget <= 2) {
        // This is an implementation agent's first call
        if (toolUse.name === "read_file" || toolUse.name === "list_files") {
          // Redirect: execute the read but inject correction
          const result = await req.onToolCall!(toolUse.name, toolUse.input as Record<string, string>);
          toolCallLogs.push({ name: toolUse.name, input: toolUse.input as Record<string, string>, output: result.output.substring(0, 500), success: result.success, durationMs: 0 });
          toolResults.push({
            type: "tool_result", tool_use_id: toolUse.id,
            content: result.output.substring(0, 3000) + `\n\n🛑 CORRECTION: Your first tool call should have been edit_file or create_file, not ${toolUse.name}. You now have the content. Your NEXT call MUST be edit_file or create_file. Do NOT read any more files.`,
            is_error: false,
          });
          continue;
        }
      }

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
        // Truncate + summarize tool output to prevent context explosion
        const TOOL_LIMITS: Record<string, number> = { read_file: 50000, list_files: 12000, run_command: 10000 };
        const maxOutputLen = TOOL_LIMITS[toolUse.name] || 12000;
        let truncatedOutput = result.output;
        // Summarize run_command output if too large (saves QA tokens)
        if (toolUse.name === "run_command" && result.output.length > 5000) {
          const lines = result.output.split("\n");
          const errorLines = lines.filter((l: string) => /error|Error|ERR|fail/i.test(l));
          truncatedOutput = errorLines.length > 0
            ? `${errorLines.length} errors found (${lines.length} total lines):\n${errorLines.slice(0, 20).join("\n")}\n\n... (${lines.length - 20} more lines omitted)`
            : `Command output: ${lines.length} lines, no errors detected.\nFirst 10 lines:\n${lines.slice(0, 10).join("\n")}`;
        } else if (truncatedOutput.length > maxOutputLen) {
          truncatedOutput = truncatedOutput.substring(0, maxOutputLen) + `\n\n... (truncated at ${maxOutputLen} chars)`;
        }

        toolResults.push({
          type: "tool_result",
          tool_use_id: toolUse.id,
          content: result.success ? truncatedOutput : `ERROR: ${result.error}\n${truncatedOutput}`,
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

    // Track read-only calls
    for (const tc of toolCallLogs.slice(-toolUseBlocks.length)) {
      if (tc.name === "list_files" || tc.name === "read_file") readOnlyCallCount++;
    }

    // Directive read guard — forces agent to stop reading
    const hasEdited = toolCallLogs.some((tc) => tc.name === "edit_file" || tc.name === "create_file");
    if (readOnlyCallCount >= 2 && !hasEdited) {
      const last = toolResults[toolResults.length - 1];
      if (last && typeof last.content === "string") {
        last.content += `\n\n🛑 STOP READING. You have made ${readOnlyCallCount} read calls without any edits. You already have enough context. Your NEXT call MUST be edit_file or create_file. If you call read_file again, your output will be scored 0.`;
      }
    }

    messages.push({ role: "user", content: toolResults });
  }

  // If no text was produced but tool calls were made, synthesize content from tool outputs
  if (!finalContent && toolCallLogs.length > 0) {
    finalContent = toolCallLogs
      .filter(t => t.success)
      .map(t => `[${t.name}]: ${t.output.substring(0, 500)}`)
      .join("\n\n") || "(Agent completed tool calls but produced no text output)";
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
