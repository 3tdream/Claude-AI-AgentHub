/**
 * Stage Output Schema — JSON structure validation for pipeline stage outputs.
 * Validates that agents produce machine-parseable structured data alongside their text output.
 *
 * Complements the existing contract system (stage-contracts.ts) which validates
 * text patterns. This module focuses on extracting and validating JSON payloads.
 */

// ═══════════════════════════════════════════════════════════════
// SCHEMA DEFINITIONS — required JSON structure per stage
// ═══════════════════════════════════════════════════════════════

interface SchemaField {
  type: "string" | "number" | "boolean" | "array" | "object";
  required: boolean;
  /** For arrays: the shape of each element */
  items?: Record<string, SchemaField>;
  /** For objects: nested fields */
  fields?: Record<string, SchemaField>;
}

type StageSchema = Record<string, SchemaField>;

const STAGE_OUTPUT_SCHEMAS: Record<string, StageSchema> = {
  // S0: Research
  "s0-research": {
    personas: { type: "array", required: true, items: {} },
    competitive_matrix: { type: "array", required: true, items: {} },
    market_sizing: { type: "object", required: true, fields: {} },
    key_insights: { type: "array", required: true, items: {} },
  },

  // S2: PM — PRD
  "s2-pm": {
    overview: { type: "string", required: true },
    user_stories: {
      type: "array", required: true,
      items: {
        id: { type: "string", required: true },
        priority: { type: "string", required: true },
        description: { type: "string", required: true },
        acceptance_criteria: { type: "array", required: true, items: {} },
      },
    },
    scope: {
      type: "object", required: true,
      fields: {
        in: { type: "array", required: true, items: {} },
        out: { type: "array", required: true, items: {} },
        future: { type: "array", required: true, items: {} },
      },
    },
  },

  // S3.1: Architect — ADR
  "s3.1-adr": {
    adr: {
      type: "object", required: true,
      fields: {
        title: { type: "string", required: true },
        context: { type: "string", required: true },
        decision: { type: "string", required: true },
        consequences: { type: "string", required: true },
      },
    },
  },

  // S3.2: Architect — API Contracts
  "s3.2-api": {
    endpoints: {
      type: "array", required: true,
      items: {
        method: { type: "string", required: true },
        path: { type: "string", required: true },
        request: { type: "object", required: true, fields: {} },
        response: { type: "object", required: true, fields: {} },
      },
    },
  },

  // S3.3: Architect — ERD
  "s3.3-erd": {
    entities: {
      type: "array", required: true,
      items: {
        name: { type: "string", required: true },
        fields: { type: "array", required: true, items: {} },
        relations: { type: "array", required: true, items: {} },
      },
    },
  },

  // S3.4: Architect — File Plan
  "s3.4-fileplan": {
    file_plan: {
      type: "array", required: true,
      items: {
        path: { type: "string", required: true },
        action: { type: "string", required: true },
        agent: { type: "string", required: true },
        description: { type: "string", required: true },
      },
    },
  },

  // S5: Backend Implementation
  "s5-backend": {
    file_tree: { type: "array", required: true, items: {} },
    files: {
      type: "array", required: true,
      items: {
        path: { type: "string", required: true },
        action: { type: "string", required: true },
        content: { type: "string", required: true },
      },
    },
    env_vars: { type: "array", required: true, items: {} },
  },

  // S7: Frontend Implementation
  "s7-frontend": {
    file_tree: { type: "array", required: true, items: {} },
    files: {
      type: "array", required: true,
      items: {
        path: { type: "string", required: true },
        action: { type: "string", required: true },
        content: { type: "string", required: true },
      },
    },
    env_vars: { type: "array", required: true, items: {} },
  },

  // S8: Technical QA
  "s8-technical-qa": {
    technical_results: {
      type: "object", required: true,
      fields: {
        compilation: { type: "string", required: true },
        api_compliance: { type: "string", required: true },
        issues: { type: "array", required: true, items: {} },
        verdict: { type: "string", required: true },
      },
    },
  },

  // S9: Business QA
  "s9-business-qa": {
    acceptance_results: {
      type: "array", required: true,
      items: {
        criteria_id: { type: "string", required: true },
        status: { type: "string", required: true },
        evidence: { type: "string", required: true },
      },
    },
    verdict: { type: "string", required: true },
  },

  // Gate stages: S2.5, S4.5, S8.5, S11
  "s2.5-prd-gate": {
    verdict: { type: "string", required: true },
    reason: { type: "string", required: true },
    issues: { type: "array", required: false, items: {} },
  },
  "s4.5-arch-gate": {
    verdict: { type: "string", required: true },
    reason: { type: "string", required: true },
    issues: { type: "array", required: false, items: {} },
  },
  "s8.5-tech-review": {
    verdict: { type: "string", required: true },
    reason: { type: "string", required: true },
    issues: { type: "array", required: false, items: {} },
  },
  "s11-final-verdict": {
    verdict: { type: "string", required: true },
    reason: { type: "string", required: true },
    issues: { type: "array", required: false, items: {} },
  },
};

