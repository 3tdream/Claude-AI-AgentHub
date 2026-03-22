/**
 * Step-by-step pipeline tester with quality evaluation.
 * Usage: node scripts/test-step.mjs s0          (run + evaluate)
 *        node scripts/test-step.mjs s0 --eval    (evaluate existing output only)
 *        node scripts/test-step.mjs all           (run all steps sequentially)
 *        node scripts/test-step.mjs report        (show scores table for all saved outputs)
 *
 * Outputs saved to data/test-steps/s0-research.txt
 * Scores saved to data/test-steps/scores.json
 */

import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT_DIR = join(ROOT, "data", "test-steps");
mkdirSync(OUT_DIR, { recursive: true });

/** Max chars per dependency output injected into prompt (matches pipeline executor) */
const MAX_CONTEXT_CHARS = 8000;

// --- Load API key ---
function getKey() {
  const env = process.env.ANTHROPIC_API_KEY;
  if (env && !env.startsWith("your-")) return env;
  try {
    const keys = JSON.parse(readFileSync(join(ROOT, "data", "api-keys.json"), "utf-8"));
    return keys.ANTHROPIC_API_KEY || "";
  } catch { return ""; }
}

const apiKey = getKey();
if (!apiKey) { console.error("No ANTHROPIC_API_KEY found"); process.exit(1); }
const client = new Anthropic({ apiKey });

// --- Load previous step output (with truncation) ---
function loadStepOutput(stepId) {
  const path = join(OUT_DIR, `${stepId}.txt`);
  if (!existsSync(path)) {
    console.error(`Missing dependency: ${path}`);
    process.exit(1);
  }
  const full = readFileSync(path, "utf-8");
  if (full.length > MAX_CONTEXT_CHARS) {
    const half = Math.floor(MAX_CONTEXT_CHARS / 2);
    return full.slice(0, half) + "\n\n... [truncated " + (full.length - MAX_CONTEXT_CHARS) + " chars] ...\n\n" + full.slice(-half);
  }
  return full;
}

// --- Load full output (for evaluation, no truncation) ---
function loadFullOutput(stepId) {
  const path = join(OUT_DIR, `${stepId}.txt`);
  if (!existsSync(path)) return null;
  return readFileSync(path, "utf-8");
}

// --- Scores persistence ---
function loadScores() {
  const path = join(OUT_DIR, "scores.json");
  if (!existsSync(path)) return {};
  try { return JSON.parse(readFileSync(path, "utf-8")); } catch { return {}; }
}

function saveScore(stepId, score) {
  const scores = loadScores();
  scores[stepId] = { ...score, timestamp: new Date().toISOString() };
  writeFileSync(join(OUT_DIR, "scores.json"), JSON.stringify(scores, null, 2), "utf-8");
}

// --- Per-agent scoring weights (mirrors config.ts) ---
const SCORING_WEIGHTS = {
  "research-agent":   { task: 0.4, comp: 0.3, spec: 0.2, act: 0.1 },
  "orchestrator":     { task: 0.4, comp: 0.2, spec: 0.1, act: 0.3 },
  "pm-agent":         { task: 0.45, comp: 0.35, spec: 0.1, act: 0.1 },
  "architect-agent":  { task: 0.5, comp: 0.1, spec: 0.15, act: 0.25 },
  "cyber-agent":      { task: 0.6, comp: 0.2, spec: 0.1, act: 0.1 },
  "backend-agent":    { task: 0.7, comp: 0.1, spec: 0.1, act: 0.1 },
  "frontend-agent":   { task: 0.7, comp: 0.1, spec: 0.1, act: 0.1 },
  "designer-agent":   { task: 0.5, comp: 0.2, spec: 0.2, act: 0.1 },
  "qa-agent":         { task: 0.6, comp: 0.1, spec: 0.1, act: 0.2 },
  "devops-agent":     { task: 0.7, comp: 0.1, spec: 0.1, act: 0.1 },
  "_default":         { task: 0.4, comp: 0.4, spec: 0.1, act: 0.1 },
};

// --- Agent system prompts (minimal, role-only) ---
const SYSTEM_PROMPTS = {
  "research-agent": "You are Research-Agent — a senior Research Analyst. You conduct market analysis, competitor research, and technology evaluation. Respond in the same language as input.",
  "orchestrator": "You are the AI Orchestrator — CTO-level coordinator of a multi-agent team. You evaluate agent outputs, manage pipeline flow, and validate quality gates. Respond in the same language as input.",
  "pm-agent": "You are PM-Agent — a senior Product Manager. You define product requirements, user stories, and acceptance criteria. Respond in the same language as input.",
  "architect-agent": "You are Architect-Agent — a senior System Architect. You design architecture, API contracts, and data models. You do NOT write code. Respond in the same language as input.",
  "cyber-agent": "You are Cyber-Agent — a senior Cybersecurity Specialist. You perform threat modeling, vulnerability assessment, and security audits. Respond in the same language as input.",
  "backend-agent": "You are Backend-Agent — a senior Backend Developer. You implement API routes, database migrations, and business logic. Respond in the same language as input.",
  "designer-agent": "You are Designer-Agent — a senior Product Designer. You create design tokens, component specs, and CSS files. Respond in the same language as input.",
  "frontend-agent": "You are Frontend-Agent — a senior Frontend Developer. You implement page components, API integration, and state management. Respond in the same language as input.",
  "qa-agent": "You are QA-Agent — a senior QA Engineer. You validate implementations against acceptance criteria and find bugs. Respond in the same language as input.",
  "devops-agent": "You are DevOps-Agent — a senior DevOps Engineer. You create deployment configs, CI/CD pipelines, and infrastructure files. Respond in the same language as input.",
};

