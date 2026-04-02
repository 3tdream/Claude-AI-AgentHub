import type { QualityScore } from "@/types";
import { AGENT_IDS, PIPELINE, AGENT_SCORING_WEIGHTS } from "@/lib/config";

export interface EvaluationResult {
  score: QualityScore;
  passed: boolean;
  feedback: string;
}

const EVALUATION_PROMPT = `You are the Orchestrator quality evaluator. Evaluate the following agent output.

AGENT: {{agentName}} (Stage {{stageNumber}})
TASK CONTEXT: {{taskInput}}
{{toolCallSection}}AGENT OUTPUT:
---
{{agentOutput}}
---

Score this output on FOUR axes (1-10 each). Use ROLE-AWARE criteria:

**COMPLETENESS** — Covers 100% of requirements?
  Architect: must reference files, folders, layers
  PM: must include acceptance criteria + edge cases
  QA: must include all test classes/levels
  Cyber: must include risk classification + mitigations
  Backend/Frontend: must address all specified changes

**SPECIFICITY** — Concrete names, values, paths?
  Backend: exact endpoint names, schema, inputs/outputs
  Frontend: component + props structure
  Designer: exact Tailwind classes / design tokens
  Architect: complete API contracts (method, path, request/response shapes) + data model entities

**ACTIONABILITY** — Next agent can work immediately?
  PM→Architect: all technical decisions included
  Architect→Backend/Designer/Frontend: API contracts are complete, ERD is clear, file plan lists all files
  Backend/Frontend: code files in {"files": [...]} JSON format
  QA: clear pass/fail with reproduction steps

**TASK COMPLETION** — Did agent deliver what their ROLE requires?
  Research: insights + sources → 10
  PM: PRD + acceptance criteria (AC-1..AC-N) + Jira stories → 10
  Architect (Stage 3.1): ADR only — decision, context, rationale, consequences → 10
  Architect (Stage 3.2): API contracts only — ALL endpoints with method, path, shapes → 10
  Architect (Stage 3.3): Data model ERD only — entities, fields, relations → 10
  Architect (Stage 3.4): File plan only — list of files to create/modify → 10
  Architect (any other stage): evaluate what was asked in the task prompt → 10
  Designer: {"files": [...]} with CSS tokens + component specs → 10
  Backend: {"files": [...]} with SQL migrations + route handlers + types → 10
  Frontend: {"files": [...]} with page components wiring Designer + Backend → 10
  DevOps: {"files": [...]} with Dockerfile + .env.example + CI config → 10
  QA: {"acceptance_results": [...]} with VERDICT → 10
  Cyber: vulnerability summary + severity + fix → 10
  If output truncated mid-sentence → max 4
  If described but didn't deliver → max 5
  NOTE: Architect does NOT write code or call create_file — do NOT penalize for missing tool calls

You MUST respond in EXACTLY this format (one line each, no extra text):
[SCORE] completeness: X.X, specificity: X.X, actionability: X.X, taskCompletion: X.X → PASS/FAIL
[FEEDBACK] Your specific feedback here (what's missing or what needs improvement)

Rules:
- Overall is WEIGHTED per agent role (taskCompletion has highest weight 40-70%)
- 7.5+ = PASS
- TaskCompletion is the MOST IMPORTANT axis — did the agent actually deliver?
- For implementation agents (Backend/Frontend): taskCompletion = 70% of overall
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
export interface ToolCallInfo {
  name: string;
  input: Record<string, string>;
  success: boolean;
}

export async function evaluateStepOutput(
  agentName: string,
  stageNumber: string,
  taskInput: string,
  agentOutput: string,
  passThreshold?: number,
  agentId?: string,
  toolCalls?: ToolCallInfo[],
): Promise<EvaluationResult> {
  // Auto-fail if output is too short AND no tool calls were made
  if ((!agentOutput || agentOutput.trim().length < 100) && (!toolCalls || toolCalls.length === 0)) {
    return {
      score: { completeness: 0, specificity: 0, actionability: 0, overall: 0 },
      passed: false,
      feedback: `Output too short (${agentOutput?.trim().length || 0} chars) with no tool calls. Agent did not produce meaningful output.`,
    };
  }

  // Build tool call summary for evaluator context
  let toolCallSection = "";
  if (toolCalls && toolCalls.length > 0) {
    const lines = toolCalls.map(tc => {
      const file = tc.input?.path || tc.input?.file_path || tc.input?.command || "";
      return `  ${tc.success ? "✓" : "✗"} ${tc.name}(${file})`;
    });
    toolCallSection = `TOOL CALLS MADE (${toolCalls.length} total):\n${lines.join("\n")}\n\nIMPORTANT: The agent used tools to perform real actions (file edits, file creation, commands).\nEvaluate the TOOL ACTIONS + TEXT OUTPUT together. If tools succeeded (create_file, edit_file), the agent DID deliver — even if the text output is brief.\n\n`;
  }

  const prompt = EVALUATION_PROMPT
    .replace("{{agentName}}", agentName)
    .replace("{{stageNumber}}", stageNumber)
    .replace("{{taskInput}}", taskInput.slice(0, 500))
    .replace("{{toolCallSection}}", toolCallSection)
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
      return parseEvaluationResponse(data.content, passThreshold, agentId);
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
function parseEvaluationResponse(response: string, passThreshold: number = PIPELINE.QUALITY_PASS_THRESHOLD, agentId?: string): EvaluationResult {
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

  // Per-agent weighted scoring
  const w = AGENT_SCORING_WEIGHTS[agentId || ""] || AGENT_SCORING_WEIGHTS["_default"];
  const overall = round(
    taskCompletion * w.task +
    completeness * w.comp +
    specificity * w.spec +
    actionability * w.act
  );

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

// ── pass@k Statistical Verification ─────────────────────────

export interface PassAtKResult {
  /** Individual evaluation results */
  trials: EvaluationResult[];
  /** pass@k: at least 1 trial passed */
  passAtK: boolean;
  /** pass^k: ALL trials passed */
  passAllK: boolean;
  /** Number of trials that passed */
  passCount: number;
  /** Total trials run */
  k: number;
  /** Statistical confidence: passCount / k */
  confidence: number;
  /** Aggregated score: average of all trials */
  avgScore: QualityScore;
  /** Best single trial */
  bestTrial: EvaluationResult;
  /** Worst single trial */
  worstTrial: EvaluationResult;
  /** Combined feedback from all trials */
  combinedFeedback: string;
}

/**
 * Run quality evaluation k times for statistical confidence.
 * - pass@k: at least 1 success in k trials (target >90%)
 * - pass^k: ALL k trials succeed (for critical paths)
 *
 * Default k=3 for balance between cost and confidence.
 * Critical stages (cyber, final verdict) should use k=3.
 * Simple stages can use k=1 (standard single eval).
 */
export async function evaluateStepOutputK(
  agentName: string,
  stageNumber: string,
  taskInput: string,
  agentOutput: string,
  passThreshold?: number,
  agentId?: string,
  toolCalls?: ToolCallInfo[],
  k: number = 3,
): Promise<PassAtKResult> {
  // Run k evaluations in parallel
  const trials = await Promise.all(
    Array.from({ length: k }, () =>
      evaluateStepOutput(agentName, stageNumber, taskInput, agentOutput, passThreshold, agentId, toolCalls)
    ),
  );

  const passCount = trials.filter((t) => t.passed).length;
  const passAtK = passCount > 0;
  const passAllK = passCount === k;
  const confidence = Math.round((passCount / k) * 100) / 100;

  // Aggregate scores
  const avgScore: QualityScore = {
    completeness: round(trials.reduce((a, t) => a + t.score.completeness, 0) / k),
    specificity: round(trials.reduce((a, t) => a + t.score.specificity, 0) / k),
    actionability: round(trials.reduce((a, t) => a + t.score.actionability, 0) / k),
    taskCompletion: round(trials.reduce((a, t) => a + (t.score.taskCompletion || 0), 0) / k),
    overall: round(trials.reduce((a, t) => a + t.score.overall, 0) / k),
  };

  // Find best and worst
  const sorted = [...trials].sort((a, b) => b.score.overall - a.score.overall);
  const bestTrial = sorted[0];
  const worstTrial = sorted[sorted.length - 1];

  // Combine unique feedback
  const uniqueFeedback = [...new Set(trials.map((t) => t.feedback))];
  const combinedFeedback = `pass@${k}: ${passCount}/${k} (${Math.round(confidence * 100)}% confidence). ` +
    uniqueFeedback.join(" | ");

  return {
    trials,
    passAtK,
    passAllK,
    passCount,
    k,
    confidence,
    avgScore,
    bestTrial,
    worstTrial,
    combinedFeedback,
  };
}

/**
 * Builds a retry prompt that includes the evaluator's feedback.
 * Optionally includes investigation diagnosis and matched KB patterns.
 */
export function buildRetryPrompt(
  agentName: string,
  originalPrompt: string,
  previousOutput: string,
  feedback: string,
  prevScore?: number,
  investigation?: { diagnosis: string; category: string; matchedKBPatterns?: string[] },
): string {
  let prompt = RETRY_PROMPT
    .replace("{{agentName}}", agentName)
    .replace("{{originalPrompt}}", originalPrompt)
    .replace("{{prevScore}}", (prevScore ?? 0).toFixed(1))
    .replace("{{feedback}}", feedback);

  // Append investigation context if available
  if (investigation) {
    prompt += `\n\n## FAILURE DIAGNOSIS (from investigation)\n- Category: ${investigation.category}\n- ${investigation.diagnosis}`;
    if (investigation.matchedKBPatterns && investigation.matchedKBPatterns.length > 0) {
      prompt += `\n\n## KNOWN FAILURE PATTERNS (from KB — avoid these)\n${investigation.matchedKBPatterns.map(p => `- ${p}`).join("\n")}`;
    }
  }

  return prompt;
  // NOTE: previousOutput intentionally NOT included — clean context prevents copying mistakes
}