// ═══════════════════════════════════════════════════════════════
// JSON EXTRACTION — find JSON blocks in agent output
// ═══════════════════════════════════════════════════════════════

/**
 * Extract JSON from agent output text.
 * Tries multiple strategies:
 * 1. ```json fenced blocks
 * 2. Raw top-level JSON objects
 * 3. First { ... } block in text
 */
function extractJSON(output: string): { json: unknown; raw: string } | null {
  // Strategy 1: ```json fenced code blocks (pick the largest one)
  const fencedBlocks = [...output.matchAll(/```json\s*\n([\s\S]*?)```/g)];
  if (fencedBlocks.length > 0) {
    // Sort by length descending — largest block is most likely the structured output
    const sorted = fencedBlocks.sort((a, b) => b[1].length - a[1].length);
    for (const match of sorted) {
      const raw = match[1].trim();
      try {
        return { json: JSON.parse(raw), raw };
      } catch {
        // Try to fix common issues: trailing commas
        try {
          const fixed = raw.replace(/,\s*([}\]])/g, "$1");
          return { json: JSON.parse(fixed), raw };
        } catch {
          continue;
        }
      }
    }
  }

  // Strategy 2: raw JSON object at start of output (after trimming whitespace)
  const trimmed = output.trim();
  if (trimmed.startsWith("{")) {
    try {
      return { json: JSON.parse(trimmed), raw: trimmed };
    } catch {
      // Not valid JSON at top level
    }
  }

  // Strategy 3: find first substantial { ... } block (min 20 chars to skip inline objects)
  const braceMatch = output.match(/\{[\s\S]{20,}?\}/);
  if (braceMatch) {
    try {
      return { json: JSON.parse(braceMatch[0]), raw: braceMatch[0] };
    } catch {
      // Not valid JSON
    }
  }

  return null;
}

// ═══════════════════════════════════════════════════════════════
// SCHEMA VALIDATION
// ═══════════════════════════════════════════════════════════════

function validateField(
  value: unknown,
  schema: SchemaField,
  path: string,
  errors: string[],
): boolean {
  if (value === undefined || value === null) {
    if (schema.required) {
      errors.push(`Missing required field: ${path}`);
      return false;
    }
    return true;
  }

  // Type check
  switch (schema.type) {
    case "string":
      if (typeof value !== "string") {
        errors.push(`${path}: expected string, got ${typeof value}`);
        return false;
      }
      if (schema.required && (value as string).length === 0) {
        errors.push(`${path}: required string is empty`);
        return false;
      }
      break;

    case "number":
      if (typeof value !== "number") {
        errors.push(`${path}: expected number, got ${typeof value}`);
        return false;
      }
      break;

    case "boolean":
      if (typeof value !== "boolean") {
        errors.push(`${path}: expected boolean, got ${typeof value}`);
        return false;
      }
      break;

    case "array":
      if (!Array.isArray(value)) {
        errors.push(`${path}: expected array, got ${typeof value}`);
        return false;
      }
      if (schema.required && (value as unknown[]).length === 0) {
        errors.push(`${path}: required array is empty`);
        return false;
      }
      // Validate items shape (check first element if items schema has fields)
      if (schema.items && Object.keys(schema.items).length > 0 && (value as unknown[]).length > 0) {
        const firstItem = (value as unknown[])[0];
        if (typeof firstItem === "object" && firstItem !== null) {
          for (const [fieldName, fieldSchema] of Object.entries(schema.items)) {
            validateField(
              (firstItem as Record<string, unknown>)[fieldName],
              fieldSchema,
              `${path}[0].${fieldName}`,
              errors,
            );
          }
        }
      }
      break;

    case "object":
      if (typeof value !== "object" || Array.isArray(value)) {
        errors.push(`${path}: expected object, got ${Array.isArray(value) ? "array" : typeof value}`);
        return false;
      }
      // Validate nested fields
      if (schema.fields) {
        for (const [fieldName, fieldSchema] of Object.entries(schema.fields)) {
          validateField(
            (value as Record<string, unknown>)[fieldName],
            fieldSchema,
            `${path}.${fieldName}`,
            errors,
          );
        }
      }
      break;
  }

  return errors.length === 0;
}