// --- Test input ---
const INPUT = "Add a client loyalty program with points system to Beauty CRM";

// --- Step definitions ---
const STEPS = {
  s0: {
    id: "s0-research",
    agent: "research-agent",
    prompt: `Conduct discovery research for: ${INPUT}

Your output MUST include these sections:

1. USER PERSONAS (2-3 personas)
   - Name, role, goals, pain points, tech comfort level

2. COMPETITIVE MATRIX
   | Competitor | Strengths | Weaknesses | Pricing | Key Differentiator |

3. MARKET SIZING
   - TAM, SAM, SOM estimates with reasoning

4. KEY INSIGHTS
   - 3-5 actionable insights that should drive product decisions

MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
  },

  s1: {
    id: "s1-orchestrator",
    agent: "orchestrator",
    deps: ["s0-research"],
    promptFn: () => `Based on research:
${loadStepOutput("s0-research")}

Original task: ${INPUT}

Analyze the task and research. Output a STRUCTURED REQUIREMENTS BRIEF in two sections.

SECTION 1 — ASSUMPTIONS
List 5-8 assumptions. For each:
- Statement of what you're assuming
- Confidence: HIGH / MEDIUM / LOW
- Impact if wrong: what breaks

SECTION 2 — CRITICAL QUESTIONS
Ask 3-5 questions that would significantly change scope or architecture.
Output as JSON array so downstream agents can parse risk zones:

\`\`\`json
{"questions": [
  {
    "id": "Q1",
    "question": "...",
    "default_answer": "what you'll assume if no response",
    "user_answer": null,
    "default_used": true,
    "assumption_level": "HIGH_RISK | MEDIUM_RISK | LOW_RISK",
    "impacts": ["architecture", "scope", "security", "ux"]
  }
]}
\`\`\`

Rules:
- HIGH_RISK: wrong default could cause rework of 3+ stages
- MEDIUM_RISK: wrong default affects 1-2 stages
- LOW_RISK: cosmetic or easily reversible
- Pipeline will proceed using defaults if user doesn't answer at checkpoint
- PM-Agent will flag all HIGH_RISK defaults prominently in the PRD`,
  },

  s2: {
    id: "s2-pm",
    agent: "pm-agent",
    deps: ["s0-research", "s1-orchestrator"],
    promptFn: () => `Create a Product Requirements Document based on:
Requirements & assumptions: ${loadStepOutput("s1-orchestrator")}
Research: ${loadStepOutput("s0-research")}

IMPORTANT: Check the requirements for a "questions" JSON block.
Any question where "default_used": true and "assumption_level": "HIGH_RISK"
must be flagged in the PRD with ⚠️ — these are unconfirmed assumptions
that could require rework if wrong.

Your PRD MUST include:

1. OVERVIEW — One paragraph summary of what we're building and why

2. RISK ASSUMPTIONS
   List any HIGH_RISK or MEDIUM_RISK defaults that were used.
   For each: what was assumed, what could go wrong, mitigation.

3. USER STORIES (5-10)
   Format: As a [persona], I want to [action], so that [outcome]
   Priority: P0 (must-have) / P1 (should-have) / P2 (nice-to-have)

3. ACCEPTANCE CRITERIA
   For each P0 and P1 user story, list testable acceptance criteria with IDs:
   - AC-1: GIVEN [context] WHEN [action] THEN [result] (P0)
   - AC-2: GIVEN [context] WHEN [action] THEN [result] (P0)
   IDs must be sequential (AC-1, AC-2, ...) — QA will reference them.

4. SCOPE BOUNDARIES
   - IN SCOPE: explicit list
   - OUT OF SCOPE: explicit list
   - DEFERRED: things we might add later

5. ENV VARIABLES NEEDED
\`\`\`json
{"env_vars": [
  {"name": "VAR_NAME", "description": "what it's for", "required": true, "example": "example_value"}
]}
\`\`\`

MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
  },
  "s2.5": {
    id: "s2.5-prd-gate",
    agent: "orchestrator",
    deps: ["s2-pm", "s0-research", "s1-orchestrator"],
    promptFn: () => `PRD VALIDATION GATE — Review the PM's PRD before sending to Architect.

PRD: ${loadStepOutput("s2-pm")}
Research: ${loadStepOutput("s0-research")}
Requirements: ${loadStepOutput("s1-orchestrator")}

Check:
1. Are ALL P0 user stories specific enough for an Architect to design APIs?
2. Do acceptance criteria (AC-1..AC-N) have concrete GIVEN/WHEN/THEN?
3. Are scope boundaries clear (IN/OUT)?
4. Are there any ambiguities that will cause Architect to guess?

Output:
GATE VERDICT: PASS | FAIL
REASON: [one paragraph — what's missing or why it's sufficient]
MISSING ITEMS: [list, if FAIL]

If FAIL: pipeline will return to PM for revision.
If PASS: Architect proceeds with confidence.`,
  },

  "s3.1": {
    id: "s3.1-adr",
    agent: "architect-agent",
    deps: ["s2-pm"],
    promptFn: () => `Based on the PRD below, write ONE Architecture Decision Record.

PRD:
${loadStepOutput("s2-pm")}

OUTPUT — ONE ADR only (max 300 words):

DECISION: [one sentence — what are we building and how]
CONTEXT: [why this decision matters, what constraints exist]
CHOSEN OPTION: [tech stack, architecture pattern, deployment model]
ALTERNATIVES CONSIDERED: [2-3 alternatives with why rejected]
RATIONALE: [why this option wins]
CONSEQUENCES: [trade-offs accepted]

Be specific: name exact technologies, frameworks, databases.
This ADR will be read by Backend, Frontend, Designer, DevOps, and Cyber agents.`,
  },

  "s3.2": {
    id: "s3.2-api",
    agent: "architect-agent",
    deps: ["s3.1-adr", "s2-pm"],
    promptFn: () => `Based on the ADR and PRD, define ALL API endpoints.

ADR: ${loadStepOutput("s3.1-adr")}
PRD: ${loadStepOutput("s2-pm")}

OUTPUT — COMPLETE API CONTRACT for every endpoint:

For EACH endpoint:
\`[METHOD] /api/path\`
Request: { field: type, field: type }
Response 200: { field: type, field: type }
Response errors: 400 (reason), 404 (reason)
Auth: required (JWT) | public
Rate limit: N/min
Notes: [pagination, filtering, sorting if applicable]

RULES:
- List EVERY endpoint the system needs — Backend will implement exactly these
- Designer will map each endpoint to a UI component
- Frontend will call exactly these paths with these shapes
- Missing an endpoint = broken feature downstream
- Do NOT write code. Only contracts.

MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
  },

  "s3.3": {
    id: "s3.3-erd",
    agent: "architect-agent",
    deps: ["s3.2-api", "s3.1-adr"],
    promptFn: () => `Based on the API contracts, define the data model as ERD.

API Contracts: ${loadStepOutput("s3.2-api")}
ADR: ${loadStepOutput("s3.1-adr")}

OUTPUT — ENTITY RELATIONSHIP DIAGRAM (plain text, NOT SQL):

For EACH entity:
\`EntityName\`
- field_name: type (constraints in plain English)
- field_name: type (unique, not null, default: value)
Relations:
- EntityA.field → EntityB.id (1:N, cascade delete)
- EntityC.field → EntityD.id (N:M via join table)

RULES:
- Use plain English for constraints — "unique", "not null", "max 255 chars"
- Do NOT write SQL, CREATE TABLE, or DDL
- Backend-Agent will convert this ERD into actual SQL migrations
- Include estimated row growth per month for each entity
- Include which indexes are needed and why

MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
  },

  "s3.4": {
    id: "s3.4-fileplan",
    agent: "architect-agent",
    deps: ["s3.1-adr", "s3.2-api", "s3.3-erd"],
    promptFn: () => `Based on ADR, API contracts, and data model — list all files to create or modify.

ADR: ${loadStepOutput("s3.1-adr")}
API Contracts: ${loadStepOutput("s3.2-api")}
Data Model: ${loadStepOutput("s3.3-erd")}

OUTPUT — COMPLETE FILE PLAN:

FILES_TO_CREATE:
- path/to/file.ts — purpose (one line)

FILES_TO_MODIFY:
- path/to/existing.ts — what changes (one line)

Group by agent responsibility:
### Backend-Agent files:
- migrations/001_create_xxx.sql — migration for EntityName
- app/api/v1/xxx/route.ts — POST /api/xxx endpoint
- types/xxx.ts — shared TypeScript types

### Frontend-Agent files:
- app/(shell)/xxx/page.tsx — page component
- components/xxx/yyy.tsx — component

### Designer-Agent files:
- globals.css additions — design tokens

### DevOps-Agent files:
- .env.example — env vars
- Dockerfile — container config

MAX 4000 words. If you reach 3600 words (90%), stop and finalize. One line per file.`,
  },

  s4: {
    id: "s4-cyber",
    agent: "cyber-agent",
    deps: ["s3.1-adr", "s3.2-api", "s3.3-erd", "s3.4-fileplan"],
    promptFn: () => `Security review based on architecture:
${loadStepOutput("s3.1-adr")}

API Contracts:
${loadStepOutput("s3.2-api")}

Data Model:
${loadStepOutput("s3.3-erd")}

File Plan:
${loadStepOutput("s3.4-fileplan")}

Your output MUST follow this EXACT format (no deviations):

RISK LEVEL: [Low/Medium/High/Critical]

Finding 1: [Title]
Risk: [One sentence]
Fix: [One sentence]

Finding 2: [Title]
Risk: [One sentence]
Fix: [One sentence]

That's it. MAX 2-3 findings. MAX 4000 words. If you reach 3600 words (90%), stop and finalize. If no security concerns: just write 'RISK LEVEL: Low' and stop.`,
  },

  "s4.5": {
    id: "s4.5-arch-gate",
    agent: "orchestrator",
    deps: ["s2-pm", "s3.1-adr", "s3.2-api", "s3.3-erd", "s3.4-fileplan", "s4-cyber"],
    promptFn: () => `ARCHITECTURE GATE — Verify Architecture matches PRD before implementation.

PRD: ${loadStepOutput("s2-pm")}
ADR: ${loadStepOutput("s3.1-adr")}
API Contracts: ${loadStepOutput("s3.2-api")}
ERD: ${loadStepOutput("s3.3-erd")}
File Plan: ${loadStepOutput("s3.4-fileplan")}
Cyber Findings: ${loadStepOutput("s4-cyber")}

Check:
1. Does every P0 user story from PRD have corresponding API endpoints?
2. Does the data model support all acceptance criteria?
3. Are Cyber findings addressed in the architecture?
4. Is the file plan complete — all files needed for Backend, Designer, Frontend?

Output:
GATE VERDICT: PASS | FAIL
COVERAGE: [X of Y user stories covered by API contracts]
GAPS: [list any PRD requirements not reflected in architecture]
CYBER STATUS: [all findings addressed | N unresolved]

If FAIL: pipeline should return to Architect (S3.1) for redesign.
If PASS: implementation begins.`,
  },

  s5: {
    id: "s5-backend",
    agent: "backend-agent",
    deps: ["s3.1-adr", "s3.2-api", "s3.3-erd", "s3.4-fileplan", "s4-cyber", "s2-pm"],
    maxTokens: 65536,
    promptFn: () => `Create backend implementation based on:
Architecture & API contracts: ${loadStepOutput("s3.1-adr")}

API Contracts:
${loadStepOutput("s3.2-api")}

Data Model:
${loadStepOutput("s3.3-erd")}

File Plan:
${loadStepOutput("s3.4-fileplan")}
Security constraints: ${loadStepOutput("s4-cyber")}
PRD & acceptance criteria: ${loadStepOutput("s2-pm")}

CRITICAL: You MUST implement EXACTLY the API endpoints defined in the Architecture's API CONTRACTS section.
- Same paths, same methods, same request/response shapes — no deviations
- Designer and Frontend will use your output — any mismatch breaks their work

YOUR RESPONSIBILITIES (Architect does not write code — you do):

1. DATABASE: Convert Architect's DATA MODEL (ERD) into actual SQL migrations
   - CREATE TABLE statements with proper types, constraints, indexes

2. API ROUTES: For each endpoint from the contract:
   - Create the route handler with input validation
   - Implement business logic to satisfy the PRD acceptance criteria
   - Return the EXACT response shape from the contract

3. SHARED TYPES: TypeScript interfaces matching the DATA MODEL entities

4. UTILITIES: Helper functions for common patterns (auth, validation, etc.)

At the END of your output, include a structured env vars block:
\`\`\`json
{"required_env_vars": [
  {"name": "DATABASE_URL", "description": "PostgreSQL connection string", "example": "postgresql://user:pass@localhost:5432/db", "required": true}
]}
\`\`\`

FILE OUTPUT FORMAT (STRICT):
Your code output MUST be a single \`\`\`json fenced block with a "files" key:

\`\`\`json
{"files": [
  {"path": "relative/path/to/file.ts", "action": "create", "content": "full file content here"}
]}
\`\`\``,
  },

  s6: {
    id: "s6-designer",
    agent: "designer-agent",
    deps: ["s5-backend", "s3.1-adr", "s3.2-api", "s3.4-fileplan", "s2-pm"],
    maxTokens: 65536,
    promptFn: () => `Create UI/UX design system and component specs based on:
Backend implementation: ${loadStepOutput("s5-backend")}
Architecture: ${loadStepOutput("s3.1-adr")}
API Contracts: ${loadStepOutput("s3.2-api")}
File Plan: ${loadStepOutput("s3.4-fileplan")}
PRD & user stories: ${loadStepOutput("s2-pm")}

Your output MUST include:

1. DESIGN TOKENS (as CSS variables)
2. PAGE LAYOUTS — For each page/view in the PRD
3. COMPONENT SPECS — For each UI component: Props, States, Accessibility
4. DATA MAPPING — Map each API endpoint to the UI component that consumes it

FILE OUTPUT FORMAT (STRICT):
Your code output MUST be a single \`\`\`json fenced block with a "files" key:
\`\`\`json
{"files": [
  {"path": "relative/path/to/file.ts", "action": "create", "content": "full file content here"}
]}
\`\`\`

Generate: globals.css (design tokens), Component files (.tsx)`,
  },

  s7: {
    id: "s7-frontend",
    agent: "frontend-agent",
    deps: ["s6-designer", "s5-backend", "s3.1-adr", "s3.2-api", "s3.3-erd", "s3.4-fileplan"],
    maxTokens: 65536,
    promptFn: () => `Create frontend implementation based on:
Design system & component specs: ${loadStepOutput("s6-designer")}
Backend API implementation: ${loadStepOutput("s5-backend")}
Architecture: ${loadStepOutput("s3.1-adr")}
API Contracts: ${loadStepOutput("s3.2-api")}
Data Model: ${loadStepOutput("s3.3-erd")}
File Plan: ${loadStepOutput("s3.4-fileplan")}

IMPORTANT:
- API endpoints: use paths and shapes from API Contracts (S3.2) as source of truth
- Types: import TypeScript types from Backend's shared type definitions
- Design: use tokens and component specs from Designer output
- States: implement loading, error, empty, success for every component
- Do NOT invent endpoints — if it's not in S3.2 API contracts, don't call it

FILE OUTPUT FORMAT (STRICT):
Your code output MUST be a single \`\`\`json fenced block with a "files" key:
\`\`\`json
{"files": [
  {"path": "relative/path/to/file.ts", "action": "create", "content": "full file content here"}
]}
\`\`\``,
  },

  s8: {
    id: "s8-technical-qa",
    agent: "qa-agent",
    deps: ["s5-backend", "s7-frontend", "s6-designer", "s3.2-api"],
    promptFn: () => `TECHNICAL QA — verify code quality and correctness.

Backend implementation: ${loadStepOutput("s5-backend")}
Frontend implementation: ${loadStepOutput("s7-frontend")}
Design specs: ${loadStepOutput("s6-designer")}
API Contracts: ${loadStepOutput("s3.2-api")}

You are a WHITE BOX tester. Check the CODE, not the business logic.

STEP 1 — COMPILATION CHECK
STEP 2 — API CONTRACT COMPLIANCE
STEP 3 — DATA MODEL COMPLIANCE
STEP 4 — CODE QUALITY

Output:
\`\`\`json
{"technical_results": {
  "compilation": "PASS | FAIL",
  "api_compliance": "PASS | FAIL",
  "data_compliance": "PASS | FAIL",
  "issues": [
    {"type": "...", "file": "path", "description": "...", "severity": "P0 | P1 | P2", "fix_agent": "backend-agent | frontend-agent"}
  ],
  "verdict": "PASS | FAIL"
}}
\`\`\`

VERDICT: FAIL if any compilation error or P0 issue. MAX 4000 words.`,
  },

  "s8.5": {
    id: "s8.5-tech-review",
    agent: "orchestrator",
    deps: ["s8-technical-qa", "s5-backend", "s7-frontend"],
    promptFn: () => `TECHNICAL REVIEW GATE — Review Technical QA results before business validation.

Technical QA Results: ${loadStepOutput("s8-technical-qa")}
Backend: ${loadStepOutput("s5-backend")}
Frontend: ${loadStepOutput("s7-frontend")}

Check:
1. Are there any P0 technical issues?
2. Do all API endpoints match the contracts from S3.2?
3. Are there critical missing files from the file plan?

Output:
GATE VERDICT: PASS | FAIL
P0 ISSUES: [count]
ACTION: [continue to Business QA | return to Backend/Frontend for fixes]`,
  },

  s9: {
    id: "s9-business-qa",
    agent: "qa-agent",
    deps: ["s2-pm", "s8-technical-qa", "s5-backend", "s7-frontend"],
    promptFn: () => `BUSINESS QA — validate against PRD acceptance criteria.

PRD with acceptance criteria: ${loadStepOutput("s2-pm")}
Technical QA results: ${loadStepOutput("s8-technical-qa")}
Backend: ${loadStepOutput("s5-backend")}
Frontend: ${loadStepOutput("s7-frontend")}

You are a BLACK BOX tester. Check BUSINESS LOGIC, not code quality.

For EACH acceptance criterion from the PRD:
\`\`\`json
{"acceptance_results": [
  {"criteria_id": "AC-1", "status": "PASS | FAIL | PARTIAL", "evidence": "...", "severity": "P0 | P1 | P2"}
],
"summary": {"total": 0, "pass": 0, "fail": 0, "p0_failures": 0},
"verdict": "PASS | FAIL"}
\`\`\`

MAX 4000 words.`,
  },

  s10: {
    id: "s10-cyber-audit",
    agent: "cyber-agent",
    deps: ["s5-backend", "s7-frontend", "s8-technical-qa", "s9-business-qa"],
    promptFn: () => `Deep security audit based on:
Backend implementation: ${loadStepOutput("s5-backend")}
Frontend implementation: ${loadStepOutput("s7-frontend")}
Technical QA: ${loadStepOutput("s8-technical-qa")}
Business QA: ${loadStepOutput("s9-business-qa")}

Review actual code for OWASP Top 10.
For each finding:
SEVERITY: Critical/High/Medium/Low
FILE: exact file path
VULNERABILITY: one sentence
FIX: concrete code change

MAX 4000 words. Only report real issues found in the code.`,
  },

  s11: {
    id: "s11-final-verdict",
    agent: "orchestrator",
    deps: ["s8-technical-qa", "s9-business-qa", "s10-cyber-audit", "s2-pm"],
    promptFn: () => `FINAL VERDICT — Is this product ready for release?

Technical QA: ${loadStepOutput("s8-technical-qa")}
Business QA: ${loadStepOutput("s9-business-qa")}
Security Audit: ${loadStepOutput("s10-cyber-audit")}
PRD: ${loadStepOutput("s2-pm")}

Review ALL quality gates:
1. Technical QA verdict: PASS/FAIL?
2. Business QA verdict: PASS/FAIL? How many AC passed?
3. Security Audit: any Critical/High unresolved?
4. Overall: does the product satisfy the original task?

Output:
FINAL VERDICT: RELEASE | REVISE | SCRAP
REASON: [one paragraph]
UNRESOLVED: [list of open issues, if any]
RECOMMENDATION: [what to do next]`,
  },

  "s12a": {
    id: "s12a-devops",
    agent: "devops-agent",
    deps: ["s3.1-adr", "s3.2-api", "s3.3-erd", "s3.4-fileplan", "s5-backend", "s7-frontend", "s10-cyber-audit"],
    maxTokens: 128000,
    promptFn: () => `Create infrastructure, CI/CD, and deployment configuration based on:
Architecture: ${loadStepOutput("s3.1-adr")}
API Contracts: ${loadStepOutput("s3.2-api")}
Data Model: ${loadStepOutput("s3.3-erd")}
File Plan: ${loadStepOutput("s3.4-fileplan")}
Backend: ${loadStepOutput("s5-backend")}
Frontend: ${loadStepOutput("s7-frontend")}
Security audit: ${loadStepOutput("s10-cyber-audit")}

Your output MUST include:
1. ENVIRONMENT VARIABLES
2. CI/CD PIPELINE
3. DEPLOYMENT CONFIG
4. ROLLBACK PLAN

FILE OUTPUT FORMAT (STRICT):
Your code output MUST be a single \`\`\`json fenced block with a "files" key:
\`\`\`json
{"files": [
  {"path": "relative/path/to/file.ts", "action": "create", "content": "full file content here"}
]}
\`\`\`

Generate: Dockerfile, .env.example, CI config`,
  },

  "s12b": {
    id: "s12b-consolidation",
    agent: "orchestrator",
    deps: ["s0-research", "s2-pm", "s3.1-adr", "s3.2-api", "s3.3-erd", "s3.4-fileplan", "s5-backend", "s6-designer", "s7-frontend", "s8-technical-qa", "s9-business-qa", "s10-cyber-audit", "s12a-devops"],
    promptFn: () => `Final consolidation and delivery report.

All outputs:
- Research: ${loadStepOutput("s0-research")}
- PRD: ${loadStepOutput("s2-pm")}
- Architecture: ${loadStepOutput("s3.1-adr")}
- API Contracts: ${loadStepOutput("s3.2-api")}
- Data Model: ${loadStepOutput("s3.3-erd")}
- File Plan: ${loadStepOutput("s3.4-fileplan")}
- Design: ${loadStepOutput("s6-designer")}
- Backend: ${loadStepOutput("s5-backend")}
- Frontend: ${loadStepOutput("s7-frontend")}
- Technical QA: ${loadStepOutput("s8-technical-qa")}
- Business QA: ${loadStepOutput("s9-business-qa")}
- Security Audit: ${loadStepOutput("s10-cyber-audit")}
- DevOps: ${loadStepOutput("s12a-devops")}

Create a DELIVERY SUMMARY:
1. WHAT WAS BUILT — 2-3 sentences
2. FILES CREATED — list all file paths
3. OPEN ISSUES — any FAIL items from QA or Critical/High from Cyber audit
4. DEPLOYMENT CHECKLIST
5. NEXT STEPS — what should happen after deployment

MAX 4000 words.`,
  },
};

