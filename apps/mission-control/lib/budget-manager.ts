/**
 * Per-Stage Budget Caps — Token cost tracking and enforcement.
 *
 * Tracks cumulative USD spend per pipeline stage and enforces caps.
 * Pricing based on Anthropic 2025 rates.
 */

// ── Model Pricing (USD per 1M tokens) ──

const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "haiku-4-5":  { input: 0.25,  output: 1.25 },
  "sonnet-4-6": { input: 3.00,  output: 15.00 },
  "opus-4-6":   { input: 15.00, output: 75.00 },
};

/** Fallback pricing if model not recognized */
const DEFAULT_PRICING = { input: 3.00, output: 15.00 }; // sonnet-tier

// ── Per-Stage Budget Caps (USD) ──

const STAGE_BUDGET_CAPS: Record<string, number> = {
  // Planning stages (S0-S4): $1.00 each
  "s0-routing":        1.00,
  "s0.1-preflight":    1.00,
  "s0.2-strategy":     1.00,
  "s1-orchestrator":   1.00,
  "s2-pm":             1.00,
  "s3-architect":      1.00,
  "s3.1-overview":     1.00,
  "s3.2-api":          1.00,
  "s3.3-erd":          1.00,
  "s3.4-file-plan":    1.00,
  "s3.5-cyber":        1.00,
  "s4-designer":       1.00,

  // Gates: $0.50 each
  "s2.5-prd-gate":     0.50,
  "s4.5-arch-gate":    0.50,
  "s8.5-tech-review":  0.50,
  "s11-final-verdict": 0.50,
  "s12b-consolidation": 0.50,

  // Implementation: $3.00 each
  "s5-backend":        3.00,
  "s7-frontend":       3.00,

  // QA: $2.00 each
  "s8-qa":             2.00,
  "s9-qa-retest":      2.00,

  // DevOps: $1.00
  "s12a-devops":       1.00,
};

/** Default cap for unrecognized stages */
const DEFAULT_BUDGET_CAP = 1.00;

// ── Budget State Type ──

export interface BudgetState {
  spent: number;
  limit: number;
}

export type BudgetAction = "continue" | "warn" | "pause" | "downgrade";

export interface BudgetCheckResult {
  ok: boolean;
  spent: number;
  limit: number;
  action: BudgetAction;
  percentUsed: number;
}

// ── Cost Calculation ──

/**
 * Calculate USD cost from token counts and model name.
 */
export function calculateCost(
  model: string,
  tokensUsed: { input: number; output: number },
): number {
  const pricing = MODEL_PRICING[model] || DEFAULT_PRICING;
  const inputCost = (tokensUsed.input / 1_000_000) * pricing.input;
  const outputCost = (tokensUsed.output / 1_000_000) * pricing.output;
  return inputCost + outputCost;
}

// ── Budget Check ──

/**
 * Check whether a stage is within budget.
 *
 * @param stageId - Pipeline stage ID (e.g. "s5-backend")
 * @param model - Model used for this call
 * @param tokensUsed - Tokens consumed in this call
 * @param currentSpent - Already-spent amount for this stage (from previous calls/retries)
 * @returns Budget check result with action recommendation
 */
export function checkBudget(
  stageId: string,
  model: string,
  tokensUsed: { input: number; output: number },
  currentSpent: number = 0,
): BudgetCheckResult {
  const callCost = calculateCost(model, tokensUsed);
  const totalSpent = currentSpent + callCost;
  const limit = STAGE_BUDGET_CAPS[stageId] ?? DEFAULT_BUDGET_CAP;
  const percentUsed = (totalSpent / limit) * 100;

  let action: BudgetAction = "continue";
  let ok = true;

  if (percentUsed >= 100) {
    action = "pause";
    ok = false;
  } else if (percentUsed >= 80) {
    action = "warn";
  }

  return { ok, spent: totalSpent, limit, action, percentUsed };
}

/**
 * Get the budget cap for a stage.
 */
export function getStageBudgetCap(stageId: string): number {
  return STAGE_BUDGET_CAPS[stageId] ?? DEFAULT_BUDGET_CAP;
}

/**
 * Suggest a cheaper model when budget is tight.
 * Returns null if already on cheapest model.
 */
export function suggestDowngrade(currentModel: string): string | null {
  if (currentModel === "opus-4-6") return "sonnet-4-6";
  if (currentModel === "sonnet-4-6") return "haiku-4-5";
  return null; // already cheapest
}
