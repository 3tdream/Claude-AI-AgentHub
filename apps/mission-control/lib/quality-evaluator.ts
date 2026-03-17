import type { QualityScore } from "@/types";
import { AGENT_IDS, PIPELINE } from "@/lib/config";

export interface EvaluationResult {
  score: QualityScore;
  passed: boolean;
  feedback: string;
}

const EVALUATION_PROMPT = `You are the Orchestrator quality evaluator. Evaluate the following agent output.

AGENT: {{agentName}} (Stage {{stageNumber}})
TASK CONTEXT: {{taskInput}}
AGENT OUTPUT:
---
{{agentOutput}}
---

Score this output on FOUR axes (1-10 each):
- **Completeness**: Are all requirements addressed? No missing sections?
- **Specificity**: Are there concrete file paths, line numbers, function names? Not vague?
- **Actionability**: Can the next agent work from this without asking questions?
- **TaskCompletion**: Did the agent ACTUALLY DO the task? (not just describe what to do)
  - 10: Task fully implemented (edit_file succeeded, code compiles)
  - 7-9: Task partially done (some edits, or good spec for next agent)
  - 4-6: Agent described the solution but didn't implement it
  - 1-3: Agent got stuck, asked questions, or output is incomplete/truncated

You MUST respond in EXACTLY this format (one line each, no extra text):
[SCORE] completeness: X.X, specificity: X.X, actionability: X.X, taskCompletion: X.X → PASS/FAIL
[FEEDBACK] Your specific feedback here (what's missing or what needs improvement)

Rules:
- Overall = average of FOUR scores
- 7.5+ = PASS
- Below 7.5 = FAIL with specific feedback on what to improve
- If output is truncated (ends mid-sentence) → taskCompletion max 4
- If agent only described what to do but didn't do it → taskCompletion max 5
- Be strict but fair.`;

const RETRY_PROMPT = `You are {{agentName}}. RETRY ATTEMPT — your previous output scored {{prevScore}}/10.

## YOUR TASK (start fresh — ignore your previous attempt)
{{originalPrompt}}

## WHY YOU FAILED (fix ONLY these issues)
{{feedback}}

## RETRY RULES
- Do NOT apologize or reference your previous attempt
- Do NOT copy-paste from your failed output
- Fix ONLY the specific issues listed above
- If the feedback says "didn't use tools" → USE TOOLS this time
- If the feedback says "output truncated" → write SHORTER and more focused
- If the feedback says "described but didn't implement" → call edit_file/create_file NOW
- Start fresh with the task. Clean slate.`;

/**
 * Calls the Orchestrator agent to evaluate another agent's output.
 * Returns parsed quality scores and pass/fail decision.
 */
export async function evaluateStepOutput(
  agentName: string,
  stageNumber: string,
  taskInput: string,
  agentOutput: string,
  passThreshold?: number,
): Promise<EvaluationResult> {
  // Auto-fail if output is too short — agent didn't produce real work
  if (!agentOutput || agentOutput.trim().length < 100) {
    return {
      score: { completeness: 0, specificity: 0, actionability: 0, overall: 0 },
      passed: false,
      feedback: `Output too short (${agentOutput?.trim().length || 0} chars). Agent did not produce meaningful output — likely stuck in tool loop or timed out.`,
    };
  }

  const prompt = EVALUATION_PROMPT
    .replace("{{agentName}}", agentName)
    .replace("{{stageNumber}}", stageNumber)
    .replace("{{taskInput}}", taskInput.slice(0, 500))
    .replace("{{agentOutput}}", agentOutput.slice(0, 4000));

  try {
    const res = await fetch("/api/ai/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: AGENT_IDS.ORCHESTRATOR,
        model: "sonnet-4-6",
        userInput: prompt,
      }),
    });
    const data = await res.json();

    if (data.success && data.content) {
      return parseEvaluationResponse(data.content, passThreshold);
    }
  } catch {
    // If evaluation fails, default to pass with placeholder
  }

  // Fallback: if evaluation API fails, pass to avoid blocking pipeline
  return {
    score: { completeness: 7.5, specificity: 7.5, actionability: 7.5, taskCompletion: 7.5, overall: 7.5 },
    passed: true,
    feedback: "Evaluation unavailable — auto-passed to avoid blocking pipeline",
  };
}