// --- Evaluation prompt (mirrors quality-evaluator.ts) ---
const EVAL_PROMPT = `You are the Orchestrator quality evaluator. Evaluate the following agent output.

AGENT: {{agentName}} (Stage {{stageNumber}})
TASK CONTEXT: {{taskInput}}
AGENT OUTPUT:
---
{{agentOutput}}
---

Score this output on FOUR axes (1-10 each). Use ROLE-AWARE criteria:

**COMPLETENESS** — Covers 100% of requirements?
**SPECIFICITY** — Concrete names, values, paths?
**ACTIONABILITY** — Next agent can work immediately?
**TASK COMPLETION** — Did agent deliver what their ROLE requires?
  Research: insights + sources → 10
  PM: PRD + acceptance criteria (AC-1..AC-N) → 10
  Architect (Stage 3.1): ADR only → 10
  Architect (Stage 3.2): API contracts only → 10
  Architect (Stage 3.3): Data model ERD only → 10
  Architect (Stage 3.4): File plan only → 10
  Backend: {"files": [...]} with SQL + routes → 10
  Frontend: {"files": [...]} with pages → 10
  Designer: {"files": [...]} with CSS + components → 10
  DevOps: {"files": [...]} with Dockerfile + CI → 10
  QA: structured results with VERDICT → 10
  Cyber: vulnerability summary + fix → 10
  Orchestrator Gate: VERDICT + reasoning → 10
  If output truncated mid-sentence → max 4
  If described but didn't deliver → max 5

You MUST respond in EXACTLY this format (one line each, no extra text):
[SCORE] completeness: X.X, specificity: X.X, actionability: X.X, taskCompletion: X.X → PASS/FAIL
[FEEDBACK] Your specific feedback here

Rules:
- 7.5+ overall = PASS
- Be strict but fair.`;

