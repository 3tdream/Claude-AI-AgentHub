import type { StageContract, ContractValidation, KBEntry } from "@/types";

// ═══════════════════════════════════════════════════════════════
// DYNAMIC CONTRACT ADAPTATION — KB failure patterns → constraints
// ═══════════════════════════════════════════════════════════════

/** Maps a KB failure-pattern entry to a dynamic constraint */
function kbEntryToConstraint(entry: KBEntry, idx: number): StageContract["constraints"][number] {
  // Extract a verification hint from tags
  const verificationHints: Record<string, string> = {
    truncation: "check output length and completeness",
    security: "grep for security anti-patterns",
    "guard-bypass": "verify guard implementation pattern",
    localStorage: "grep for localStorage.*token",
    "sql-injection": "check parameterized queries",
    compilation: "check import statements",
    css: "verify CSS file completeness",
    gdpr: "verify erasure script completeness",
  };

  const matchedTag = entry.tags.find((t) => verificationHints[t]);
  const verification = matchedTag ? verificationHints[matchedTag] : "manual review";

  return {
    id: `KB-${entry.id.slice(-3).toUpperCase()}-${idx}`,
    rule: `[FROM KB] ${entry.title}`,
    verification,
    severity: entry.severity === "critical" || entry.severity === "high" ? "blocking" : "warning",
  };
}

/** Maps a KB entry to a dynamic risk */
function kbEntryToRisk(entry: KBEntry, idx: number): StageContract["risks"][number] {
  return {
    id: `KBR-${idx}`,
    description: `[KB ${entry.id}] ${entry.title}`,
    probability: entry.severity === "critical" ? "high" : "medium",
    impact: entry.severity === "critical" ? "critical" : "high",
    mitigation: entry.content.match(/Fix:\s*(.+?)(?:\.|$)/i)?.[1] || "See KB entry for details",
  };
}

/**
 * Resolve which KB entries apply to a given stage.
 * Matches by: agentId, source stage ID, or tags containing the stage name.
 */
function matchKBEntriesToStage(entries: KBEntry[], contract: StageContract): KBEntry[] {
  const stageId = contract.stageId;
  const agentId = contract.agentId;

  return entries.filter((e) => {
    // Direct match: KB entry's source is this stage
    if (e.source === stageId) return true;
    // Agent match: KB entry was produced by or about this agent
    if (e.agentId === agentId) return true;
    // Tag match: entry tags contain the agent name (e.g., "backend", "frontend")
    const agentShort = agentId.replace("-agent", "");
    if (e.tags.some((t) => t === agentShort)) return true;
    return false;
  });
}

/**
 * Enrich a static contract with KB-derived dynamic constraints and risks.
 * Returns a new contract object (does not mutate the original).
 */
export function enrichContractWithKB(contract: StageContract, kbEntries: KBEntry[]): StageContract {
  const matched = matchKBEntriesToStage(kbEntries, contract);
  if (matched.length === 0) return contract;

  const dynamicConstraints = matched
    .filter((e) => e.severity === "critical" || e.severity === "high")
    .map((e, i) => kbEntryToConstraint(e, i));

  const dynamicRisks = matched.map((e, i) => kbEntryToRisk(e, i));

  return {
    ...contract,
    constraints: [...contract.constraints, ...dynamicConstraints],
    risks: [...contract.risks, ...dynamicRisks],
  };
}

/**
 * Fetch KB failure-patterns + security-playbook entries via API (client-side).
 * Returns empty array on failure (non-blocking).
 */
export async function fetchKBEntriesForContracts(projectId?: string | null): Promise<KBEntry[]> {
  try {
    const scope = projectId ? `&projectId=${encodeURIComponent(projectId)}&scope=project` : "";
    const [fpRes, spRes] = await Promise.all([
      fetch(`/api/knowledge-base?category=failure-patterns${scope}`),
      fetch(`/api/knowledge-base?category=security-playbook${scope}`),
    ]);
    const fpData = fpRes.ok ? await fpRes.json() : null;
    const spData = spRes.ok ? await spRes.json() : null;
    const entries: KBEntry[] = [];
    // Handle both response shapes: { data: { entries } } and { data: [] }
    if (fpData?.data?.entries) entries.push(...fpData.data.entries);
    else if (Array.isArray(fpData?.data)) entries.push(...fpData.data);
    if (spData?.data?.entries) entries.push(...spData.data.entries);
    else if (Array.isArray(spData?.data)) entries.push(...spData.data);
    return entries;
  } catch {
    return []; // KB unavailable — degrade gracefully
  }
}

