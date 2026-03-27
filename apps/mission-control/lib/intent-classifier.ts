/**
 * Intent Classifier — decides execution mode for user input
 *
 * DIRECT:   Simple edits, renames, fixes (<3 files, no architecture)
 * PIPELINE: Multi-stage, security-sensitive, full features
 * HYBRID:   Claude prepares + pipeline validates
 */

export type ExecutionIntent = "direct" | "pipeline" | "hybrid";

export interface IntentDecision {
  intent: ExecutionIntent;
  confidence: number;
  reason: string;
  /** Suggested pipeline mode if intent = pipeline */
  pipelineMode?: "quick" | "medium" | "full";
}

export function classifyIntent(input: string): IntentDecision {
  const t = input.toLowerCase().trim();
  const wordCount = t.split(/\s+/).length;

  // ── DIRECT signals ──
  const directSignals = [
    /^(rename|change|replace|swap|toggle|remove|delete|add|set)\s/,
    /^fix\s.{5,50}$/,           // short fix
    /\b(typo|color|text|label|title|name|placeholder|className)\b/,
    /\b(one|single|this|that)\s+(file|line|component|string|value)\b/,
    /^update\s.{5,40}$/,        // short update
  ];

  const directScore = directSignals.filter((r) => r.test(t)).length;

  // ── PIPELINE signals ──
  const pipelineSignals = [
    /\b(build|create|implement|design)\s+(new|full|complete|entire)\b/,
    /\b(auth|security|jwt|rbac|payment|billing)\b/,
    /\b(database|migration|schema|api.*endpoint)\b/,
    /\b(frontend.*backend|backend.*frontend|full.?stack)\b/,
    /\b(from scratch|new feature|new module|new system)\b/,
    /\b(architecture|design system|infrastructure)\b/,
    /\b(test|qa|audit|review|scan)\b.*\b(all|full|complete)\b/,
  ];

  const pipelineScore = pipelineSignals.filter((r) => r.test(t)).length;

  // ── HYBRID signals ──
  const hybridSignals = [
    /\b(add|create)\b.*\b(and|then|also|with)\b/,   // multi-step
    /\b(component|page)\b.*\b(api|endpoint|route)\b/, // crosses domains
  ];

  const hybridScore = hybridSignals.filter((r) => r.test(t)).length;

  // ── Decision logic ──

  // Very short input (<8 words) + direct signals → DIRECT
  if (wordCount <= 8 && directScore > 0 && pipelineScore === 0) {
    return { intent: "direct", confidence: 0.9, reason: "Short, simple edit task" };
  }

  // Direct signals dominate
  if (directScore >= 2 && pipelineScore === 0) {
    return { intent: "direct", confidence: 0.85, reason: "Multiple direct edit signals" };
  }

  // Pipeline signals dominate
  if (pipelineScore >= 2) {
    const mode = pipelineScore >= 3 ? "full" : "medium";
    return { intent: "pipeline", confidence: 0.8, reason: "Multi-stage or security-sensitive task", pipelineMode: mode };
  }

  // Hybrid: has both direct and pipeline signals
  if (directScore > 0 && pipelineScore > 0) {
    return { intent: "hybrid", confidence: 0.7, reason: "Task spans simple edit + complex logic" };
  }
  if (hybridScore > 0) {
    return { intent: "hybrid", confidence: 0.65, reason: "Multi-domain task" };
  }

  // Single pipeline signal
  if (pipelineScore === 1) {
    return { intent: "pipeline", confidence: 0.6, reason: "Contains architecture/security concern", pipelineMode: "quick" };
  }

  // Default: short = direct, long = pipeline
  if (wordCount <= 15) {
    return { intent: "direct", confidence: 0.5, reason: "Short input, defaulting to direct" };
  }

  return { intent: "pipeline", confidence: 0.5, reason: "Complex input, defaulting to pipeline", pipelineMode: "medium" };
}