async function evaluateOutput(step, content) {
  const prompt = EVAL_PROMPT
    .replace("{{agentName}}", step.agent)
    .replace("{{stageNumber}}", step.id.replace(/^s/, ""))
    .replace("{{taskInput}}", INPUT.slice(0, 500))
    .replace("{{agentOutput}}", content.length <= 12000
      ? content
      : content.slice(0, 6000) + "\n\n... [" + (content.length - 12000) + " chars omitted] ...\n\n" + content.slice(-6000));

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0,
      system: "You are a strict quality evaluator. Output ONLY the requested format.",
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content.filter(b => b.type === "text").map(b => b.text).join("\n");

    // Parse scores
    const scoreMatch = text.match(
      /\[SCORE\]\s*completeness:\s*([\d.]+),?\s*specificity:\s*([\d.]+),?\s*actionability:\s*([\d.]+),?\s*taskCompletion:\s*([\d.]+)\s*→?\s*(PASS|FAIL)/i
    );
    const feedbackMatch = text.match(/\[FEEDBACK\]\s*(.*)/i);

    if (scoreMatch) {
      const comp = parseFloat(scoreMatch[1]);
      const spec = parseFloat(scoreMatch[2]);
      const act = parseFloat(scoreMatch[3]);
      const task = parseFloat(scoreMatch[4]);
      const w = SCORING_WEIGHTS[step.agent] || SCORING_WEIGHTS["_default"];
      const overall = Math.round((task * w.task + comp * w.comp + spec * w.spec + act * w.act) * 10) / 10;
      const passed = overall >= 7.5;

      return {
        completeness: comp,
        specificity: spec,
        actionability: act,
        taskCompletion: task,
        overall,
        passed,
        feedback: feedbackMatch?.[1] || "",
      };
    }

    return { completeness: 0, specificity: 0, actionability: 0, taskCompletion: 0, overall: 0, passed: false, feedback: "Failed to parse: " + text.slice(0, 200) };
  } catch (err) {
    return { completeness: 0, specificity: 0, actionability: 0, taskCompletion: 0, overall: 0, passed: false, feedback: "Eval error: " + err.message };
  }
}