/**
 * Get enriched contract for a stage — static + KB dynamic.
 * Async because it fetches KB entries.
 */
export async function getEnrichedContract(stageId: string): Promise<StageContract | null> {
  const contract = STAGE_CONTRACTS[stageId];
  if (!contract) return null;
  const kbEntries = await fetchKBEntriesForContracts();
  return enrichContractWithKB(contract, kbEntries);
}

// ═══════════════════════════════════════════════════════════════
// CONTRACT REGISTRY — deterministic I/O contracts per stage
// ═══════════════════════════════════════════════════════════════

export const STAGE_CONTRACTS: Record<string, StageContract> = {

  "s0-research": {
    stageId: "s0-research",
    stageName: "Research: Discovery & Competitive Audit",
    agentId: "research-agent",
    inputs: [
      { field: "input", fromStage: "user", required: true, description: "Feature description / project brief" },
    ],
    outputs: [
      { field: "personas", type: "array", required: true, description: "2-3 user personas with goals, pain points", pattern: "persona|goals|pain" },
      { field: "competitive_matrix", type: "object", required: true, description: "Table of competitors with strengths/weaknesses", pattern: "competitor|strength|weakness" },
      { field: "market_sizing", type: "object", required: true, description: "TAM/SAM/SOM estimates", pattern: "TAM|SAM|SOM" },
      { field: "key_insights", type: "array", required: true, description: "3-5 actionable insights", pattern: "insight" },
    ],
    assumptions: [
      { id: "A1", text: "Target market is beauty/salon industry", impactIfWrong: "All personas and competitors irrelevant", confidence: 0.95 },
    ],
    constraints: [
      { id: "C1", rule: "Output must contain all 4 sections: personas, competitive matrix, market sizing, key insights", verification: "regex match for section headers", severity: "blocking" },
      { id: "C2", rule: "Max 4000 words", verification: "word count", severity: "warning" },
    ],
    risks: [
      { id: "R1", description: "Cited statistics may not be verifiable", probability: "medium", impact: "low", mitigation: "Flag sources as needing primary verification" },
    ],
  },

  "s1-orchestrator": {
    stageId: "s1-orchestrator",
    stageName: "Orchestrator: Requirements Brief",
    agentId: "orchestrator",
    inputs: [
      { field: "input", fromStage: "user", required: true, description: "Feature description" },
      { field: "research", fromStage: "s0-research", required: true, description: "Research output" },
    ],
    outputs: [
      { field: "assumptions", type: "array", required: true, description: "Labeled assumptions with confidence levels", pattern: "assumption|confidence|impact" },
      { field: "critical_questions", type: "array", required: true, description: "5 critical questions with default answers", pattern: "question|default|risk" },
      { field: "orchestrator_notes", type: "object", required: true, description: "Notes table for downstream agents", pattern: "PM|Arch|UX|Legal" },
    ],
    assumptions: [],
    constraints: [
      { id: "C1", rule: "Must produce numbered assumptions with confidence levels", verification: "regex: A\\d+.*confidence", severity: "blocking" },
      { id: "C2", rule: "Must include critical questions with default answers and risk levels", verification: "regex: Q\\d+.*default.*risk", severity: "blocking" },
    ],
    risks: [
      { id: "R1", description: "Assumptions may be truncated mid-sentence", probability: "low", impact: "high", mitigation: "Truncation manifest" },
    ],
  },

  "s2-pm": {
    stageId: "s2-pm",
    stageName: "PM: PRD + Acceptance Criteria",
    agentId: "pm-agent",
    inputs: [
      { field: "input", fromStage: "user", required: true, description: "Feature description" },
      { field: "research", fromStage: "s0-research", required: true, description: "Research output" },
      { field: "requirements_brief", fromStage: "s1-orchestrator", required: true, description: "Orchestrator brief" },
    ],
    outputs: [
      { field: "user_stories", type: "array", required: true, description: "US-01..US-N user stories", pattern: "US-\\d+" },
      { field: "acceptance_criteria", type: "array", required: true, description: "AC-01..AC-N in GIVEN/WHEN/THEN format", pattern: "AC-\\d+.*GIVEN.*WHEN.*THEN" },
      { field: "scope", type: "object", required: true, description: "In scope / Out of scope / Deferred", pattern: "scope|deferred" },
      { field: "env_vars", type: "array", required: false, description: "Required environment variables", pattern: "env|variable" },
    ],
    assumptions: [],
    constraints: [
      { id: "C1", rule: "Every user story must have at least one acceptance criterion", verification: "count AC per US", severity: "blocking" },
      { id: "C2", rule: "Acceptance criteria must use GIVEN/WHEN/THEN format", verification: "regex match", severity: "blocking" },
      { id: "C3", rule: "Max 3000 words", verification: "word count", severity: "warning" },
    ],
    risks: [
      { id: "R1", description: "User stories truncated — incomplete AC list", probability: "medium", impact: "critical", mitigation: "PRD Gate (S2.5) catches gaps" },
    ],
  },

  "s3.2-api": {
    stageId: "s3.2-api",
    stageName: "Architect: API Contracts",
    agentId: "architect-agent",
    inputs: [
      { field: "adr", fromStage: "s3.1-adr", required: true, description: "Architecture Decision Record" },
      { field: "prd", fromStage: "s2-pm", required: true, description: "PRD with acceptance criteria" },
    ],
    outputs: [
      { field: "endpoint_index", type: "object", required: true, description: "Table of all endpoints: method, path, auth, domain", pattern: "\\|.*Method.*Path.*Auth" },
      { field: "endpoint_contracts", type: "array", required: true, description: "Full contract per endpoint: request/response shapes, errors, rate limits", pattern: "(GET|POST|PATCH|PUT|DELETE)\\s+/api/" },
      { field: "endpoint_count", type: "number", required: true, description: "Total number of endpoints defined", pattern: "\\d+" },
    ],
    assumptions: [
      { id: "A1", text: "API version prefix is /api/v1", impactIfWrong: "All endpoint paths wrong", confidence: 0.99 },
      { id: "A2", text: "Auth is JWT for external, HMAC for internal", impactIfWrong: "Auth strategy mismatch", confidence: 0.95 },
    ],
    constraints: [
      { id: "C1", rule: "Endpoint index table MUST be the first section", verification: "first markdown table contains Method|Path", severity: "blocking" },
      { id: "C2", rule: "Every PRD user story must map to at least one endpoint", verification: "cross-reference US-N to endpoints", severity: "blocking" },
      { id: "C3", rule: "Every endpoint must specify: method, path, request shape, response shape, errors, auth, rate limit", verification: "field presence check", severity: "blocking" },
      { id: "C4", rule: "Max 5000 words", verification: "word count", severity: "warning" },
    ],
    risks: [
      { id: "R1", description: "Truncation loses endpoint details after index survives", probability: "medium", impact: "medium", mitigation: "Index table survives; truncation warning lists remaining paths" },
      { id: "R2", description: "CRUD shorthand hides important non-standard behavior", probability: "low", impact: "medium", mitigation: "Shorthand only for truly standard CRUD" },
    ],
  },

  "s5-backend": {
    stageId: "s5-backend",
    stageName: "Backend: Implementation",
    agentId: "backend-agent",
    inputs: [
      { field: "adr", fromStage: "s3.1-adr", required: true, description: "ADR" },
      { field: "api_contracts", fromStage: "s3.2-api", required: true, description: "API contracts" },
      { field: "erd", fromStage: "s3.3-erd", required: true, description: "ERD" },
      { field: "file_plan", fromStage: "s3.4-fileplan", required: true, description: "File plan" },
      { field: "cyber_fixes", fromStage: "s4-cyber", required: true, description: "Security constraints" },
      { field: "prd", fromStage: "s2-pm", required: true, description: "PRD + AC" },
    ],
    outputs: [
      { field: "file_tree", type: "string", required: true, description: "Complete file tree of all output files", pattern: "├|└|project-root" },
      { field: "files_json", type: "json_block", required: true, description: "JSON block with {files: [{path, action, content}]}", pattern: '"files"\\s*:' },
      { field: "env_vars_json", type: "json_block", required: true, description: "JSON block with {required_env_vars: [...]}", pattern: '"required_env_vars"' },
      { field: "truncation_manifest", type: "string", required: false, description: "TRUNCATION_MANIFEST.md if output was cut short", pattern: "TRUNCATION_MANIFEST" },
    ],
    assumptions: [
      { id: "A1", text: "NestJS + PostgreSQL 15 + TypeScript stack", impactIfWrong: "All code wrong framework", confidence: 0.99 },
      { id: "A2", text: "Migrations run sequentially by number prefix", impactIfWrong: "DB state inconsistent", confidence: 0.95 },
    ],
    constraints: [
      { id: "C1", rule: "File tree MUST be Section 1 (output first)", verification: "file tree appears before first ```json block", severity: "blocking" },
      { id: "C2", rule: "Every file in tree MUST appear in files JSON", verification: "cross-reference tree paths to JSON paths", severity: "blocking" },
      { id: "C3", rule: "No file > 300 lines", verification: "line count per file content", severity: "warning" },
      { id: "C4", rule: "API paths MUST match S3.2 contracts exactly", verification: "diff endpoint paths", severity: "blocking" },
      { id: "C5", rule: "All cyber fixes from S4 MUST be applied", verification: "grep for fix patterns", severity: "blocking" },
      { id: "C6", rule: "No partial files — every file complete or in TRUNCATION_MANIFEST", verification: "no TODO/placeholder patterns", severity: "blocking" },
    ],
    risks: [
      { id: "R1", description: "Token limit truncation mid-file", probability: "high", impact: "critical", mitigation: "Chunking A/B/C + TRUNCATION_MANIFEST" },
      { id: "R2", description: "Import errors (esModuleInterop)", probability: "medium", impact: "high", mitigation: "KB failure-pattern kb-fp-003" },
      { id: "R3", description: "Roles guard bypass pattern", probability: "medium", impact: "critical", mitigation: "KB security-playbook kb-sp-003" },
    ],
  },

  "s6-designer": {
    stageId: "s6-designer",
    stageName: "Designer: Design System + Components",
    agentId: "designer-agent",
    inputs: [
      { field: "backend", fromStage: "s5-backend", required: true, description: "Backend implementation" },
      { field: "api_contracts", fromStage: "s3.2-api", required: true, description: "API contracts" },
      { field: "file_plan", fromStage: "s3.4-fileplan", required: true, description: "File plan" },
      { field: "prd", fromStage: "s2-pm", required: true, description: "PRD" },
    ],
    outputs: [
      { field: "file_tree", type: "string", required: true, description: "Component file tree", pattern: "├|└" },
      { field: "globals_css", type: "string", required: true, description: "Complete globals.css with design tokens", pattern: "--[a-z]" },
      { field: "component_files", type: "json_block", required: true, description: "TSX component files", pattern: '"files"\\s*:' },
    ],
    assumptions: [],
    constraints: [
      { id: "C1", rule: "globals.css MUST be complete (not truncated)", verification: "CSS parses without errors", severity: "blocking" },
      { id: "C2", rule: "Every component must be real .tsx code, not specs", verification: "contains 'export' and 'return'", severity: "blocking" },
      { id: "C3", rule: "Every component maps to an API endpoint via comment", verification: "grep for '// API:'", severity: "warning" },
    ],
    risks: [
      { id: "R1", description: "globals.css truncation breaks all rendering", probability: "medium", impact: "critical", mitigation: "globals.css in Chunk A (first priority)" },
    ],
  },

  "s7-frontend": {
    stageId: "s7-frontend",
    stageName: "Frontend: Pages + API Wiring",
    agentId: "frontend-agent",
    inputs: [
      { field: "design", fromStage: "s6-designer", required: true, description: "Design system + components" },
      { field: "backend", fromStage: "s5-backend", required: true, description: "Backend implementation" },
      { field: "api_contracts", fromStage: "s3.2-api", required: true, description: "API contracts" },
      { field: "file_plan", fromStage: "s3.4-fileplan", required: true, description: "File plan" },
    ],
    outputs: [
      { field: "file_tree", type: "string", required: true, description: "Frontend file tree", pattern: "├|└|app/" },
      { field: "api_client", type: "string", required: true, description: "Typed API client (lib/api.ts)", pattern: "fetch|api" },
      { field: "page_files", type: "json_block", required: true, description: "Page component files", pattern: '"files"\\s*:' },
    ],
    assumptions: [],
    constraints: [
      { id: "C1", rule: "API client must cover ALL endpoints from S3.2", verification: "endpoint count match", severity: "blocking" },
      { id: "C2", rule: "No localStorage for auth tokens", verification: "grep for localStorage.*token", severity: "blocking" },
      { id: "C3", rule: "Every page handles: loading, error, empty, populated states", verification: "grep for loading|error|empty patterns", severity: "warning" },
    ],
    risks: [
      { id: "R1", description: "Invents non-existent API endpoints", probability: "medium", impact: "high", mitigation: "Constraint C1 + cross-ref with S3.2 index" },
    ],
  },

  "s8-technical-qa": {
    stageId: "s8-technical-qa",
    stageName: "Technical QA: White Box Review",
    agentId: "qa-agent",
    inputs: [
      { field: "backend", fromStage: "s5-backend", required: true, description: "Backend code" },
      { field: "frontend", fromStage: "s7-frontend", required: true, description: "Frontend code" },
      { field: "design", fromStage: "s6-designer", required: true, description: "Design specs" },
      { field: "api_contracts", fromStage: "s3.2-api", required: true, description: "API contracts" },
    ],
    outputs: [
      { field: "compilation_check", type: "string", required: true, description: "PASS or FAIL with details", pattern: "PASS|FAIL" },
      { field: "api_compliance", type: "string", required: true, description: "API contract compliance check", pattern: "compliance|mismatch" },
      { field: "issues_list", type: "array", required: true, description: "Numbered issues with severity P0/P1/P2", pattern: "P[012]" },
      { field: "verdict", type: "string", required: true, description: "PASS or FAIL", pattern: "^(PASS|FAIL)$" },
    ],
    assumptions: [],
    constraints: [
      { id: "C1", rule: "Must produce structured JSON technical_results", verification: "JSON parse", severity: "blocking" },
      { id: "C2", rule: "Every issue must have: file path, description, severity (P0/P1/P2), fix_agent", verification: "field presence", severity: "blocking" },
      { id: "C3", rule: "Verdict must be PASS or FAIL — no hedging", verification: "exact match", severity: "blocking" },
    ],
    risks: [],
  },
};

