/**
 * Per-Stage Confidence Scoring + Early Termination Logic
 *
 * Parses agent self-reported confidence from output,
 * applies per-stage thresholds, and decides whether to
 * early-stop the pipeline or escalate the model.
 */

// ── Stage classification for threshold selection ──

const CRITICAL_STAGES = new Set([
  "s3.1-adr", "s3.2-api", "s3.3-erd", "s3.4-fileplan",
  "s5-backend", "s7-frontend",
]);

const GATE_STAGES = new Set([
  "s2.5-prd-gate", "s4.5-arch-gate", "s8.5-tech-review",
  "s11-final-verdict", "s12b-consolidation",
]);

function getThreshold(stageId: string): number {
  if (CRITICAL_STAGES.has(stageId)) return 0.6;
  if (GATE_STAGES.has(stageId)) return 0.5;
  return 0.4;
}

// ── Stage phase classification (pre-implementation vs implementation) ──

function isPreImplementation(stageId: string): boolean {
  // S0-S4 stages (planning/architecture)
  const prefix = stageId.split("-")[0]; // e.g. "s0", "s1", "s2.5", "s3.1"
  const num = parseFloat(prefix.replace("s", ""));
  return !isNaN(num) && num < 5;
}

// ── Confidence Parsing ──

/**
 * Extract confidence score from agent output.
 * Looks for:
 *   1. "CONFIDENCE: 0.X" pattern (plain text)
 *   2. JSON block with "confidence" field
 * Returns null if not found.
 */
export function parseConfidence(output: string): number | null {
  // Pattern 1: CONFIDENCE: 0.X (anywhere in output)
  const plainMatch = output.match(/CONFIDENCE:\s*(0?\.\d+|1\.0|1|0)/i);
  if (plainMatch) {
    const val = parseFloat(plainMatch[1]);
    if (val >= 0 && val <= 1) return val;
  }

  // Pattern 2: JSON block with confidence field
  const jsonBlocks = output.match(/```json\s*([\s\S]*?)```/g);
  if (jsonBlocks) {
    for (const block of jsonBlocks) {
      try {
        const json = block.replace(/```json\s*/, "").replace(/```$/, "").trim();
        const parsed = JSON.parse(json);
        if (typeof parsed.confidence === "number" && parsed.confidence >= 0 && parsed.confidence <= 1) {
          return parsed.confidence;
        }
      } catch {
        // Not valid JSON — skip
      }
    }
  }

  return null;
}

// ── Confidence Gate Decision ──

export interface ConfidenceGateResult {
  stop: boolean;
  reason: string;
  threshold: number;
}

/**
 * Decide whether to early-stop based on confidence score and stage criticality.
 */
export function shouldEarlyStop(stageId: string, confidence: number): ConfidenceGateResult {
  const threshold = getThreshold(stageId);

  if (confidence >= threshold) {
    return { stop: false, reason: "", threshold };
  }

  const stageType = CRITICAL_STAGES.has(stageId)
    ? "critical"
    : GATE_STAGES.has(stageId)
      ? "gate"
      : "standard";

  return {
    stop: true,
    reason: `Low confidence on ${stageType} stage: ${confidence.toFixed(2)} < ${threshold} threshold`,
    threshold,
  };
}

// ── Early Termination Action ──

export type EarlyTerminationAction =
  | { action: "continue" }
  | { action: "escalate_model"; reason: string }
  | { action: "pause"; reason: string };

/**
 * Determine what action to take when confidence is below threshold.
 *
 * Pre-implementation stages (S0-S4):
 *   - Try model escalation first
 *   - If already at highest model → pause
 *
 * Implementation stages (S5+):
 *   - Escalate model immediately, retry once
 *   - If already at highest model → pause for human review
 */
export function getEarlyTerminationAction(
  stageId: string,
  confidence: number,
  currentModel: string,
  alreadyEscalated: boolean,
): EarlyTerminationAction {
  const gate = shouldEarlyStop(stageId, confidence);
  if (!gate.stop) {
    return { action: "continue" };
  }

  const isAtHighestModel = currentModel === "opus-4-6";
  const preImpl = isPreImplementation(stageId);

  if (preImpl) {
    // Pre-implementation: try escalation first
    if (!isAtHighestModel && !alreadyEscalated) {
      return {
        action: "escalate_model",
        reason: `Pre-implementation confidence ${confidence.toFixed(2)} below ${gate.threshold} — escalating model`,
      };
    }
    return {
      action: "pause",
      reason: `Early termination: ${stageId} confidence ${confidence.toFixed(2)} (threshold ${gate.threshold}) — already at highest model`,
    };
  }

  // Implementation (S5+): escalate immediately
  if (!isAtHighestModel && !alreadyEscalated) {
    return {
      action: "escalate_model",
      reason: `Implementation confidence ${confidence.toFixed(2)} below ${gate.threshold} — escalating model for retry`,
    };
  }

  return {
    action: "pause",
    reason: `Early termination: ${stageId} confidence ${confidence.toFixed(2)} — paused for human review`,
  };
}

// ── Confidence Prompt Instruction ──

/**
 * Append to agent system prompt to request confidence self-reporting.
 */
export const CONFIDENCE_INSTRUCTION =
  '\n\nAt the END of your response, include exactly this line:\nCONFIDENCE: X.X\n(where X.X is 0.0 to 1.0 — 0.0 = highly uncertain, 1.0 = fully confident in the completeness and correctness of your output)';