// --- Run step ---
async function runStep(stepKey, evalOnly = false) {
  const step = STEPS[stepKey];
  if (!step) {
    console.error(`Unknown step: ${stepKey}. Available: ${Object.keys(STEPS).join(", ")}`);
    process.exit(1);
  }

  let content;
  let words, duration, inputTokens, outputTokens, stopReason;

  if (evalOnly) {
    content = loadFullOutput(step.id);
    if (!content) {
      console.error(`No saved output for ${step.id}. Run the step first.`);
      process.exit(1);
    }
    words = content.split(/\s+/).length;
    console.log(`\n=== Evaluating ${step.id} (${step.agent}) — ${words} words ===\n`);
  } else {
    console.log(`\n=== Testing ${step.id} (${step.agent}) ===\n`);

    const prompt = step.promptFn ? step.promptFn() : step.prompt;
    const systemPrompt = SYSTEM_PROMPTS[step.agent];

    console.log(`User prompt length: ${prompt.length} chars`);
    console.log(`Calling claude-sonnet-4-6...\n`);

    const start = Date.now();
    const maxTokens = step.maxTokens || 16384;
    content = "";

    const stream = client.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: maxTokens,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    stream.on("text", (text) => {
      content += text;
      process.stdout.write(".");
    });

    const finalMessage = await stream.finalMessage();
    inputTokens = finalMessage.usage.input_tokens;
    outputTokens = finalMessage.usage.output_tokens;
    stopReason = finalMessage.stop_reason;

    duration = ((Date.now() - start) / 1000).toFixed(1);
    words = content.split(/\s+/).length;

    console.log(`\nDone in ${duration}s | Tokens: ${inputTokens} in / ${outputTokens} out | Words: ${words} | Stop: ${stopReason}`);

    // Save output
    const outPath = join(OUT_DIR, `${step.id}.txt`);
    writeFileSync(outPath, content, "utf-8");
    console.log(`Saved to: ${outPath}`);
  }

  // Evaluate
  console.log(`\nEvaluating quality...`);
  const score = await evaluateOutput(step, content);
  saveScore(step.id, { ...score, words, stopReason: stopReason || "cached" });

  const icon = score.passed ? "PASS" : "FAIL";
  console.log(`\n${icon} | Comp: ${score.completeness} | Spec: ${score.specificity} | Act: ${score.actionability} | Task: ${score.taskCompletion} | Overall: ${score.overall}`);
  if (score.feedback) console.log(`Feedback: ${score.feedback}`);

  return score;
}

