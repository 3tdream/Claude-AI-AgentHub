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

MAX 1500 words. Be specific — no generic filler.`,
    dependsOn: [],
    outputKey: "research",
    metadata: {
      stageNumber: "0",
      qualityThreshold: 6.0,
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
      qualityThreshold: 6.0,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
      isCheckpoint: true,
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

MAX 2000 words.`,
    dependsOn: ["s1-orchestrator"],
    outputKey: "prd",
    metadata: {
      stageNumber: "2",
      qualityThreshold: 5.5,
      leadAgent: "pm-agent",
      model: "sonnet-4-6",
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
    dependsOn: ["s2-pm"],
    outputKey: "adr",
    metadata: {
      stageNumber: "3.1",
      qualityThreshold: 6.0,
      leadAgent: "architect-agent",
      model: "sonnet-4-6",
    },
  },

  // S3.2 — API Contracts
  {
    id: "s3.2-api",
    agentId: "architect-agent",
    agentName: "Architect-Agent",
    promptTemplate: `Based on the ADR and PRD, define ALL API endpoints.

ADR: {{step_s3.1-adr_output}}
PRD: {{step_s2-pm_output}}

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

MAX 500 words.`,
    dependsOn: ["s3.1-adr"],
    outputKey: "api_contracts",
    metadata: {
      stageNumber: "3.2",
      qualityThreshold: 6.0,
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

MAX 400 words.`,
    dependsOn: ["s3.2-api"],
    outputKey: "data_model",
    metadata: {
      stageNumber: "3.3",
      qualityThreshold: 6.0,
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

MAX 300 words. One line per file.`,
    dependsOn: ["s3.3-erd"],
    outputKey: "file_plan",
    metadata: {
      stageNumber: "3.4",
      qualityThreshold: 6.0,
      leadAgent: "architect-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S3.5 — Cyber: Threat model (conditional)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s3.5-cyber",
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

That's it. MAX 2-3 findings. MAX 400 words total. If no security concerns: just write 'RISK LEVEL: Low' and stop. Do NOT write threat models, matrices, or long analysis.`,
    dependsOn: ["s3.4-fileplan"],
    outputKey: "threat_model",
    metadata: {
      stageNumber: "3.5",
      qualityThreshold: 6.0,
      leadAgent: "cyber-agent",
      model: "opus-4-6",
      conditional: "public API / auth / payments",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S4a — Backend: API implementation + DB schema
  // FIRST in implementation chain — Designer and Frontend depend on real endpoints
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s4-designer",
    agentId: "designer-agent",
    agentName: "Designer-Agent",
    promptTemplate: `Create UI/UX design system and component specs based on:
Backend implementation: {{step_s4-backend_output}}
Architecture: {{step_s3.1-adr_output}}

API Contracts:
{{step_s3.2-api_output}}

File Plan:
{{step_s3.4-fileplan_output}}
PRD & user stories: {{step_s2-pm_output}}
Security constraints: {{step_s3.5-cyber_output}}

Your output MUST include:

1. DESIGN TOKENS (as CSS variables)
   Colors, typography scale, spacing, border-radius, shadows

2. PAGE LAYOUTS
   For each page/view in the PRD:
   - Layout description (grid/flex structure)
   - Component hierarchy (tree of components)
   - Responsive breakpoints behavior

3. COMPONENT SPECS
   For each UI component:
   - Props interface (TypeScript)
   - States: default, hover, active, disabled, loading, error, empty
   - Accessibility: ARIA labels, keyboard navigation, focus management

4. DATA MAPPING
   Map each API endpoint from Architecture to the UI component that consumes it:
   \`GET /api/users\` → UserTable component → columns: [name, email, role]

${FILE_OUTPUT_INSTRUCTIONS}

Generate these files:
- globals.css (design tokens as CSS custom properties)
- Component files (.tsx) for the main UI components`,
    dependsOn: ["s4-backend"],
    outputKey: "design",
    metadata: {
      stageNumber: "4",
      qualityThreshold: 6.0,
      leadAgent: "designer-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S4b — Backend: API implementation + DB schema
  // Runs PARALLEL with Designer
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s4-backend",
    agentId: "backend-agent",
    agentName: "Backend-Agent",
    promptTemplate: `Create backend implementation based on:
Architecture & API contracts: {{step_s3.1-adr_output}}

API Contracts:
{{step_s3.2-api_output}}

Data Model:
{{step_s3.3-erd_output}}

File Plan:
{{step_s3.4-fileplan_output}}
Security constraints: {{step_s3.5-cyber_output}}
PRD & acceptance criteria: {{step_s2-pm_output}}

CRITICAL: You MUST implement EXACTLY the API endpoints defined in the Architecture's API CONTRACTS section.
- Same paths, same methods, same request/response shapes — no deviations
- Frontend and Designer are working from the same contract in parallel
- Any mismatch will break integration

YOUR RESPONSIBILITIES (Architect does not write code — you do):

1. DATABASE: Convert Architect's DATA MODEL (ERD) into actual SQL migrations
   - CREATE TABLE statements with proper types, constraints, indexes
   - Use the entity names, fields, and relations from the ERD exactly

2. API ROUTES: For each endpoint from the contract:
   - Create the route handler with input validation
   - Implement business logic to satisfy the PRD acceptance criteria (GIVEN/WHEN/THEN)
   - Return the EXACT response shape from the contract
   - Handle errors with proper status codes

3. SHARED TYPES: TypeScript interfaces matching the DATA MODEL entities
   - Export from a shared location so Frontend can import them

4. UTILITIES: Helper functions for common patterns (auth, validation, etc.)

At the END of your output, include a structured env vars block:
\`\`\`json
{"required_env_vars": [
  {"name": "DATABASE_URL", "description": "PostgreSQL connection string", "example": "postgresql://user:pass@localhost:5432/db", "required": true},
  {"name": "JWT_SECRET", "description": "Secret for signing auth tokens", "example": "random-32-char-string", "required": true}
]}
\`\`\`
List EVERY env var your code references. DevOps depends on this to build .env.example and deployment config.

${FILE_OUTPUT_INSTRUCTIONS}`,
    dependsOn: ["s3.5-cyber"],
    outputKey: "backend_code",
    metadata: {
      stageNumber: "4",
      qualityThreshold: 6.0,
      leadAgent: "backend-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S4c — Frontend: UI implementation using Designer + Backend output
  // Runs AFTER Designer and Backend complete
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s4-frontend",
    agentId: "frontend-agent",
    agentName: "Frontend-Agent",
    promptTemplate: `Create frontend implementation based on:
Design system & component specs: {{step_s4-designer_output}}
Backend API implementation: {{step_s4-backend_output}}
Architecture: {{step_s3.1-adr_output}}

API Contracts:
{{step_s3.2-api_output}}

Data Model:
{{step_s3.3-erd_output}}

File Plan:
{{step_s3.4-fileplan_output}}

IMPORTANT:
- API endpoints: use paths and shapes from API Contracts (S3.2) as source of truth
- Types: import TypeScript types from Backend's shared type definitions
- Design: use tokens and component specs from Designer output
- States: implement loading, error, empty, success for every component
- Do NOT invent endpoints — if it's not in S3.2 API contracts, don't call it

For each page in the PRD:
1. Create the page component using the Designer's layout spec
2. Wire up API calls to Backend endpoints
3. Handle loading/error/empty states
4. Implement responsive behavior per Designer's breakpoint specs

${FILE_OUTPUT_INSTRUCTIONS}`,
    dependsOn: ["s4-designer", "s4-backend"],
    outputKey: "frontend_code",
    metadata: {
      stageNumber: "4",
      qualityThreshold: 6.0,
      leadAgent: "frontend-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S4.5 — Human Checkpoint: Review before QA
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s4.5-checkpoint",
    agentId: "orchestrator",
    agentName: "Human Checkpoint",
    promptTemplate: `⚠️ HUMAN CHECKPOINT — Review implementation outputs before proceeding.

Design: {{step_s4-designer_output}}
Backend: {{step_s4-backend_output}}
Frontend: {{step_s4-frontend_output}}

Summary for reviewer:
- Designer produced design tokens and component specs
- Backend implemented API endpoints per architecture contracts
- Frontend wired up Designer specs with Backend APIs

Please review and approve/reject to continue to QA.`,
    dependsOn: ["s4-frontend"],
    outputKey: "checkpoint_approval",
    metadata: {
      stageNumber: "4.5",
      qualityThreshold: 0,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
      isCheckpoint: true,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S5 — Technical QA (White Box): code compiles, types match, tests pass
  // The "Internal Gate" — catches cheap technical errors early
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s5-technical-qa",
    agentId: "qa-agent",
    agentName: "QA-Agent",
    promptTemplate: `TECHNICAL QA — verify code quality and correctness.

Backend implementation: {{step_s4-backend_output}}
Frontend implementation: {{step_s4-frontend_output}}
Design specs: {{step_s4-designer_output}}
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

VERDICT: FAIL if any compilation error or P0 issue. MAX 500 words.`,
    dependsOn: ["s4.5-checkpoint"],
    outputKey: "technical_qa",
    metadata: {
      stageNumber: "5",
      qualityThreshold: 6.0,
      leadAgent: "qa-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S5.5 — Business QA (Black Box): acceptance criteria vs PRD
  // The "External Gate" — validates business value delivery
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s5.5-business-qa",
    agentId: "qa-agent",
    agentName: "QA-Agent",
    promptTemplate: `BUSINESS QA — validate against PRD acceptance criteria.

PRD with acceptance criteria: {{step_s2-pm_output}}
Technical QA results: {{step_s5-technical-qa_output}}
Backend: {{step_s4-backend_output}}
Frontend: {{step_s4-frontend_output}}

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

MAX 500 words.`,
    dependsOn: ["s5-technical-qa"],
    outputKey: "business_qa",
    metadata: {
      stageNumber: "5.5",
      qualityThreshold: 6.0,
      leadAgent: "qa-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S6 — Cyber: Deep security audit post-implementation
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s6-cyber-audit",
    agentId: "cyber-agent",
    agentName: "Cyber-Agent",
    promptTemplate: `Deep security audit based on:
Backend implementation: {{step_s4-backend_output}}
Frontend implementation: {{step_s4-frontend_output}}
Technical QA: {{step_s5-technical-qa_output}}
Business QA: {{step_s5.5-business-qa_output}}

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

MAX 500 words. Only report real issues found in the code.`,
    dependsOn: ["s5.5-business-qa"],
    outputKey: "security_audit",
    metadata: {
      stageNumber: "6",
      qualityThreshold: 6.0,
      leadAgent: "cyber-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S7 — DevOps: Infrastructure + CI/CD (sees all outputs)
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s7-devops",
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
Backend: {{step_s4-backend_output}}
Frontend: {{step_s4-frontend_output}}
Security audit: {{step_s6-cyber-audit_output}}

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
    dependsOn: ["s6-cyber-audit"],
    outputKey: "infrastructure",
    metadata: {
      stageNumber: "7",
      qualityThreshold: 6.0,
      leadAgent: "devops-agent",
      model: "sonnet-4-6",
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // S7 — Orchestrator: Final consolidation
  // ═══════════════════════════════════════════════════════════════
  {
    id: "s8-consolidation",
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
- Design: {{step_s4-designer_output}}
- Backend: {{step_s4-backend_output}}
- Frontend: {{step_s4-frontend_output}}
- Technical QA: {{step_s5-technical-qa_output}}
- Business QA: {{step_s5.5-business-qa_output}}
- Security Audit: {{step_s6-cyber-audit_output}}
- DevOps: {{step_s7-devops_output}}

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

MAX 800 words.`,
    dependsOn: ["s7-devops"],
    outputKey: "final_report",
    metadata: {
      stageNumber: "8",
      qualityThreshold: 6.0,
      leadAgent: "orchestrator",
      model: "sonnet-4-6",
    },
  },
];

export const CRM_PIPELINE_TEMPLATE = {
  name: "Beauty CRM Full Pipeline",
  description: "16-stage pipeline: S0 Research → S1 Requirements (checkpoint) → S2 PRD → S3.1 ADR → S3.2 API Contracts → S3.3 ERD → S3.4 File Plan → S3.5 Cyber Threat Model → S4 Designer+Backend (parallel) → S4 Frontend → S4.5 Checkpoint → S5 QA Validation → S5.5 Cyber Audit → S6 DevOps → S7 Consolidation",
  steps: CRM_PIPELINE_STAGES,
};
