/**
 * Output Continuation — cheap fix for truncated agent outputs.
 *
 * Instead of a full retry (~15K tokens), sends a continuation prompt
 * (~500 tokens input) asking the agent to finish from where it stopped.
 * Appends the continuation to the original output.
 *
 * Triggered when evaluator feedback contains "truncated".
 */

import { postLog } from "@/lib/hooks/use-logs";

/**
 * Detect if evaluator feedback indicates truncation.
 */
export function isTruncationFailure(feedback: string): boolean {
  return /truncat/i.test(feedback);
}

/**
 * Extract the last ~100 chars of output to use as continuation anchor.
 */
function getLastFragment(output: string, chars: number = 150): string {
  const trimmed = output.trim();
  if (trimmed.length <= chars) return trimmed;
  return "..." + trimmed.slice(-chars);
}

/**
 * Build a continuation prompt — asks the model to finish from where it stopped.
 */
export function buildContinuationPrompt(
  agentName: string,
  originalOutput: string,
  feedback: string,
): string {
  const lastFragment = getLastFragment(originalOutput);

  return `Your previous output was cut off mid-sentence. Continue from EXACTLY where you stopped.

LAST PART OF YOUR OUTPUT:
${lastFragment}

EVALUATOR FEEDBACK ON WHAT'S MISSING:
${feedback}

INSTRUCTIONS:
1. Do NOT repeat anything from above — continue from the exact cut-off point
2. Complete ALL remaining sections that are missing
3. If you were in the middle of a word/sentence, finish it first
4. Keep the same format and style as your previous output
5. End with a complete, properly closed document

START YOUR CONTINUATION NOW (from the exact cut-off point):`;
}

/**
 * Execute a continuation call and merge with original output.
 */
export async function continueOutput(
  agentId: string,
  model: string,
  systemPrompt: string,
  originalOutput: string,
  feedback: string,
): Promise<{ success: boolean; mergedOutput: string; continuationTokens: number }> {
  const prompt = buildContinuationPrompt(agentId, originalOutput, feedback);

  try {
    const res = await fetch("/api/ai/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId,
        model,
        userInput: prompt,
        useTools: false,
      }),
    });

    const data = await res.json();

    if (data.success && data.content && data.content.trim().length > 50) {
      const merged = originalOutput.trim() + "\n" + data.content.trim();

      postLog({
        type: "system",
        agentId,
        content: `OUTPUT CONTINUATION: appended ${data.content.length} chars (${data.tokensUsed?.output || 0} tokens). Total: ${merged.length} chars.`,
      }).catch(() => {});

      return {
        success: true,
        mergedOutput: merged,
        continuationTokens: (data.tokensUsed?.input || 0) + (data.tokensUsed?.output || 0),
      };
    }

    return { success: false, mergedOutput: originalOutput, continuationTokens: 0 };
  } catch {
    return { success: false, mergedOutput: originalOutput, continuationTokens: 0 };
  }
}