function validateAgainstSchema(
  data: Record<string, unknown>,
  schema: StageSchema,
  errors: string[],
): void {
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    validateField(data[fieldName], fieldSchema, fieldName, errors);
  }
}

// Gate-specific: validate verdict is "PASS" or "FAIL"
function validateGateVerdict(data: Record<string, unknown>, errors: string[]): void {
  const verdict = data.verdict;
  if (typeof verdict === "string" && verdict !== "PASS" && verdict !== "FAIL") {
    errors.push(`verdict: must be "PASS" or "FAIL", got "${verdict}"`);
  }
}

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export interface StageOutputValidation {
  valid: boolean;
  parsed?: Record<string, unknown>;
  errors: string[];
}

/**
 * Validate structured JSON output from a pipeline stage.
 *
 * Extracts JSON from the agent's text output and validates it against
 * the schema defined for that stage. Returns parsed data on success.
 *
 * @param stageId - Pipeline stage ID (e.g. "s0-research", "s2-pm")
 * @param output  - Raw agent output text (may contain markdown, code blocks, etc.)
 */
export function validateStageOutputSchema(
  stageId: string,
  output: string,
): StageOutputValidation {
  const schema = STAGE_OUTPUT_SCHEMAS[stageId];
  if (!schema) {
    // No schema defined for this stage — pass through (not all stages need JSON)
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  // Extract JSON from output
  const extracted = extractJSON(output);
  if (!extracted) {
    errors.push("No JSON found in output (expected ```json block or raw JSON object)");
    return { valid: false, errors };
  }

  const data = extracted.json;
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    errors.push("Extracted JSON is not an object");
    return { valid: false, errors };
  }

  const parsed = data as Record<string, unknown>;

  // Validate against schema
  validateAgainstSchema(parsed, schema, errors);

  // Gate-specific verdict validation
  const gateStages = ["s2.5-prd-gate", "s4.5-arch-gate", "s8.5-tech-review", "s11-final-verdict"];
  if (gateStages.includes(stageId)) {
    validateGateVerdict(parsed, errors);
  }

  return {
    valid: errors.length === 0,
    parsed: errors.length === 0 ? parsed : parsed, // Return parsed even on partial failure for debugging
    errors,
  };
}

// ═══════════════════════════════════════════════════════════════
// CONTEXT INJECTION VALIDATION
// ═══════════════════════════════════════════════════════════════

export interface ContextInjectionValidation {
  valid: boolean;
  missing: string[];
}

/**
 * Validate that all required upstream outputs are present in context.
 *
 * Checks step.dependsOn — for each dependency, verifies that
 * context[`step_${dep}_output`] exists and is non-empty.
 *
 * @param step    - The workflow step about to execute
 * @param context - The accumulated context from previous steps
 */
export function validateContextInjection(
  step: { dependsOn: string[] },
  context: Record<string, string>,
): ContextInjectionValidation {
  const missing: string[] = [];

  for (const dep of step.dependsOn) {
    const key = `step_${dep}_output`;
    const value = context[key];
    if (!value || value.trim().length === 0) {
      missing.push(dep);
    }
  }

  return {
    valid: missing.length === 0,
    missing,
  };
}
