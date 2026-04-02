/**
 * Design-to-Code Validator
 *
 * Validates that frontend implementation complies with designer output.
 * Checks for:
 * - CSS custom property usage (vs hardcoded colors)
 * - Component name consistency
 * - Design token adherence (colors, typography, spacing)
 *
 * Pure function — no side effects.
 */

export interface DesignComplianceResult {
  /** Whether the frontend output meets the design spec threshold */
  compliant: boolean;
  /** List of specific violations found */
  violations: string[];
  /** Compliance score 0-100 */
  score: number;
}

interface DesignTokens {
  cssVariables: string[];
  componentNames: string[];
  colors: string[];
  typographyTokens: string[];
  spacingTokens: string[];
}

/**
 * Validate that frontend code complies with the designer's output.
 *
 * @param designerOutput - Raw text output from the designer agent (S6)
 * @param frontendOutput - Raw text output from the frontend agent (S7)
 * @returns Compliance result with score, violations, and pass/fail
 */
export function validateDesignCompliance(
  designerOutput: string,
  frontendOutput: string,
): DesignComplianceResult {
  const violations: string[] = [];

  if (!designerOutput || !frontendOutput) {
    return { compliant: true, violations: [], score: 100 };
  }

  const designTokens = parseDesignTokens(designerOutput);
  const checks = [
    checkCSSVariableUsage(designTokens, frontendOutput),
    checkComponentNames(designTokens, frontendOutput),
    checkHardcodedColors(frontendOutput),
    checkTypographyTokens(designTokens, frontendOutput),
    checkSpacingTokens(designTokens, frontendOutput),
  ];

  let totalWeight = 0;
  let weightedScore = 0;

  for (const check of checks) {
    violations.push(...check.violations);
    totalWeight += check.weight;
    weightedScore += check.score * check.weight;
  }

  const score = totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 100;
  const compliant = score >= 70;

  return { compliant, violations, score };
}

interface CheckResult {
  violations: string[];
  score: number;
  weight: number;
}

// ── Token Parsing ──

function parseDesignTokens(designerOutput: string): DesignTokens {
  return {
    cssVariables: extractCSSVariables(designerOutput),
    componentNames: extractComponentNames(designerOutput),
    colors: extractColorTokens(designerOutput),
    typographyTokens: extractTypographyTokens(designerOutput),
    spacingTokens: extractSpacingTokens(designerOutput),
  };
}

/** Extract CSS custom properties (--color-primary, --spacing-lg, --radius-md, etc.) */
function extractCSSVariables(text: string): string[] {
  const vars: string[] = [];
  const matches = text.matchAll(/--([\w-]+)/g);
  for (const m of matches) {
    vars.push(`--${m[1]}`);
  }
  return [...new Set(vars)];
}

/** Extract component names (PascalCase identifiers likely to be React components) */
function extractComponentNames(text: string): string[] {
  const names: string[] = [];
  // Match component definitions: export function/const ComponentName, <ComponentName
  const defMatches = text.matchAll(/(?:export\s+(?:function|const)\s+|<)([A-Z][A-Za-z0-9]+)/g);
  for (const m of defMatches) {
    const name = m[1];
    // Filter out common non-component PascalCase words
    if (!isCommonPascalCase(name)) {
      names.push(name);
    }
  }
  return [...new Set(names)];
}

/** Extract explicit color tokens from designer output */
function extractColorTokens(text: string): string[] {
  const tokens: string[] = [];
  // Match Tailwind color classes: text-primary, bg-secondary, border-accent, etc.
  const twMatches = text.matchAll(/(?:text|bg|border|ring|shadow|fill|stroke)-([a-z]+-\d{2,3}|[a-z]+)/g);
  for (const m of twMatches) {
    tokens.push(m[0]);
  }
  // Match CSS var references: var(--color-*)
  const varMatches = text.matchAll(/var\((--[\w-]+)\)/g);
  for (const m of varMatches) {
    tokens.push(m[1]);
  }
  return [...new Set(tokens)];
}

/** Extract typography tokens (text-sm, text-lg, font-bold, etc.) */
function extractTypographyTokens(text: string): string[] {
  const tokens: string[] = [];
  const matches = text.matchAll(/(?:text-(?:xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl)|font-(?:thin|light|normal|medium|semibold|bold|extrabold|black)|leading-(?:none|tight|snug|normal|relaxed|loose))/g);
  for (const m of matches) {
    tokens.push(m[0]);
  }
  return [...new Set(tokens)];
}

/** Extract spacing tokens (p-4, m-6, gap-2, space-y-4, etc.) */
function extractSpacingTokens(text: string): string[] {
  const tokens: string[] = [];
  const matches = text.matchAll(/(?:[pm][xytblr]?|gap|space-[xy])-(?:\d+(?:\.\d+)?|\[[\w.]+\])/g);
  for (const m of matches) {
    tokens.push(m[0]);
  }
  return [...new Set(tokens)];
}

// ── Compliance Checks ──