// ═══════════════════════════════════════════════════════════════
// CONTRACT VALIDATOR — checks stage output against its contract
// ═══════════════════════════════════════════════════════════════

export function validateStageOutput(stageId: string, output: string, kbEntries?: KBEntry[]): ContractValidation {
  let contract = STAGE_CONTRACTS[stageId];
  if (!contract) {
    return {
      stageId,
      valid: false,
      outputsPresent: [],
      constraintsPassed: [],
      missingRequired: [],
      warnings: [`No contract defined for stage ${stageId}`],
      score: 0,
    };
  }

  // Dynamic KB enrichment
  if (kbEntries && kbEntries.length > 0) {
    contract = enrichContractWithKB(contract, kbEntries);
  }

  const missingRequired: string[] = [];
  const warnings: string[] = [];

  // Check outputs
  const outputsPresent = contract.outputs.map((o) => {
    const pattern = o.pattern ? new RegExp(o.pattern, "i") : null;
    const present = pattern ? pattern.test(output) : output.length > 0;
    const valid = present;
    if (o.required && !present) {
      missingRequired.push(o.field);
    }
    return { field: o.field, present, valid };
  });

  // Check constraints
  const constraintsPassed = contract.constraints.map((c) => {
    let passed = true;
    let reason: string | undefined;

    if (c.verification === "word count") {
      const wordCount = output.split(/\s+/).length;
      const maxMatch = c.rule.match(/Max (\d+) words/);
      if (maxMatch && wordCount > parseInt(maxMatch[1])) {
        passed = false;
        reason = `${wordCount} words exceeds limit of ${maxMatch[1]}`;
      }
    } else if (c.verification.startsWith("regex")) {
      const regexMatch = c.verification.match(/regex:?\s*(.+)/);
      if (regexMatch) {
        try {
          const re = new RegExp(regexMatch[1], "i");
          passed = re.test(output);
          if (!passed) reason = `Pattern not found: ${regexMatch[1]}`;
        } catch {
          passed = true; // Skip invalid regex
        }
      }
    } else if (c.verification.includes("grep for localStorage.*token")) {
      // Security: fail if localStorage is used for tokens
      passed = !/localStorage\s*\.\s*(set|get)Item\s*\(\s*['"].*token/i.test(output);
      if (!passed) reason = "localStorage used for auth tokens — security violation";
    } else if (c.verification.includes("no TODO/placeholder")) {
      const hasPlaceholder = /\/\/\s*\.{3}\s*rest|\/\/\s*TODO|\/\/\s*implement|similar to above/i.test(output);
      passed = !hasPlaceholder;
      if (!passed) reason = "Partial/placeholder code detected";
    }

    if (!passed && c.severity === "blocking") {
      missingRequired.push(`constraint:${c.id}`);
    } else if (!passed && c.severity === "warning") {
      warnings.push(`${c.id}: ${reason || c.rule}`);
    }

    return { id: c.id, passed, reason };
  });

  // Score: percentage of required outputs + constraints passed
  const totalChecks = outputsPresent.length + constraintsPassed.length;
  const passedChecks = outputsPresent.filter((o) => o.present).length + constraintsPassed.filter((c) => c.passed).length;
  const score = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  return {
    stageId,
    valid: missingRequired.length === 0,
    outputsPresent,
    constraintsPassed,
    missingRequired,
    warnings,
    score,
  };
}

// ═══════════════════════════════════════════════════════════════
// CONTRACT PROMPT INJECTION — appends contract block to agent prompt
// ═══════════════════════════════════════════════════════════════

export function getContractPromptBlock(stageId: string, kbEntries?: KBEntry[]): string {
  let contract = STAGE_CONTRACTS[stageId];
  if (!contract) return "";

  // Dynamic KB enrichment
  if (kbEntries && kbEntries.length > 0) {
    contract = enrichContractWithKB(contract, kbEntries);
  }

  const inputsList = contract.inputs
    .map((i) => `  - ${i.field} (from ${i.fromStage})${i.required ? " [REQUIRED]" : ""}: ${i.description}`)
    .join("\n");

  const outputsList = contract.outputs
    .map((o) => `  - ${o.field}: ${o.type}${o.required ? " [REQUIRED]" : ""} — ${o.description}`)
    .join("\n");

  const constraintsList = contract.constraints
    .map((c) => `  - ${c.id} [${c.severity.toUpperCase()}]: ${c.rule}`)
    .join("\n");

  const risksList = contract.risks
    .map((r) => `  - ${r.id}: ${r.description} (${r.probability}/${r.impact}) → ${r.mitigation}`)
    .join("\n");

  return `
═══ STAGE CONTRACT: ${contract.stageName} ═══

INPUTS RECEIVED:
${inputsList}

OUTPUTS REQUIRED (your output MUST contain these — validation is automated):
${outputsList}

CONSTRAINTS (violations = pipeline failure):
${constraintsList}

KNOWN RISKS:
${risksList || "  (none)"}

At the END of your output, append this metadata block:
\`\`\`json
{"_contract": {
  "stageId": "${stageId}",
  "outputs_produced": [${contract.outputs.filter(o => o.required).map(o => `"${o.field}"`).join(", ")}],
  "constraints_satisfied": [${contract.constraints.filter(c => c.severity === "blocking").map(c => `"${c.id}"`).join(", ")}],
  "risks_flagged": []
}}
\`\`\`
═══ END CONTRACT ═══`;
}