// --- Report: print table of all scores ---
function printReport() {
  const scores = loadScores();
  const ORDER = ["s0-research","s1-orchestrator","s2-pm","s2.5-prd-gate",
    "s3.1-adr","s3.2-api","s3.3-erd","s3.4-fileplan","s4-cyber","s4.5-arch-gate",
    "s5-backend","s6-designer","s7-frontend","s8-technical-qa","s8.5-tech-review",
    "s9-business-qa","s10-cyber-audit","s11-final-verdict","s12a-devops","s12b-consolidation"];

  console.log("\n╔════════════════════════╦══════╦══════╦══════╦══════╦═════════╦════════╦═══════╗");
  console.log("║ Step                   ║ Comp ║ Spec ║ Act  ║ Task ║ Overall ║ Status ║ Words ║");
  console.log("╠════════════════════════╬══════╬══════╬══════╬══════╬═════════╬════════╬═══════╣");

  let totalOverall = 0;
  let count = 0;

  for (const id of ORDER) {
    const s = scores[id];
    if (!s) {
      console.log(`║ ${id.padEnd(22)} ║  --  ║  --  ║  --  ║  --  ║   --    ║   --   ║  --   ║`);
      continue;
    }
    const status = s.passed ? " PASS " : " FAIL ";
    const w = String(s.words || "?").padStart(5);
    console.log(`║ ${id.padEnd(22)} ║ ${String(s.completeness).padStart(4)} ║ ${String(s.specificity).padStart(4)} ║ ${String(s.actionability).padStart(4)} ║ ${String(s.taskCompletion).padStart(4)} ║  ${String(s.overall).padStart(5)}  ║${status}║${w}  ║`);
    totalOverall += s.overall;
    count++;
  }

  console.log("╠════════════════════════╬══════╬══════╬══════╬══════╬═════════╬════════╬═══════╣");
  const avg = count > 0 ? (totalOverall / count).toFixed(1) : "--";
  console.log(`║ AVERAGE (${count} steps)`.padEnd(25) + `║      ║      ║      ║      ║  ${String(avg).padStart(5)}  ║        ║       ║`);
  console.log("╚════════════════════════╩══════╩══════╩══════╩══════╩═════════╩════════╩═══════╝");
}

// --- Main ---
const stepKey = process.argv[2];
const evalOnly = process.argv.includes("--eval");

if (!stepKey) {
  console.log("Usage:");
  console.log("  node scripts/test-step.mjs <step>         Run + evaluate");
  console.log("  node scripts/test-step.mjs <step> --eval  Evaluate existing output only");
  console.log("  node scripts/test-step.mjs all            Run all steps sequentially");
  console.log("  node scripts/test-step.mjs report         Show scores table");
  console.log(`  Steps: ${Object.keys(STEPS).join(", ")}`);
  process.exit(0);
}

if (stepKey === "report") {
  printReport();
  process.exit(0);
}

if (stepKey === "all") {
  const ORDER = ["s0","s1","s2","s2.5","s3.1","s3.2","s3.3","s3.4","s4","s4.5","s5","s6","s7","s8","s8.5","s9","s10","s11","s12a","s12b"];
  for (const key of ORDER) {
    try { await runStep(key, false); } catch (err) { console.error(`${key} failed:`, err.message); }
  }
  printReport();
  process.exit(0);
}

runStep(stepKey, evalOnly).catch(err => {
  console.error("Error:", err.message);
  process.exit(1);
});