/** Check that designer's CSS variables are used in frontend code (not ignored) */
function checkCSSVariableUsage(tokens: DesignTokens, frontendOutput: string): CheckResult {
  const violations: string[] = [];
  if (tokens.cssVariables.length === 0) {
    return { violations: [], score: 100, weight: 3 };
  }

  let used = 0;
  for (const varName of tokens.cssVariables) {
    if (frontendOutput.includes(varName)) {
      used++;
    }
  }

  const usageRate = used / tokens.cssVariables.length;
  const missing = tokens.cssVariables.filter((v) => !frontendOutput.includes(v));

  if (missing.length > 0 && usageRate < 0.5) {
    violations.push(
      `CSS variables not used: ${missing.slice(0, 5).join(", ")}${missing.length > 5 ? ` (+${missing.length - 5} more)` : ""}. Frontend should use designer's custom properties instead of hardcoded values.`,
    );
  }

  return { violations, score: Math.round(usageRate * 100), weight: 3 };
}

/** Check that designer's component names appear in frontend code */
function checkComponentNames(tokens: DesignTokens, frontendOutput: string): CheckResult {
  const violations: string[] = [];
  if (tokens.componentNames.length === 0) {
    return { violations: [], score: 100, weight: 2 };
  }

  let found = 0;
  const missing: string[] = [];
  for (const name of tokens.componentNames) {
    if (frontendOutput.includes(name)) {
      found++;
    } else {
      missing.push(name);
    }
  }

  const rate = found / tokens.componentNames.length;
  if (missing.length > 0 && rate < 0.7) {
    violations.push(
      `Designer components not imported: ${missing.slice(0, 5).join(", ")}. Frontend may have created duplicate components instead of using designer's.`,
    );
  }

  return { violations, score: Math.round(rate * 100), weight: 2 };
}

/** Check for hardcoded colors that should use design tokens */
function checkHardcodedColors(frontendOutput: string): CheckResult {
  const violations: string[] = [];

  // Count hardcoded hex colors
  const hexColors = frontendOutput.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  // Count hardcoded rgb/rgba
  const rgbColors = frontendOutput.match(/rgba?\(\s*\d+/g) || [];
  // Count hardcoded hsl/hsla
  const hslColors = frontendOutput.match(/hsla?\(\s*\d+/g) || [];

  const totalHardcoded = hexColors.length + rgbColors.length + hslColors.length;

  // Allow a few hardcoded colors (e.g., #fff, #000 in comments)
  if (totalHardcoded > 5) {
    violations.push(
      `${totalHardcoded} hardcoded color values found (${hexColors.length} hex, ${rgbColors.length} rgb, ${hslColors.length} hsl). Use CSS variables or Tailwind color classes instead.`,
    );
  }

  // Score: 100 for 0-2 hardcoded, degrades linearly
  const score = Math.max(0, Math.round(100 - (Math.max(0, totalHardcoded - 2) * 10)));
  return { violations, score, weight: 3 };
}

/** Check that designer's typography tokens are used */
function checkTypographyTokens(tokens: DesignTokens, frontendOutput: string): CheckResult {
  const violations: string[] = [];
  if (tokens.typographyTokens.length === 0) {
    return { violations: [], score: 100, weight: 1 };
  }

  let used = 0;
  for (const token of tokens.typographyTokens) {
    if (frontendOutput.includes(token)) {
      used++;
    }
  }

  const rate = tokens.typographyTokens.length > 0 ? used / tokens.typographyTokens.length : 1;
  if (rate < 0.5 && tokens.typographyTokens.length > 2) {
    violations.push(
      `Typography tokens underused: only ${used}/${tokens.typographyTokens.length} designer-specified typography classes found in frontend code.`,
    );
  }

  return { violations, score: Math.round(rate * 100), weight: 1 };
}

/** Check that designer's spacing tokens are used */
function checkSpacingTokens(tokens: DesignTokens, frontendOutput: string): CheckResult {
  const violations: string[] = [];
  if (tokens.spacingTokens.length === 0) {
    return { violations: [], score: 100, weight: 1 };
  }

  let used = 0;
  for (const token of tokens.spacingTokens) {
    if (frontendOutput.includes(token)) {
      used++;
    }
  }

  const rate = tokens.spacingTokens.length > 0 ? used / tokens.spacingTokens.length : 1;
  if (rate < 0.4 && tokens.spacingTokens.length > 3) {
    violations.push(
      `Spacing tokens underused: only ${used}/${tokens.spacingTokens.length} designer-specified spacing classes found in frontend code.`,
    );
  }

  return { violations, score: Math.round(rate * 100), weight: 1 };
}

// ── Utility ──

function isCommonPascalCase(name: string): boolean {
  const common = new Set([
    "React", "Component", "Fragment", "Promise", "Array", "Object",
    "String", "Number", "Boolean", "Error", "Map", "Set", "Date",
    "JSON", "Math", "RegExp", "Function", "Symbol", "Proxy",
    "HTMLElement", "HTMLDivElement", "HTMLInputElement",
    "MouseEvent", "KeyboardEvent", "FormEvent", "ChangeEvent",
    "RefObject", "MutableRefObject", "Dispatch", "SetStateAction",
    "NextRequest", "NextResponse",
  ]);
  return common.has(name);
}