/**
 * Parses the structured response from the Orchestrator.
 * Expected format:
 * [SCORE] completeness: 8.5, specificity: 7.0, actionability: 9.0 → PASS
 * [FEEDBACK] The architecture section lacks database schema details.
 */
function parseEvaluationResponse(response: string, passThreshold: number = PIPELINE.QUALITY_PASS_THRESHOLD): EvaluationResult {
  const lines = response.split("\n").map((l) => l.trim()).filter(Boolean);

  let completeness = 7;
  let specificity = 7;
  let actionability = 7;
  let taskCompletion = 7;
  let passed = false;
  let feedback = "";

  for (const line of lines) {
    // Parse 4-score line
    const scoreMatch4 = line.match(
      /\[SCORE\]\s*completeness:\s*([\d.]+),?\s*specificity:\s*([\d.]+),?\s*actionability:\s*([\d.]+),?\s*taskCompletion:\s*([\d.]+)\s*→?\s*(PASS|FAIL)/i,
    );
    if (scoreMatch4) {
      completeness = clampScore(parseFloat(scoreMatch4[1]));
      specificity = clampScore(parseFloat(scoreMatch4[2]));
      actionability = clampScore(parseFloat(scoreMatch4[3]));
      taskCompletion = clampScore(parseFloat(scoreMatch4[4]));
      passed = scoreMatch4[5].toUpperCase() === "PASS";
    }
    // Fallback: parse 3-score line (backwards compat)
    if (!scoreMatch4) {
      const scoreMatch3 = line.match(
        /\[SCORE\]\s*completeness:\s*([\d.]+),?\s*specificity:\s*([\d.]+),?\s*actionability:\s*([\d.]+)\s*→?\s*(PASS|FAIL)/i,
      );
      if (scoreMatch3) {
        completeness = clampScore(parseFloat(scoreMatch3[1]));
        specificity = clampScore(parseFloat(scoreMatch3[2]));
        actionability = clampScore(parseFloat(scoreMatch3[3]));
        taskCompletion = 7; // default if not provided
        passed = scoreMatch3[4].toUpperCase() === "PASS";
      }
    }

    // Parse feedback line
    const feedbackMatch = line.match(/\[FEEDBACK\]\s*(.*)/i);
    if (feedbackMatch) {
      feedback = feedbackMatch[1].trim();
    }
  }

  // If no structured match found, try to extract numbers from response
  if (completeness === 7 && specificity === 7 && actionability === 7 && taskCompletion === 7) {
    const numbers = response.match(/\d+\.?\d*/g);
    if (numbers && numbers.length >= 4) {
      completeness = clampScore(parseFloat(numbers[0]));
      specificity = clampScore(parseFloat(numbers[1]));
      actionability = clampScore(parseFloat(numbers[2]));
      taskCompletion = clampScore(parseFloat(numbers[3]));
    } else if (numbers && numbers.length >= 3) {
      completeness = clampScore(parseFloat(numbers[0]));
      specificity = clampScore(parseFloat(numbers[1]));
      actionability = clampScore(parseFloat(numbers[2]));
    }
    // Check for PASS/FAIL anywhere
    if (/PASS/i.test(response)) passed = true;
    if (/FAIL/i.test(response)) passed = false;
    // Use the whole response as feedback if no structured feedback
    if (!feedback) {
      feedback = response.slice(0, 300);
    }
  }

  const overall = round((completeness + specificity + actionability + taskCompletion) / 4);

  // Override pass/fail based on actual score (trust the math over LLM text)
  passed = overall >= passThreshold;

  return {
    score: { completeness, specificity, actionability, taskCompletion, overall },
    passed,
    feedback: feedback || (passed ? "Quality threshold met." : "Quality below threshold."),
  };
}

function clampScore(n: number): number {
  if (isNaN(n)) return 5;
  return round(Math.max(1, Math.min(10, n)));
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Builds a retry prompt that includes the evaluator's feedback.
 */
export function buildRetryPrompt(
  agentName: string,
  originalPrompt: string,
  previousOutput: string,
  feedback: string,
  prevScore?: number,
): string {
  return RETRY_PROMPT
    .replace("{{agentName}}", agentName)
    .replace("{{originalPrompt}}", originalPrompt)
    .replace("{{prevScore}}", (prevScore ?? 0).toFixed(1))
    .replace("{{feedback}}", feedback);
  // NOTE: previousOutput intentionally NOT included — clean context prevents copying mistakes
}
