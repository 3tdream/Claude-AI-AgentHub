/**
 * Intent Classifier — decides execution mode for user input
 *
 * DIRECT:   Modify existing code — rename, fix, change value, swap, recolor (<3 files)
 * PIPELINE: Create new functionality — add feature, build system, new module
 * HYBRID:   Claude does quick parts + pipeline validates/implements complex parts
 *
 * Rule: if it CREATES something new → pipeline. If it MODIFIES something existing → direct.
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

  // ── PIPELINE signals (check FIRST — these override direct) ──
  const pipelineSignals = [
    // New functionality
    /\b(build|create|implement|design)\s/,
    /\b(add)\s+(new|feature|module|system|page|component|endpoint|api|auth|flow|toggle|switch|mode)\b/,
    /\b(from scratch|new feature|new module|new system|new page)\b/,
    // Security / architecture
    /\b(auth|security|jwt|rbac|payment|billing|oauth)\b/,
    /\b(database|migration|schema)\b/,
    /\b(frontend.*backend|backend.*frontend|full.?stack)\b/,
    /\b(architecture|design system|infrastructure)\b/,
    // Full scope
    /\b(test|qa|audit|review|scan)\b.*\b(all|full|complete)\b/,
    // Multi-file hints
    /\b(across|all pages|every|multiple|several)\b/,
  ];

  const pipelineScore = pipelineSignals.filter((r) => r.test(t)).length;

  // ── DIRECT signals ──
  const directSignals = [
    /^(rename|change|replace|swap|remove|delete|set)\s/,
    /^fix\s/,
    /^update\s.{3,50}$/,
    /\b(typo|color|text|label|title|name|placeholder|className|class|style|font|size|margin|padding|border|icon)\b/,
    /\b(one|single|this|that)\s+(file|line|component|string|value)\b/,
    /\bto\s+(blue|red|green|black|white|bold|italic|hidden|visible|left|right|center)\b/,
    /\b(move|reorder|sort|hide|show|enable|disable)\b/,
    // File-specific edits are always direct
    /\bin\s+(lib|app|components|types|pages)\/\S+\.(ts|tsx|js|json|css)\b/,
    /\b(should|must|always|never)\s+(return|be|have|use)\b/,
    /\b(bug|broken|doesn't work|not working|error|crash|404|500)\b/,
  ];

  const directScore = directSignals.filter((r) => r.test(t)).length;

  // ── HYBRID signals ──
  const hybridSignals = [
    /\b(add|create)\b.*\b(and|then|also|with)\b/,
    /\b(component|page)\b.*\b(api|endpoint|route)\b/,
    /\b(update|change)\b.*\b(and|also|plus)\b.*\b(add|create)\b/,
  ];

  const hybridScore = hybridSignals.filter((r) => r.test(t)).length;

  // ── "Add" disambiguation ──
  // "add X" is tricky: "add class to button" = direct, "add auth system" = pipeline
  const addMatch = t.match(/^add\s+(.+)/);
  if (addMatch) {
    const what = addMatch[1];
    // Direct: adding a value/class/text to existing element
    const addDirect = /^(a|the|this)?\s*(class|style|text|import|line|comment|attribute|prop|param|field|border|margin|padding|color|icon)\b/.test(what);
    // Pipeline: adding new functionality
    const addPipeline = /\b(feature|module|system|page|component|endpoint|api|auth|flow|toggle|switch|mode|function|service|provider|hook|store|route)\b/.test(what);

    if (addDirect && !addPipeline) {
      return { intent: "direct", confidence: 0.85, reason: "Adding value/attribute to existing code" };
    }
    if (addPipeline) {
      const mode = pipelineScore >= 2 ? "medium" : "quick";
      return { intent: "pipeline", confidence: 0.8, reason: "Adding new functionality", pipelineMode: mode };
    }
  }

  // ── Decision logic ──

  // Pipeline signals dominate
  if (pipelineScore >= 2) {
    const mode = pipelineScore >= 3 ? "full" : "medium";
    return { intent: "pipeline", confidence: 0.85, reason: "Multi-stage or creates new functionality", pipelineMode: mode };
  }

  // Single pipeline signal + no direct signals
  if (pipelineScore === 1 && directScore === 0) {
    return { intent: "pipeline", confidence: 0.7, reason: "Contains architecture/security/new feature signal", pipelineMode: "quick" };
  }

  // Short input + direct signals + no pipeline
  if (wordCount <= 10 && directScore > 0 && pipelineScore === 0) {
    return { intent: "direct", confidence: 0.9, reason: "Short, simple modification" };
  }

  // Direct signals dominate
  if (directScore >= 2 && pipelineScore === 0) {
    return { intent: "direct", confidence: 0.85, reason: "Multiple direct edit signals" };
  }

  // Both present → hybrid
  if (directScore > 0 && pipelineScore > 0) {
    return { intent: "hybrid", confidence: 0.7, reason: "Mix of modification + new functionality" };
  }
  if (hybridScore > 0) {
    return { intent: "hybrid", confidence: 0.65, reason: "Multi-domain task" };
  }

  // Default: no pipeline signals = direct (regardless of length)
  if (pipelineScore === 0) {
    return { intent: "direct", confidence: 0.6, reason: "No pipeline signals, defaulting to direct" };
  }

  // Only default to pipeline if there are actual pipeline signals
  return { intent: "pipeline", confidence: 0.5, reason: "Has pipeline signals, defaulting to pipeline", pipelineMode: "medium" };
}
