import type { QualityScore } from "@/types";

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

Score this output on three axes (1-10 each):
- **Completeness**: Are all requirements addressed? No missing sections?
- **Specificity**: Are there concrete values, names, technologies? Not vague?
- **Actionability**: Can the next agent work from this without asking questions?

You MUST respond in EXACTLY this format (one line, no extra text):
[SCORE] completeness: X.X, specificity: X.X, actionability: X.X → PASS/FAIL
[FEEDBACK] Your specific feedback here (what's missing or what needs improvement)

Rules:
- Overall = average of three scores
- 8+ = PASS
- Below 8 = FAIL with specific feedback on what to improve
- Be strict but fair. Vague outputs should score low on specificity.`;

const RETRY_PROMPT = `You are {{agentName}}. Your previous output was evaluated and did NOT meet quality standards.

ORIGINAL TASK: {{originalPrompt}}

YOUR PREVIOUS OUTPUT:
---
{{previousOutput}}
---

EVALUATOR FEEDBACK:
{{feedback}}

Please redo your work addressing the specific feedback above. Be more thorough, specific, and actionable.`;

/**
 * Calls the Orchestrator agent to evaluate another agent's output.
 * Returns parsed quality scores and pass/fail decision.
 */
export async function evaluateStepOutput(
  agentName: string,
  stageNumber: string,
  taskInput: string,
  agentOutput: string,
): Promise<EvaluationResult> {
  const prompt = EVALUATION_PROMPT
    .replace("{{agentName}}", agentName)
    .replace("{{stageNumber}}", stageNumber)
    .replace("{{taskInput}}", taskInput.slice(0, 500))
    .replace("{{agentOutput}}", agentOutput.slice(0, 2000));

  try {
    const res = await fetch("/api/agent-hub/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assistantId: "orchestrator",
        userInput: prompt,
      }),
    });
    const data = await res.json();

    if (data.success && data.content) {
      return parseEvaluationResponse(data.content);
    }
  } catch {
    // If evaluation fails, default to pass with placeholder
  }

  // Fallback: generate a conservative pass
  return {
    score: { completeness: 7.5, specificity: 7.5, actionability: 7.5, overall: 7.5 },
    passed: false,
    feedback: "Evaluation unavailable — manual review recommended",
  };
}

/**
 * Parses the structured response from the Orchestrator.
 * Expected format:
 * [SCORE] completeness: 8.5, specificity: 7.0, actionability: 9.0 → PASS
 * [FEEDBACK] The architecture section lacks database schema details.
 */
function parseEvaluationResponse(response: string): EvaluationResult {
  const lines = response.split("\n").map((l) => l.trim()).filter(Boolean);

  let completeness = 7;
  let specificity = 7;
  let actionability = 7;
  let passed = false;
  let feedback = "";

  for (const line of lines) {
    // Parse score line
    const scoreMatch = line.match(
      /\[SCORE\]\s*completeness:\s*([\d.]+),?\s*specificity:\s*([\d.]+),?\s*actionability:\s*([\d.]+)\s*→?\s*(PASS|FAIL)/i,
    );
    if (scoreMatch) {
      completeness = clampScore(parseFloat(scoreMatch[1]));
      specificity = clampScore(parseFloat(scoreMatch[2]));
      actionability = clampScore(parseFloat(scoreMatch[3]));
      passed = scoreMatch[4].toUpperCase() === "PASS";
    }

    // Parse feedback line
    const feedbackMatch = line.match(/\[FEEDBACK\]\s*(.*)/i);
    if (feedbackMatch) {
      feedback = feedbackMatch[1].trim();
    }
  }

  // If no structured match found, try to extract numbers from response
  if (completeness === 7 && specificity === 7 && actionability === 7) {
    const numbers = response.match(/\d+\.?\d*/g);
    if (numbers && numbers.length >= 3) {
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

  const overall = round((completeness + specificity + actionability) / 3);

  // Override pass/fail based on actual score (trust the math over LLM text)
  passed = overall >= 8;

  return {
    score: { completeness, specificity, actionability, overall },
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
): string {
  return RETRY_PROMPT
    .replace("{{agentName}}", agentName)
    .replace("{{originalPrompt}}", originalPrompt)
    .replace("{{previousOutput}}", previousOutput.slice(0, 1500))
    .replace("{{feedback}}", feedback);
}
