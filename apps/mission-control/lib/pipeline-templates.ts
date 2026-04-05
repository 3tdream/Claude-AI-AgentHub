import type { WorkflowStep } from "@/types";

const FILE_OUTPUT_INSTRUCTIONS = `

FILE OUTPUT FORMAT (STRICT):
Your code output MUST be a single \`\`\`json fenced block with a "files" key:

\`\`\`json
{"files": [
  {"path": "relative/path/to/file.ts", "action": "create", "content": "full file content here"},
  {"path": "relative/path/to/existing.ts", "action": "modify", "content": "full file content here"}
]}
\`\`\`

Rules:
- "path": relative from project root (e.g. "app/api/users/route.ts")
- "action": "create" for new files, "modify" for existing
- "content": the COMPLETE file content — not a diff, not a snippet
- The \`\`\`json block must contain ONLY the {"files": [...]} object
- If you have other structured data (env vars, etc.), put it in a SEPARATE \`\`\`json block
- No commentary, explanations, or markdown outside the json blocks
- The parser extracts ONLY the block containing "files" — everything else is ignored`;

export const CRM_PIPELINE_STAGES: WorkflowStep[] = [
  // ═══════════════════════════════════════════════════════════════
  // S0 — Research: Discovery & competitive audit
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s0-research",
    agentId: "research-agent",
    agentName: "Research-Agent",
    promptTemplate: `Conduct discovery research for: {{input}}

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
    dependsOn: [],
    outputKey: "research",
    metadata: {
      stageNumber: "0",
      qualityThreshold: 7.5,
      leadAgent: "research-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S1 — Orchestrator: Requirements clarification (CHECKPOINT)
  // User answers questions before pipeline continues
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s1-orchestrator",
    agentId: "orchestrator",
    agentName: "Orchestrator",
    promptTemplate: `Based on research:
{{step_s0-research_output}}

Original task: {{input}}

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
    dependsOn: ["s0-research"],
    outputKey: "requirements",
    metadata: {
      stageNumber: "1",
      qualityThreshold: 7.5,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S2 — PM: PRD with acceptance criteria
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s2-pm",
    agentId: "pm-agent",
    agentName: "PM-Agent",
    promptTemplate: `Create a Product Requirements Document based on:
Requirements & assumptions: {{step_s1-orchestrator_output}}
Research: {{step_s0-research_output}}

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
   - FUTURE PHASE: what we're deferring

5. JIRA STRUCTURE
   - Epic name and description
   - Stories with story points (Fibonacci: 1,2,3,5,8,13)
   - Sprint capacity: 40-50 SP

MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
    dependsOn: ["s1-orchestrator"],
    outputKey: "prd",
    metadata: {
      stageNumber: "2",
      qualityThreshold: 7.5,
      leadAgent: "pm-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S2.5 — Orchestrator: PRD Validation Gate
  // GATE 1: Is PRD sufficient for Architect?
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s2.5-prd-gate",
    agentId: "orchestrator",
    agentName: "Orchestrator",
    promptTemplate: `PRD VALIDATION GATE — Review the PM's PRD before sending to Architect.

IMPORTANT: You are acting as an INDEPENDENT REVIEWER. Evaluate the PRD objectively.
Do NOT bias toward approval — the PM and Orchestrator who created the requirements are NOT you.

PRD: {{step_s2-pm_output}}
Research: {{step_s0-research_output}}
Requirements: {{step_s1-orchestrator_output}}

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
    dependsOn: ["s2-pm"],
    outputKey: "prd_gate",
    metadata: {
      stageNumber: "2.5",
      qualityThreshold: 7.5,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
      evaluatorOverride: "qa-agent",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S3 — Architect Suite (4 micro-stages)
  // Cognitive Decomposition: each sub-stage focuses on ONE deliverable
  // ═══════════════════════════════════════════════════════════════

  // S3.1 — ADR: Architecture Decision Record
  {
    id: "s3.1-adr",
    agentId: "architect-agent",
    agentName: "Architect-Agent",
    promptTemplate: `Based on the PRD below, write ONE Architecture Decision Record.

PRD:
{{step_s2-pm_output}}

OUTPUT — ONE ADR only (max 300 words):

DECISION: [one sentence — what are we building and how]
CONTEXT: [why this decision matters, what constraints exist]
CHOSEN OPTION: [tech stack, architecture pattern, deployment model]
ALTERNATIVES CONSIDERED: [2-3 alternatives with why rejected]
RATIONALE: [why this option wins]
CONSEQUENCES: [trade-offs accepted]

Be specific: name exact technologies, frameworks, databases.
This ADR will be read by Backend, Frontend, Designer, DevOps, and Cyber agents.`,
    dependsOn: ["s2.5-prd-gate"],
    outputKey: "adr",
    metadata: {
      stageNumber: "3.1",
      qualityThreshold: 7.5,
      leadAgent: "architect-agent",
      model: "sonnet-4-6",
    },
  },

  // S3.2 — API Contracts
  {
    id: "s3.2-api",
    agentId: "architect-agent",
    agentName: "Architect-Agent",
    promptTemplate: `Define ALL API endpoints based on ADR and PRD.

ADR: {{step_s3.1-adr_output}}
PRD: {{step_s2-pm_output}}

═══ OUTPUT CONTRACT (STRICT — follow exactly) ═══

SECTION 1 — ENDPOINT INDEX (mandatory, always first):
| # | Method | Path | Auth | Domain |
|---|--------|------|------|--------|
| 1 | GET | /api/v1/... | JWT | ... |
| 2 | POST | /api/v1/... | JWT | ... |
(list ALL endpoints — this index survives truncation)

SECTION 2 — FULL CONTRACTS (by domain):
For EACH endpoint:
\`[METHOD] /api/v1/path\`
Request: { field: type }
Response 200: { field: type }
Errors: 400 (reason), 404 (reason)
Auth: JWT (role) | HMAC | public
Rate limit: N/min

═══ RULES ═══
- EVERY PRD user story MUST map to at least one endpoint
- Backend implements exactly these contracts — no deviations
- Frontend/Designer consume exactly these shapes
- Missing endpoint = broken feature downstream
- Do NOT write code. Contracts only.
- If you have N > 25 endpoints, use shorthand for CRUD groups:
  CRUD /api/v1/resource → GET list, GET :id, POST, PATCH :id, DELETE :id
  Then only detail non-standard endpoints fully.

MAX 5000 words. Budget: ~200 words per endpoint.
If you reach 4500 words (90%), STOP and write: "[TRUNCATION WARNING: N endpoints remaining — list paths only]" then list remaining paths.`,
    dependsOn: ["s3.1-adr"],
    outputKey: "api_contracts",
    metadata: {
      stageNumber: "3.2",
      qualityThreshold: 7.5,
      leadAgent: "architect-agent",
      model: "sonnet-4-6",
    },
  },

  // S3.3 — Data Model (ERD)
  {
    id: "s3.3-erd",
    agentId: "architect-agent",
    agentName: "Architect-Agent",
    promptTemplate: `Based on the API contracts, define the data model as ERD.

API Contracts: {{step_s3.2-api_output}}
ADR: {{step_s3.1-adr_output}}

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
    dependsOn: ["s3.2-api"],
    outputKey: "data_model",
    metadata: {
      stageNumber: "3.3",
      qualityThreshold: 7.5,
      leadAgent: "architect-agent",
      model: "sonnet-4-6",
    },
  },

  // S3.4 — File Plan
  {
    id: "s3.4-fileplan",
    agentId: "architect-agent",
    agentName: "Architect-Agent",
    promptTemplate: `Based on ADR, API contracts, and data model — list all files to create or modify.

ADR: {{step_s3.1-adr_output}}
API Contracts: {{step_s3.2-api_output}}
Data Model: {{step_s3.3-erd_output}}

OUTPUT — COMPLETE FILE PLAN:

FILES_TO_CREATE:
- path/to/file.ts — purpose (one line)
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
    dependsOn: ["s3.3-erd"],
    outputKey: "file_plan",
    metadata: {
      stageNumber: "3.4",
      qualityThreshold: 7.5,
      leadAgent: "architect-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S3.5 — Cyber: Threat model (conditional)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s4-cyber",
    agentId: "cyber-agent",
    agentName: "Cyber-Agent",
    promptTemplate: `Security review based on architecture:
{{step_s3.1-adr_output}}

API Contracts:
{{step_s3.2-api_output}}

Data Model:
{{step_s3.3-erd_output}}

File Plan:
{{step_s3.4-fileplan_output}}

Your output MUST follow this EXACT format (no deviations):

RISK LEVEL: [Low/Medium/High/Critical]

Finding 1: [Title]
Risk: [One sentence]
Fix: [One sentence]

Finding 2: [Title]
Risk: [One sentence]
Fix: [One sentence]

That's it. MAX 2-3 findings. MAX 4000 words. If you reach 3600 words (90%), stop and finalize. If no security concerns: just write 'RISK LEVEL: Low' and stop.`,
    dependsOn: ["s3.4-fileplan"],
    outputKey: "threat_model",
    metadata: {
      stageNumber: "4",
      qualityThreshold: 7.5,
      leadAgent: "cyber-agent",
      model: "sonnet-4-6",
      conditional: "public API / auth / payments",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S4.5 — Orchestrator: Architecture Gate
  // GATE 2: Does Architecture match PRD? Mismatch → back to S3.1
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s4.5-arch-gate",
    agentId: "orchestrator",
    agentName: "Orchestrator",
    promptTemplate: `ARCHITECTURE GATE — Verify Architecture matches PRD before implementation.

IMPORTANT: You are acting as an INDEPENDENT REVIEWER. The Architect who designed this is NOT you.
Evaluate objectively — look for gaps, not confirmations.

PRD: {{step_s2-pm_output}}
ADR: {{step_s3.1-adr_output}}
API Contracts: {{step_s3.2-api_output}}
ERD: {{step_s3.3-erd_output}}
File Plan: {{step_s3.4-fileplan_output}}
Cyber Findings: {{step_s4-cyber_output}}

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
    dependsOn: ["s4-cyber"],
    outputKey: "arch_gate",
    metadata: {
      stageNumber: "4.5",
      qualityThreshold: 7.5,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
      evaluatorOverride: "qa-agent",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S5 — Backend: API implementation + DB schema
  // FIRST in implementation chain
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s5-backend",
    agentId: "backend-agent",
    agentName: "Backend-Agent",
    promptTemplate: `Create backend implementation.

INPUTS:
- ADR: {{step_s3.1-adr_output}}
- API Contracts: {{step_s3.2-api_output}}
- ERD: {{step_s3.3-erd_output}}
- File Plan: {{step_s3.4-fileplan_output}}
- Cyber fixes: {{step_s4-cyber_output}}
- PRD: {{step_s2-pm_output}}

═══════════════════════════════════════════════════
  BACKEND OUTPUT CONTRACT (STRICT — MANDATORY)
═══════════════════════════════════════════════════

You MUST follow this output structure EXACTLY.
Violation = pipeline failure. No exceptions.

──────────────────────────────────────────────────
SECTION 1 — FILE TREE (mandatory, always FIRST)
──────────────────────────────────────────────────
\`\`\`
project-root/
├── migrations/
│   ├── 001_create_xxx.sql
│   └── ...
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── auth/
│   ├── modules/
│   │   ├── domain-name/
│   │   │   ├── domain.module.ts
│   │   │   ├── domain.controller.ts
│   │   │   ├── domain.service.ts
│   │   │   ├── domain.repository.ts
│   │   │   └── dto/
│   │   └── ...
│   └── shared/
│       ├── types/
│       └── utils/
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── tsconfig.json
\`\`\`
List EVERY file you will output. This tree is the contract.
If a file is in the tree, it MUST appear in the files JSON below.
If a file is NOT in the tree, it MUST NOT appear.

──────────────────────────────────────────────────
SECTION 2 — IMPLEMENTATION PRIORITY (mandatory)
──────────────────────────────────────────────────
Classify files into chunks by priority:

CHUNK A (critical path — output these FIRST):
- Migrations (SQL DDL)
- Shared types/interfaces
- Auth module (guards, JWT strategy)
- App module + main.ts

CHUNK B (core business logic):
- Module files: controller + service + repository + DTOs
- One module at a time, fully complete

CHUNK C (infrastructure):
- Dockerfile, docker-compose, .env.example, tsconfig

──────────────────────────────────────────────────
SECTION 3 — CODE FILES (the actual output)
──────────────────────────────────────────────────
${FILE_OUTPUT_INSTRUCTIONS}

CHUNKING RULES:
- Output files in the order: Chunk A → Chunk B → Chunk C
- Each file MUST be COMPLETE — no "// ... rest of implementation"
- No placeholders, no TODOs, no "similar to above"
- If you are running out of space (approaching token limit):
  1. FINISH the current file completely
  2. Add a final file entry: {"path": "TRUNCATION_MANIFEST.md", "action": "create", "content": "Files not yet generated:\\n- path/to/remaining1.ts\\n- path/to/remaining2.ts\\n..."}
  3. STOP — do NOT output partial files

──────────────────────────────────────────────────
SECTION 4 — ENV VARS (mandatory, always LAST)
──────────────────────────────────────────────────
\`\`\`json
{"required_env_vars": [
  {"name": "DATABASE_URL", "description": "...", "example": "postgresql://...", "required": true}
]}
\`\`\`

═══ HARD RULES ═══
1. Implement EXACTLY the API endpoints from S3.2 contracts — same paths, methods, shapes
2. Apply ALL cyber fixes from S4 — no security shortcuts
3. Every file must compile independently (correct imports, no circular deps)
4. No file > 300 lines. Split large services into service + repository.
5. Prefer code density over comments — skip obvious JSDoc
6. Total output budget: aim for 40-60 files. If the project needs more, prioritize Chunk A+B fully over Chunk C completeness.`,
    dependsOn: ["s4.5-arch-gate"],
    outputKey: "backend_code",
    metadata: {
      stageNumber: "5",
      qualityThreshold: 7.5,
      leadAgent: "backend-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S6 — Designer: UI/UX specs (depends on Backend — sees real endpoints)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s6-designer",
    agentId: "designer-agent",
    agentName: "Designer-Agent",
    promptTemplate: `Create design system + UI component code.

INPUTS:
- Backend: {{step_s5-backend_output}}
- API Contracts: {{step_s3.2-api_output}}
- File Plan: {{step_s3.4-fileplan_output}}
- PRD: {{step_s2-pm_output}}

═══ DESIGNER OUTPUT CONTRACT (STRICT) ═══

SECTION 1 — FILE TREE (mandatory, always FIRST):
\`\`\`
styles/
├── globals.css          ← design tokens (CSS custom properties)
├── theme.ts             ← typed token exports
components/
├── ui/                  ← reusable primitives (Button, Card, Badge, Input, etc.)
│   ├── button.tsx
│   └── ...
├── layouts/             ← page shells (sidebar + main)
│   └── dashboard-layout.tsx
├── domain/              ← business components (TierCard, PointsDisplay, etc.)
│   ├── component-name.tsx
│   └── ...
└── icons/               ← custom SVG icons if needed
\`\`\`

SECTION 2 — DESIGN TOKENS (globals.css):
- Colors: brand, tiers (bronze/silver/gold/platinum), status, neutrals — HSL format
- Typography: font-family, scale (xs through 4xl)
- Spacing: 4px base grid (--space-1 through --space-16)
- Radii, shadows, transitions
- Dark mode support via .dark class

SECTION 3 — COMPONENT FILES:
${FILE_OUTPUT_INSTRUCTIONS}

CHUNKING RULES:
- CHUNK A: globals.css + theme.ts + ui primitives (Button, Card, Badge, Input, Select, Table)
- CHUNK B: Layout components + domain components (one per business entity)
- Each file MUST be COMPLETE React/TSX — no stubs
- Every component MUST have: props interface, all visual states, responsive behavior
- Map each component to its API endpoint in a comment: // API: GET /api/v1/...
- If running out of space: finish current file, add TRUNCATION_MANIFEST.md, STOP

═══ HARD RULES ═══
1. Output REAL .tsx component code — not specs, not descriptions
2. Use Tailwind CSS + CSS custom properties from globals.css
3. No file > 200 lines. Split complex components.
4. Every component must handle: loading, error, empty, populated states
5. Accessibility: ARIA labels on interactive elements, keyboard navigation`,
    dependsOn: ["s5-backend"],
    outputKey: "design",
    metadata: {
      stageNumber: "6",
      qualityThreshold: 7.5,
      leadAgent: "designer-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S7 — Frontend: UI implementation using Designer + Backend output
  // LAST in chain — has both design specs and real API endpoints
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s7-frontend",
    agentId: "frontend-agent",
    agentName: "Frontend-Agent",
    promptTemplate: `Create frontend implementation (pages + API wiring).

INPUTS:
- Designer output: {{step_s6-designer_output}}
- Backend: {{step_s5-backend_output}}
- API Contracts: {{step_s3.2-api_output}}
- File Plan: {{step_s3.4-fileplan_output}}

═══ FRONTEND OUTPUT CONTRACT (STRICT) ═══

SECTION 1 — FILE TREE (mandatory, always FIRST):
\`\`\`
app/
├── layout.tsx
├── page.tsx              ← dashboard / landing
├── (auth)/
│   └── login/page.tsx
├── domain-section/
│   ├── page.tsx          ← list view
│   └── [id]/page.tsx     ← detail view
├── globals.css           ← import Designer's tokens
lib/
├── api.ts                ← typed API client (all endpoints)
├── types.ts              ← shared TS interfaces
├── hooks/
│   ├── use-domain.ts     ← SWR/React Query hooks per domain
│   └── ...
\`\`\`

SECTION 2 — API CLIENT (lib/api.ts — mandatory, output FIRST):
- Typed fetch wrapper for EVERY endpoint from S3.2 contracts
- Same paths, same request/response shapes — no deviations
- Auth header injection, error handling, base URL config

SECTION 3 — PAGES + HOOKS:
${FILE_OUTPUT_INSTRUCTIONS}

CHUNKING RULES:
- CHUNK A: lib/api.ts + lib/types.ts + globals.css + layout.tsx
- CHUNK B: Page files (one page at a time, fully complete with its hook)
- CHUNK C: Shared hooks, utils, config
- Each file MUST be COMPLETE — no placeholders
- If running out of space: finish current file, add TRUNCATION_MANIFEST.md, STOP

═══ HARD RULES ═══
1. Use ONLY endpoints from S3.2 API contracts — do NOT invent endpoints
2. Import Designer's components from their paths — do NOT re-implement UI primitives
3. Every page: loading skeleton, error boundary, empty state, populated state
4. No file > 250 lines. Split into page + hook + sub-components.
5. Responsive: mobile-first, breakpoints at sm/md/lg
6. Auth: use httpOnly cookie or auth context — NEVER localStorage for tokens`,
    dependsOn: ["s6-designer", "s5-backend"],
    outputKey: "frontend_code",
    metadata: {
      stageNumber: "7",
      qualityThreshold: 7.5,
      leadAgent: "frontend-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S8 — Technical QA (White Box): code compiles, types match, tests pass
  // The "Internal Gate" — catches cheap technical errors early
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s8-technical-qa",
    agentId: "qa-agent",
    agentName: "QA-Agent",
    promptTemplate: `TECHNICAL QA — verify code quality and correctness.

Backend implementation: {{step_s5-backend_output}}
Frontend implementation: {{step_s7-frontend_output}}
Design specs: {{step_s6-designer_output}}
API Contracts: {{step_s3.2-api_output}}

You are a WHITE BOX tester. Check the CODE, not the business logic.

STEP 1 — COMPILATION CHECK
- Do all TypeScript files compile without errors?
- Are all imports valid?
- Are there type mismatches?

STEP 2 — API CONTRACT COMPLIANCE
For each endpoint in the API contracts:
- Is it implemented in Backend? (file path)
- Does request shape match the contract? (yes/mismatch details)
- Does response shape match the contract? (yes/mismatch details)

STEP 3 — DATA MODEL COMPLIANCE
- Do database schema fields match the ERD types?
- Are all relations implemented (foreign keys, cascades)?
- Are indexes present for query patterns?

STEP 4 — CODE QUALITY
- N+1 query risks
- Missing error handling
- Hardcoded values that should be config
- Missing input validation on endpoints

Output:
\`\`\`json
{"technical_results": {
  "compilation": "PASS | FAIL",
  "api_compliance": "PASS | FAIL (N mismatches)",
  "data_compliance": "PASS | FAIL",
  "issues": [
    {"type": "type_mismatch | missing_endpoint | missing_file | contract_mismatch | n_plus_one | no_validation",
     "file": "path", "description": "...", "severity": "P0 | P1 | P2",
     "fix_agent": "backend-agent | frontend-agent | designer-agent"}
  ],
  "verdict": "PASS | FAIL"
}}
\`\`\`

VERDICT: FAIL if any compilation error or P0 issue. MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
    dependsOn: ["s7-frontend"],
    outputKey: "technical_qa",
    metadata: {
      stageNumber: "8",
      qualityThreshold: 7.5,
      leadAgent: "qa-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S8.5 — Orchestrator: Technical Review Gate
  // GATE 3: Reviews QA logs. Dirty code → back to coders
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s8.5-tech-review",
    agentId: "orchestrator",
    agentName: "Orchestrator",
    promptTemplate: `TECHNICAL REVIEW GATE — Review Technical QA results before business validation.

Technical QA Results: {{step_s8-technical-qa_output}}
Backend: {{step_s5-backend_output}}
Frontend: {{step_s7-frontend_output}}

Check:
1. Are there any P0 technical issues (compilation errors, type mismatches)?
2. Do all API endpoints match the contracts from S3.2?
3. Are there critical missing files from the file plan?

Output:
GATE VERDICT: PASS | FAIL
P0 ISSUES: [count]
ACTION: [continue to Business QA | return to Backend/Frontend for fixes]

If FAIL with P0 issues: pipeline returns to the responsible coder.
If PASS: Business QA proceeds.`,
    dependsOn: ["s8-technical-qa"],
    outputKey: "tech_review_gate",
    metadata: {
      stageNumber: "8.5",
      qualityThreshold: 7.5,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
      evaluatorOverride: "qa-agent",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S8.6 — Build Error Resolver: auto-fix type/import/null errors
  // CONDITIONAL: only runs if S8.5 tech review found P0 issues
  // Constrained: ONLY fixes types, imports, null checks, missing deps
  // PROHIBITED: refactoring, architecture changes, feature additions
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s8.6-build-fix",
    agentId: "backend-agent",
    agentName: "Build-Error-Resolver",
    promptTemplate: `BUILD ERROR RESOLVER — Fix ONLY compilation and type errors.

Technical QA found P0 issues: {{step_s8-technical-qa_output}}
Tech Review Gate: {{step_s8.5-tech-review_output}}
Backend code: {{step_s5-backend_output}}
Frontend code: {{step_s7-frontend_output}}

YOUR TASK:
1. Run \`npx tsc --noEmit --pretty\` to get exact error list
2. Fix ONLY these categories:
   - Type annotation errors (TS2322, TS2345, TS7006)
   - Missing imports/exports (TS2305, TS2307)
   - Null/undefined checks (TS2531, TS18047)
   - Missing dependencies (run \`npm install\` if needed)
   - tsconfig.json misconfigurations
3. Re-run \`npx tsc --noEmit\` to verify fixes
4. Report what was fixed

PROHIBITED (DO NOT DO):
- Refactoring code
- Changing business logic
- Adding features
- Modifying architecture
- Changing API contracts
- Renaming variables/functions for style

If a fix requires architecture changes, report it but DO NOT fix it.

Output format:
ERRORS FOUND: [count]
ERRORS FIXED: [count]
ERRORS REMAINING: [count]
CHANGES MADE:
- [file]: [what was fixed]
VERDICT: CLEAN | PARTIAL | BLOCKED`,
    dependsOn: ["s8.5-tech-review"],
    outputKey: "build_fix",
    metadata: {
      stageNumber: "8.6",
      qualityThreshold: 7,
      leadAgent: "backend-agent",
      model: "sonnet-4-6",
      conditional: "step_s8.5-tech-review_output contains FAIL",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S9 — Business QA (Black Box): acceptance criteria vs PRD
  // The "External Gate" — validates business value delivery
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s9-business-qa",
    agentId: "qa-agent",
    agentName: "QA-Agent",
    promptTemplate: `BUSINESS QA — validate against PRD acceptance criteria.

PRD with acceptance criteria: {{step_s2-pm_output}}
Technical QA results: {{step_s8-technical-qa_output}}
Build fixes (if any): {{step_s8.6-build-fix_output}}
Backend: {{step_s5-backend_output}}
Frontend: {{step_s7-frontend_output}}

You are a BLACK BOX tester. Check BUSINESS LOGIC, not code quality.
Technical QA (S5) already verified compilation and types.

For EACH acceptance criterion from the PRD:
\`\`\`json
{"acceptance_results": [
  {
    "criteria_id": "AC-1",
    "user_story": "As a [persona], I want to...",
    "given": "...",
    "when": "...",
    "then": "...",
    "status": "PASS | FAIL | PARTIAL | BLOCKED",
    "evidence": "what confirms or contradicts this",
    "severity": "P0 | P1 | P2",
    "fix_required": "description (if FAIL)"
  }
],
"summary": {"total": 0, "pass": 0, "fail": 0, "partial": 0, "blocked": 0, "p0_failures": 0},
"verdict": "PASS | FAIL"
}
\`\`\`

Rules:
- VERDICT: FAIL if any P0 criteria FAIL
- If Technical QA (S5) found P0 issues, those are auto-FAIL here too
- PASS only if ALL P0 criteria are PASS or PARTIAL
- Do NOT check: code style, architecture, security, performance
- ONLY check: "Does the system satisfy what the PRD promised?"

MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
    dependsOn: ["s8.5-tech-review"],
    outputKey: "business_qa",
    metadata: {
      stageNumber: "9",
      qualityThreshold: 7.5,
      leadAgent: "qa-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S6 — Cyber: Deep security audit post-implementation
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s10-cyber-audit",
    agentId: "cyber-agent",
    agentName: "Cyber-Agent",
    promptTemplate: `Deep security audit based on:
Backend implementation: {{step_s5-backend_output}}
Frontend implementation: {{step_s7-frontend_output}}
Technical QA: {{step_s8-technical-qa_output}}
Business QA: {{step_s9-business-qa_output}}

Review actual code for OWASP Top 10:
1. Injection (SQL, NoSQL, command)
2. Broken authentication
3. Sensitive data exposure
4. XSS (stored, reflected, DOM)
5. CSRF
6. Insecure dependencies
7. Missing rate limiting
8. Improper error handling (stack traces leaked)

For each finding:
SEVERITY: Critical/High/Medium/Low
FILE: exact file path
VULNERABILITY: one sentence
FIX: concrete code change

MAX 4000 words. If you reach 3600 words (90%), stop and finalize. Only report real issues found in the code.`,
    dependsOn: ["s9-business-qa"],
    outputKey: "security_audit",
    metadata: {
      stageNumber: "10",
      qualityThreshold: 7.5,
      leadAgent: "cyber-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S11 — Orchestrator: Final Verdict
  // GATE 4: "Ready for release or scrap?"
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s11-final-verdict",
    agentId: "orchestrator",
    agentName: "Orchestrator",
    promptTemplate: `FINAL VERDICT — Is this product ready for release?

Technical QA: {{step_s8-technical-qa_output}}
Business QA: {{step_s9-business-qa_output}}
Security Audit: {{step_s10-cyber-audit_output}}
PRD: {{step_s2-pm_output}}

Review ALL quality gates:
1. Technical QA verdict: PASS/FAIL?
2. Business QA verdict: PASS/FAIL? How many AC passed?
3. Security Audit: any Critical/High unresolved?
4. Overall: does the product satisfy the original task?

Output:
FINAL VERDICT: RELEASE | REVISE | SCRAP
REASON: [one paragraph]
UNRESOLVED: [list of open issues, if any]
RECOMMENDATION: [what to do next]

RELEASE = all gates passed, ready for deployment
REVISE = fixable issues, return to specific stage
SCRAP = fundamental problems, restart from S1`,
    dependsOn: ["s10-cyber-audit"],
    outputKey: "final_verdict",
    metadata: {
      stageNumber: "11",
      qualityThreshold: 7.5,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S12a — DevOps: Infrastructure + CI/CD (sees all outputs)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s12a-devops",
    agentId: "devops-agent",
    agentName: "DevOps-Agent",
    promptTemplate: `Create infrastructure, CI/CD, and deployment configuration based on:
Architecture: {{step_s3.1-adr_output}}

API Contracts:
{{step_s3.2-api_output}}

Data Model:
{{step_s3.3-erd_output}}

File Plan:
{{step_s3.4-fileplan_output}}
Backend: {{step_s5-backend_output}}
Frontend: {{step_s7-frontend_output}}
Security audit: {{step_s10-cyber-audit_output}}

IMPORTANT: Backend output contains a "required_env_vars" JSON block.
Parse it and use it as the source of truth for environment configuration.
Do NOT guess env vars — use exactly what Backend declared.

Your output MUST include:

1. ENVIRONMENT VARIABLES
   From Backend's required_env_vars block, create a complete table:
   | Variable | Description | Required | Example | Used by |

2. CI/CD PIPELINE
   - Build steps, test steps, deploy steps
   - Branch strategy (main, staging, feature)

3. DEPLOYMENT CONFIG
   - Dockerfile or platform config (Vercel/Railway/etc)
   - Database setup/migration commands
   - Health check endpoints

4. ROLLBACK PLAN
   - How to revert if deployment fails
   - Database rollback strategy

${FILE_OUTPUT_INSTRUCTIONS}

Generate: Dockerfile, .env.example, CI config (GitHub Actions or similar)`,
    dependsOn: ["s11-final-verdict"],
    outputKey: "infrastructure",
    metadata: {
      stageNumber: "12",
      qualityThreshold: 7.5,
      leadAgent: "devops-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S7 — Orchestrator: Final consolidation
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s12b-consolidation",
    agentId: "orchestrator",
    agentName: "Orchestrator",
    promptTemplate: `Final consolidation and delivery report.

All outputs:
- Research: {{step_s0-research_output}}
- PRD: {{step_s2-pm_output}}
- Architecture: {{step_s3.1-adr_output}}

API Contracts:
{{step_s3.2-api_output}}

Data Model:
{{step_s3.3-erd_output}}

File Plan:
{{step_s3.4-fileplan_output}}
- Design: {{step_s6-designer_output}}
- Backend: {{step_s5-backend_output}}
- Frontend: {{step_s7-frontend_output}}
- Technical QA: {{step_s8-technical-qa_output}}
- Business QA: {{step_s9-business-qa_output}}
- Security Audit: {{step_s10-cyber-audit_output}}
- DevOps: {{step_s12a-devops_output}}

Create a DELIVERY SUMMARY:

1. WHAT WAS BUILT — 2-3 sentences
2. FILES CREATED — list all file paths from Backend, Frontend, Designer, DevOps outputs
3. OPEN ISSUES — any FAIL items from QA or Critical/High from Cyber audit
4. DEPLOYMENT CHECKLIST
   - [ ] Environment variables configured
   - [ ] Database migrated
   - [ ] CI/CD pipeline passing
   - [ ] Security findings addressed
   - [ ] Acceptance criteria verified
5. NEXT STEPS — what should happen after deployment

MAX 4000 words. If you reach 3600 words (90%), stop and finalize.`,
    dependsOn: ["s12a-devops"],
    outputKey: "final_report",
    metadata: {
      stageNumber: "12",
      qualityThreshold: 7.5,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
    },
  },
];

export const CRM_PIPELINE_TEMPLATE = {
  name: "MC Pipeline",
  description: "19-stage pipeline with 4 Orchestrator Gates: S0-S2 Planning → S2.5 PRD Gate → S3.1-3.4 Architecture → S4 Cyber → S4.5 Arch Gate → S5-S7 Implementation → S8 Tech QA → S8.5 Tech Gate → S9 Business QA → S10 Cyber Audit → S11 Final Verdict → S12 DevOps + Consolidation",
  steps: CRM_PIPELINE_STAGES,
};
