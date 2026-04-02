# Mission Control — Architecture

AI Agent Management Platform. 9 feature areas, 19 API routes, 16 agents across 5 departments.

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15.5.4 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI |
| State | Zustand (client), SWR (server) |
| Charts | Recharts |
| Icons | Lucide React |
| Fonts | Syne + Space Mono (Google Fonts) |
| Toast | Sonner (dark, bottom-right) |

## Data Flow

```
Browser → /api/* routes → Agent Hub REST API (primary)
                        → OpenAI API (fallback)
                        → Jira REST API
                        → data/*.json (local storage)
```

## Pages

| Route | Purpose |
|-------|---------|
| `/dashboard` | Agent KPI table |
| `/agents`, `/agents/[id]` | Browse/edit agents (config, prompts, sessions) |
| `/teams`, `/teams/[id]` | Organize agents into teams |
| `/chat` | Per-agent chat with streaming (Agent Hub + OpenAI fallback) |
| `/orchestration` | Multi-agent workflow pipelines |
| `/logs` | Activity timeline (chat, decision, manual, system) |
| `/costs` | Spending dashboard with daily charts + provider breakdown |
| `/jira`, `/jira/settings` | Issue tracker + credential setup |
| `/analytics` | Pipeline quality trends, retry distribution, status breakdown, execution history |

## API Routes

### Agent Hub Proxy (`/api/agent-hub/*`)

All routes proxy through `agentHubFetch()` with cached fallback on failure.

| Route | Methods | Notes |
|-------|---------|-------|
| `/agents` | GET, POST | List/create |
| `/agents/[id]` | GET, PATCH, DELETE | CRUD |
| `/agents/[id]/prompt` | GET, PUT | System prompt + version history |
| `/teams` | GET, POST | Team CRUD |
| `/teams/[id]/agents` | GET | Agents in team |
| `/costs` | GET | Summary (total, by provider, by model) |
| `/costs/daily` | GET | 30-day rolling |
| `/sessions` | GET, POST | Session management |
| `/sessions/[id]` | GET, DELETE | Session CRUD |
| `/sessions/[id]/messages` | GET, POST | Messages |
| `/models` | GET | Available LLM models |

### Other Routes

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/chat` | POST | Dual-source streaming (see below) |
| `/api/logs` | GET, POST | File-based log storage |
| `/api/jira/config` | GET, PUT | Credential management (includes `defaultProjectKey`) |
| `/api/jira/config/test` | GET | Test Jira connection |
| `/api/jira/projects` | GET | List Jira projects |
| `/api/jira/issues` | GET, POST | Search/create issues |
| `/api/jira/feature-log` | POST | PM Agent hook — creates `[AI-Built]` Jira issue from `FeatureCompletionPayload` |
| `/api/jira/sync` | POST | Pipeline lifecycle sync — dispatches stage transitions, comments, and epic management |
| `/api/knowledge/enrich` | POST | Auto-enriches knowledge base from completed pipeline execution |
| `/api/knowledge/evolve` | GET, POST | KB confidence evolution — boost/decay patterns, aging, health report |
| `/api/pipeline/baselines` | GET, POST | Eval baselines — quality tracking over time, run comparison, regression detection |
| `/api/orchestration/apply` | POST | Auto-Apply: writes parsed code blocks from pipeline output to filesystem |

## Dual Chat Source

`POST /api/chat` implements a two-tier fallback:

1. **Primary — Agent Hub**: Calls `executeAgent()` → streams SSE response
2. **Fallback — OpenAI**: On Agent Hub error, loads system prompt from `data/prompt-overrides.json` or cached prompts, streams via OpenAI (`gpt-4.1-mini`)

Response header `X-Chat-Source: agent-hub | openai-fallback` indicates which path was used.

```
POST /api/chat { agentId, messages[] }
  → Try: agentHubFetch(/{assistantId}/workspace-execute)
  → Catch: OpenAI streaming with cached system prompt
  → SSE: data: {text: chunk}\n\n ... data: [DONE]\n\n
  → Side-effect: addLog() (fire-and-forget)
```

## Offline Resilience

Controlled by `AGENT_HUB_LIVE` env var. When Agent Hub is unreachable:

- **`lib/agent-hub-cache.ts`** — Hardcoded snapshots of 16 agents, teams, cost summary, daily costs
- **`lib/agent-prompts-cache.ts`** — 13 agent system prompts for direct LLM fallback
- **`data/prompt-overrides.json`** — User-edited prompt overrides (takes priority over cache)
- **Circuit breaker** — `hubUnreachableSince` tracks downtime, resets on success

API error handling pattern:
```ts
try {
  const data = await agentHubFetch(url);
  return NextResponse.json({ data });
} catch {
  return NextResponse.json({ data: cachedData, cached: true });
}
```

## Claude Code Hooks (`scripts/hooks/`)

| Hook | Lifecycle | Purpose |
|------|-----------|---------|
| `memory-persist.mjs` | SessionStart / Stop | Auto-save/load session context (project, KB stats) |
| `commit-quality.sh` | PreToolUse (Bash) | Block secrets, warn console.log, validate commit format |
| `suggest-compact.sh` | PreToolUse (Bash) | Count tool calls, suggest /compact at 50/80/100 |
| `typecheck-stop.sh` | Stop | Run `tsc --noEmit` on modified TS files after each response |

## KB Evolution (`lib/kb-evolution.ts`)

Confidence tiers: 0.3 tentative → 0.5 moderate → 0.7 strong → 0.9 near-certain.
- **Boost**: +0.1 per pipeline confirmation (cap 0.95)
- **Decay**: -0.02/day after 7-day grace period (floor 0.1)
- **Stale**: 30+ days without confirmation → -0.15 penalty
- **Agent context filter**: Only `moderate+` entries injected into agent prompts
- **API**: `GET/POST /api/knowledge/evolve`

## Pipeline Intelligence (Wave 2)

### Cost-Aware Model Escalation (`pipeline-executor.ts`)
Retry loop auto-escalates to stronger model when score < 6:
`haiku-4-5 → sonnet-4-6 → opus-4-6`. Logged as `[MODEL ESCALATION]`.

### Per-Stage Cost Tracking
`PipelineExecution.tokenUsage[stepId]` accumulates input/output tokens + duration per stage across retries.

### Build Error Resolver (S8.6)
Conditional stage: runs only if S8.5 tech review FAILs. Auto-fixes type errors, imports, null checks.
Constrained: no refactoring, no logic changes, no architecture changes.

### Eval Baselines (`lib/eval-baselines.ts`)
Stores last 20 runs per template in `data/eval-baselines.json`. Compares run N vs N-1:
- Detects regressions (stage score drops > 1 point)
- Tracks best score, average, trend (improving/stable/regressing)
- Logs quality regression warnings to pipeline log

### Reviewer ≠ Author Policy
Gate stages (S2.5, S4.5, S8.5) use `evaluatorOverride: "qa-agent"` — quality evaluation
performed by a different agent than the one that produced/routed the work.
Gate prompts include "INDEPENDENT REVIEWER" framing to reduce approval bias.

## Pipeline Intelligence (Wave 3)

### Continuous Learning (`scripts/hooks/session-learner.mjs`)
Stop hook that auto-extracts patterns from Claude Code sessions into KB.
Detects: TypeScript fixes, build resolutions, hydration issues, workarounds, API patterns.
Accumulates observations in `.session-observations.jsonl`, flushes to KB when threshold (5) reached.
New entries start at confidence 0.3 (tentative).

### pass@k Statistical Verification (`lib/quality-evaluator.ts`)
Gate stages (S2.5, S4.5, S8.5, S11) evaluated k=3 times in parallel.
Requires 2/3 passes (67% confidence) to proceed. Logged as `pass@3: X/3`.
Non-gate stages use single evaluation (k=1) to save cost.

### Parallel DAG Execution (`pipeline-executor.ts`)
Auto-detects when multiple stages become ready simultaneously and runs them in parallel.
S5 (Backend) and S6 (Designer) now run in parallel — Designer depends on arch-gate, not backend.
Gates and checkpoints excluded from auto-parallel. Explicit `isParallel` groups still supported.

```
DAG (post-Wave 3):
S0→S1→S2→S2.5→S3.1→S3.2→S3.3→S3.4→S4→S4.5
                                          ↓
                                  S5 ║ S6 (parallel)
                                     ↘↙
                                     S7
                                      ↓
                              S8→S8.5→[S8.6]→S9→S10→S11→S12
```

## File-Based Storage (`data/`)

| File | Purpose | Max Size |
|------|---------|----------|
| `logs.json` | Activity log entries | 2000 entries |
| `prompt-overrides.json` | Agent system prompt overrides | Per-agent keyed |
| `jira-config.json` | Jira credentials + `defaultProjectKey` (gitignored) | Single object |

Pattern (from `lib/logs-storage.ts`):
- `ensureDataDir()` → `fs.mkdir(DATA_DIR, { recursive: true })`
- Read/write with `fs/promises`
- Newest-first insertion, capped arrays

## Zustand Stores

### `useAppStore` (persisted as `mission-control-app`)
```ts
{ sidebarCollapsed: boolean, commandPaletteOpen: boolean }
```

### `useChatStore` (not persisted)
```ts
{
  activeSessionId: string | null,
  selectedAgentId: string | null,
  messages: Record<string, Message[]>,  // sessionId → messages
  isTyping: boolean
}
```

### `useOrchestrationStore` (persisted as `mission-control-orchestration`)
```ts
{
  workflows: Workflow[],            // persisted
  activeExecution: PipelineExecution | null,
  executionHistory: PipelineExecution[],  // capped at 50
  selectedProject: string | null,   // persisted
  // V2: Slot system
  slots: [WorkflowSlot x4],         // persisted — 4 parallel workspace slots
  activeSlotIndex: 0|1|2|3,         // persisted — currently active slot
}
```

**V2 Slot actions**: `setActiveSlot`, `loadWorkflowToSlot`, `clearSlot`, `updateSlotStatus`, `updateSlotProject`, `updateSlotInput`, `insertStepAtPosition`, `removeStep`, `reorderStep`, `toggleStepDisabled`, `toggleStepParallel`, `duplicateStep`, `duplicateWorkflowToSlot`

## Type System (`types/`)

| File | Key Types |
|------|-----------|
| `agent.ts` | `Agent`, `AgentKPI`, `LLMProvider`, `PromptVersion`, `ExecuteParams` |
| `team.ts` | `Team`, `CreateTeamParams` |
| `session.ts` | `Session`, `Message`, `SessionChannel` |
| `cost.ts` | `CostSummary`, `DailyCost`, `LLMModel` |
| `workflow.ts` | `Workflow`, `WorkflowStep`, `PipelineExecution`, `StepResult`, `WorkflowSlot`, `SlotStatus`, `AgentCatalogEntry`, `AgentDepartment` |
| `log.ts` | `LogEntry`, `CreateLogParams` |
| `api.ts` | `ApiResponse<T>`, `PaginatedResponse<T>` |

LLM Providers: `"anthropic" | "openai" | "google" | "openrouter"`
Session Channels: `"web" | "telegram" | "whatsapp" | "email" | "api"`

## SWR Hooks (`lib/hooks/`)

| Hook | Endpoints |
|------|-----------|
| `useAgents()`, `useAgent(id)` | `/api/agent-hub/agents` |
| `useAgentPrompt(id)`, `usePromptHistory(id)` | `/api/agent-hub/agents/[id]/prompt` |
| `useCosts()` | `/api/agent-hub/costs` + `/costs/daily` |
| `useTeams()` | `/api/agent-hub/teams` |
| `useSessions(agentId)` | `/api/agent-hub/sessions` |
| `useModels()` | `/api/agent-hub/models` |
| `useLogs(filters)` | `/api/logs` |

All use `revalidateOnFocus: false`.

## Shell Layout

```
<RootLayout>                    — fonts, Sonner provider
  <ShellLayout>                 — sidebar + topbar + command palette
    <Sidebar />                 — 8 nav items, collapsible (60px / 16px margin)
    <Topbar />                  — search, connection status
    <CommandPalette />          — Cmd+K agent search
    <main>{children}</main>
  </ShellLayout>
</RootLayout>
```

## Environment Variables

```env
# Agent Hub (required)
AGENT_HUB_API_URL=<backend-url>
AGENT_HUB_API_KEY=<api-key>
AGENT_HUB_LIVE=1              # falsy = offline mode

# OpenAI fallback (required for chat)
OPENAI_API_KEY=<key>

# Jira (optional — can configure via UI at /jira/settings)
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=you@example.com
JIRA_API_TOKEN=<token>
```

## Agent Inventory (16 agents, 3 teams)

### Beauty CRM Pipeline Team (10)
Orchestrator (sonnet-4-6), PM, Architect, Backend (gpt-5.1), Frontend (gpt-5.1), Designer (gemini-2.5-pro), QA, DevOps, Cyber, Research

### Personal/Utility (4)
michael-personal-bot, Email & Calendar Manager, tech-support, assistant

### Herald Sub-agents (2)
avatar-prompter (gpt-4.1-mini), profile-generator (gpt-4.1-mini)

## Beauty CRM Pipeline — V3 (19 stages with Orchestrator Gates)

> **Rule: Task Done threshold = 7.5 for ALL agents. Do NOT lower without explicit approval.**

```
Stage   Agent              Role                   Notes
─────   ─────              ────                   ─────
S0      Research           Market Scan            Raw data collection
S1      Orchestrator       Requirements & Goal    Translates Research → concrete goal
S2      PM                 PRD & Acceptance       "What we build" (AC-1..AC-N)
S2.5    Orchestrator       PRD Validation         ⚠️ GATE 1: is PRD sufficient for Architect?
S3.1    Architect          ADR (Strategy)         Tech choices, rationale
S3.2    Architect          API Contracts          Endpoint definitions (source of truth)
S3.3    Architect          ERD (Data Model)       Entities, relations (not SQL)
S3.4    Architect          File Plan              Execution map for coders
S4      Cyber              Design Audit           Security check on blueprints
S4.5    Orchestrator       Architecture Gate      ⚠️ GATE 2: Plan (S3.4) vs PRD (S2). Mismatch → back to S3.1
S5      Backend            Core Logic             SQL migrations, routes, types
S6      Designer           Visual Tokens          CSS tokens, component specs
S7      Frontend           UI/UX                  Pages wiring Designer + Backend
S8      Technical QA       White Box              Compilation, types, contract compliance
S8.5    Orchestrator       Technical Review       ⚠️ GATE 3: reviews QA logs. Dirty → back to coders
S9      Business QA        Black Box              PRD acceptance criteria check
S10     Cyber Audit        Code Audit             OWASP Top 10 on actual code
S11     Orchestrator       Final Verdict          ⚠️ GATE 4: "Ready for release or scrap?"
S12     Consolidation      Learning               Save experience to knowledge base
```

### Orchestrator Gates (4 checkpoints)

| Gate | Stage | Question | On Fail |
|------|-------|----------|---------|
| Gate 1 | S2.5 | Is PRD complete enough for Architect? | Return to PM (S2) |
| Gate 2 | S4.5 | Does Architecture match PRD scope? | Return to Architect (S3.1) |
| Gate 3 | S8.5 | Is code quality acceptable? | Return to Backend/Frontend (S5-S7) |
| Gate 4 | S11 | Is product ready for release? | Return to any stage or scrap |

### Implementation Order (Sequential)
```
Backend (S5) → Designer (S6) → Frontend (S7)
```
Designer depends on Backend (sees real endpoints).
Frontend depends on Designer + Backend (has both design and API).

### Pipeline Modes (Quick / Medium / Full)

The Smart Router classifies each task and selects the minimum agents needed. Users can override the mode manually via the mode selector in the UI.

| | Quick | Medium | Full |
|---|-------|--------|------|
| **When to use** | Single-domain task: one component, one endpoint, one fix | Multi-domain: feature with API + UI, design + code | Complete lifecycle: new module, payment system, auth flow |
| **Agents** | 1-2 (target only) | 3-5 (target + Architect + PM) | All 10 stages |
| **Upstream deps** | None — agents use `[ASSUMED]` context | Architect + PM included automatically | Full dependency chain |
| **Quality eval** | Skipped (threshold=0) | Final step only (threshold=7) | Every step (threshold=8.5) |
| **Human checkpoint** | No | No | Yes (Stage 4.5) |
| **Estimated tokens** | ~5-10K | ~30-50K | ~100K+ |
| **Estimated time** | ~30-60 sec | ~2-3 min | ~5-10 min |

**Configuration**: `lib/config.ts` → `MODE_CONFIG` constant. Per-mode settings: `qualityThreshold`, `evalScope`, `resolveDeps`, `includeCheckpoint`, `skipAgents`.

**Key files**: `lib/smart-router.ts` (routing + `recalculateForMode`), `lib/pipeline-step-filter.ts` (per-mode threshold assignment), `lib/pipeline-executor.ts` (execution engine).

### Stage Rules
- **Stage 4.5 is BLOCKING** (full mode only) — pipeline MUST NOT proceed without user approval
- **Cyber-Agent is mandatory** when task involves public API, auth, payments, or sensitive data
- **Critical + High Probability risk** → STOP pipeline, report to user immediately
- **Max 2 retries per agent** — if quality score < 5 after 2 attempts → escalate to user
- **Weekly Report** generated every Friday or on demand
- **Quick/Medium mode**: agents that don't receive upstream data mark assumptions with `[ASSUMED]`

### Quality Scoring (Orchestrator applies after each agent output)
Score 1-10 on three axes:
- **Completeness** — all requirements addressed?
- **Specificity** — concrete values, not vague?
- **Actionability** — next agent can work without questions?

Format: `[SCORE] completeness: X, specificity: X, actionability: X → PASS/FAIL`

Per-mode thresholds:
- **Quick**: evaluation skipped entirely (threshold=0, auto-pass)
- **Medium**: final step must score ≥7, other steps auto-pass
- **Full**: every step must score ≥8.5, retries on failure, escalation if score <5 after max retries

### Self-Healing & Quality Gates

Two-layer automatic error correction system. Each layer has its own trigger, scope, and escalation path.

| Layer | Trigger | Max Cycles | Scope | Fallback |
|-------|---------|------------|-------|----------|
| **Architecture Guard** (S3.5) | Cyber CRITICAL (CVSS 9+) | 1 | Architect delta redesign | Escalate to user |
| **Implementation Guard** (S5) | QA FAIL on acceptance criteria | 2 | Targeted agent fix + full regression | Escalate to user |

**Architecture Guard** (`lib/cyber-redesign-loop.ts`):

```
S3.5 Cyber → CRITICAL vulnerability found
  → Pipeline pauses
  → Architect receives targeted redesign prompt:
    - Only the critical findings (not entire architecture)
    - REDESIGN SCOPE: Do NOT change auth flow, DB schema, API paths
      unless directly required by the finding
    - Delta output only (what changed and why)
  → Cyber re-evaluates updated architecture
  → Resolved? → pipeline continues with updated context
  → Still CRITICAL? → escalate to user
```

Severity routing:
- **CRITICAL** (injection, auth bypass, RCE) → triggers redesign cycle
- **HIGH** (missing rate limiting, CSRF) → appended as SECURITY BACKLOG, fixed by DevOps/Backend downstream
- **MEDIUM/LOW** → logged to security report, non-blocking

**Implementation Guard** (`lib/qa-feedback-loop.ts`):

```
S5 QA → VERDICT: FAIL (any P0 or P1 acceptance criteria)
  → Parse acceptance_results JSON → group failures by responsible agent
  → Fix cycle:
    1. Responsible agents get surgical fix prompt (specific AC failures + Architect S3 context)
    2. QA re-validates ALL criteria (full regression, not just failed ones)
    3. Regression detection: previously passing → now failing = auto-P0
  → PASS? → pipeline continues
  → Still FAIL? → cycle 2 (same flow)
  → 2 cycles exhausted? → escalate to user
```

Key files: `lib/qa-feedback-loop.ts`, `lib/cyber-redesign-loop.ts`, `lib/pipeline-executor.ts`, `lib/config.ts` (`MAX_QA_FIX_CYCLES`, `MAX_CYBER_REDESIGN_CYCLES`)

### Structured Output Contracts

Agents exchange structured JSON blocks for machine-parseable data flow:

| Agent | Output Block | Consumer |
|-------|-------------|----------|
| Orchestrator (S1) | `{"questions": [{id, default_answer, assumption_level, user_answer}]}` | PM (risk flags) |
| PM (S2) | `AC-1, AC-2...` sequential IDs with GIVEN/WHEN/THEN | QA (criteria validation) |
| Architect (S3) | API CONTRACTS + DATA MODEL sections | Designer, Backend, Frontend |
| Backend (S4b) | `{"required_env_vars": [{name, description, example, required}]}` | DevOps (.env.example) |
| Designer (S4a) | `{"files": [{path, action, content}]}` — CSS, components | Frontend (design tokens) |
| QA (S5) | `{"acceptance_results": [{criteria_id, status, evidence, severity}]}` | Feedback Loop |
| All code agents | `{"files": [{path, action, content}]}` | Code parser (`lib/code-block-parser.ts`) |

## Jira Governance

### Ticket Ownership
**Only PM-Agent creates Jira tickets.** All other agents provide structured "Jira Handoff" sections:
```
[TICKET] type: Story/Task/Bug
[SEVERITY] Critical/High/Medium/Low
[FINDING] description
[FIX] recommended action
[ESTIMATE] story points suggestion
```

### Story Points (Fibonacci)
| Type | Points |
|------|--------|
| Epic | 13 |
| Story (large) | 8 |
| Story (medium) | 5 |
| Task | 2-3 |
| Bug (Critical) | 0 (immediate) |
| Bug (High) | 3 |

### Sprint Planning
- Sprint capacity: **40-50 story points**
- Flag any story > 8 SP — must be split
- Critical bugs → immediately transition to In Progress
- Before creating tickets: `listProjects` to get projectKey (never hardcode)

### PM Agent Hook (automated)
`POST /api/jira/feature-log` — creates `[AI-Built]` issues with labels `ai-generated`, `auto-logged`. Triggered manually via "log this to Jira" after Checkpoint.

### Pipeline Lifecycle Sync ("The Loop")

`POST /api/jira/sync` — dispatches lifecycle actions from `pipeline-executor.ts` via `lib/jira-sync-service.ts`.

| Pipeline Event | Jira Action |
|----------------|-------------|
| Pipeline start | Create Epic with `[Pipeline]` prefix, labels `ai-pipeline`, `auto-generated` |
| Stage start | Transition → "In Progress", add comment (agent, model) |
| Stage pass | Add comment with QualityScore breakdown, agent, duration, retry count |
| Stage escalation | Add comment with feedback, transition → "To Do" (blocked) |
| Checkpoint reached | Add comment noting pipeline is paused |
| Checkpoint decision | Add comment (approved/rejected + reason) |
| Pipeline complete | Add final summary comment, transition → "Done" or "To Do" |

All sync is **non-blocking** — Jira failures are logged but never stop pipeline execution. Requires `defaultProjectKey` in Jira config.

Key files: `lib/jira-sync-service.ts`, `app/api/jira/sync/route.ts`

## Knowledge Base

Shared learning repository at `agents/agents team/knowledge-base/`:

| File | Purpose | Updated By |
|------|---------|------------|
| `tech-decisions.json` | Architecture Decision Records | Architect, DevOps |
| `architecture-patterns.json` | Reusable patterns and anti-patterns | Architect, Backend |
| `security-playbook.json` | Threat responses and recurring vulns | Cyber, QA |
| `failure-patterns.json` | Known issues, root causes, solutions | QA, all agents |

Agents MUST check knowledge base before proposing solutions to avoid repeating past mistakes.

### Auto-Enrichment ("The Memory")

After every pipeline completion (success or failure), `pipeline-executor.ts` fires `POST /api/knowledge/enrich` with the full `PipelineExecution`. The enrichment flow:

1. **Orchestrator extracts lessons** — analyzes step results, retries, escalations, quality scores
2. **Structured parsing** — lessons are typed as `failure-pattern`, `tech-decision`, `architecture-pattern`, `anti-pattern`, or `security-vuln`
3. **Deduplication** — 70% word-overlap check against existing entries before writing
4. **File write** — appends to the correct JSON file with auto-incremented IDs

Fallback: If Orchestrator is unavailable, mechanical extraction creates failure patterns from retried/escalated steps.

Key file: `lib/knowledge-manager.ts`

## Aura Design System (Beauty CRM product)

> Note: Mission Control UI uses Syne + Space Mono. Aura is for the CRM product.

| Token | Value |
|-------|-------|
| Primary | `#7C3AED` |
| Secondary | `#06B6D4` |
| Fonts | Manrope (headings), Inter (body) |
| Grid | 4px base |
| Touch targets | min 44px |
| Contrast | body min 4.5:1, large text min 3:1 (WCAG AA) |

## Workflow V2 — Slot System + Dynamic Builder

> Added 2026-03-19. Branch: `feature/workflow-v2-slots`

### Overview

The Orchestration page was upgraded from a single-workflow sidebar to a multi-slot workspace with dynamic pipeline construction. Users can run up to 4 workflows in parallel slots, add/remove/reorder agents via drag-and-drop and context menus, and compose parallel stages from the Recruitment Center.

### Architecture

```
SlotBar (header)          — 4 bookmark slots, status indicators, progress bars
TemplateLibrary (sidebar) — saved templates vs user workflows, drag-to-slot zones
PipelineGraph (main)      — stage nodes + InsertStepButton + drag reorder + context menu
RecruitmentCenter (modal) — 16 agents / 5 departments, single + parallel multi-select
AgentPreviewCard (hover)  — avgScore, avgDuration, successRate from execution history
StageContextMenu (right-click) — remove, enable/disable, make parallel, duplicate
```

### New Types (`types/workflow.ts`)

| Type | Purpose |
|------|---------|
| `WorkflowSlot` | `{ id: 0-3, workflowId, workflowName, status, projectContext, lastInput, executionId, progress }` |
| `SlotStatus` | `"empty" \| "idle" \| "running" \| "paused" \| "failed"` |
| `AgentCatalogEntry` | `{ agentId, agentName, department, description, model, provider, qualityThreshold }` |
| `AgentDepartment` | `"Strategy" \| "Engineering" \| "Security" \| "Support" \| "Herald"` |
| `Workflow.isTemplate` | Optional flag — separates templates from user workflows in the library |
| `StageMetadata.disabled` | Optional — visually dims and skips the stage during execution |

### New Files

| File | Purpose |
|------|---------|
| `lib/agent-catalog.ts` | 16 agents grouped into 5 departments. Exports `AGENT_CATALOG`, `DEPARTMENTS`, `getAgentsByDepartment()`, `getAgentById()` |
| `components/orchestration/slot-bar.tsx` | 4 bookmark slots — empty=(+), occupied=name+status+progress |
| `components/orchestration/template-library.tsx` | Left sidebar with template/workflow split, load-to-slot, save-as-template, drag-to-slot drop zones, quick duplicate |
| `components/orchestration/recruitment-center.tsx` | Modal: department tabs, search, agent cards, multi-select for parallel stages |
| `components/orchestration/insert-step-button.tsx` | (+) button between pipeline stages, hover-reveal |
| `components/orchestration/agent-preview-card.tsx` | Hover card with agent stats (avgScore, avgDuration, successRate, totalRuns) computed from execution history |
| `components/orchestration/stage-context-menu.tsx` | Right-click menu: Remove, Enable/Disable, Make Parallel/Sequential, Duplicate |

### Modified Files

| File | Changes |
|------|---------|
| `types/workflow.ts` | Added `WorkflowSlot`, `SlotStatus`, `AgentCatalogEntry`, `AgentDepartment`, `Workflow.isTemplate`, `StageMetadata.disabled` |
| `lib/stores/orchestration-store.ts` | Added `slots[4]`, `activeSlotIndex`, 12 new slot/step actions (see store section above), all persisted to localStorage |
| `components/orchestration/stage-node.tsx` | Hover preview (400ms delay), context menu, drag-to-reorder, disabled visual (opacity+grayscale+strike), expanded agent icon map |
| `components/orchestration/parallel-branch.tsx` | Passes through executionHistory, context menu, drag events, disabled state |
| `components/orchestration/pipeline-graph.tsx` | InsertStepButton between groups, drag-to-reorder via HTML5 DnD, right-click StageContextMenu, executionHistory pass-through |
| `app/(shell)/orchestration/page.tsx` | Header→SlotBar, sidebar→TemplateLibrary, slot-derived workflow state, per-slot input/project sync, Recruit button, parallel agent add, drag-to-slot, quick duplicate |

### Agent Catalog — 5 Departments

| Department | Agents | Color |
|------------|--------|-------|
| Strategy | Orchestrator, PM-Agent, Research-Agent | violet |
| Engineering | Architect, Backend, Frontend, Designer, DevOps | blue |
| Security | Cyber-Agent, QA-Agent | red |
| Support | Personal Bot, Email & Calendar, Tech Support, Assistant | emerald |
| Herald | Avatar Prompter, Profile Generator | amber |

### Slot Lifecycle

```
Empty slot → user clicks (+) or drags workflow from Library
  → loadWorkflowToSlot() → status: "idle"
  → user types task + clicks Route → Smart Router → Execute
  → status: "running" (progress bar updates)
  → completion → status: "idle", executionId set
  → clearSlot() → status: "empty"
```

Slots persist across page reloads via Zustand `persist` middleware (localStorage key: `mission-control-orchestration`).

### Interaction Matrix

| Action | Trigger | Handler |
|--------|---------|---------|
| Add agent to pipeline | Click in Recruitment Center | `handleAddAgent()` → `insertStepAtPosition()` |
| Add parallel stage | Multi-select in Recruitment Center | `handleAddParallelAgents()` → multiple `insertStepAtPosition()` with shared group |
| Insert between stages | Click (+) button in pipeline | `handleInsertAtPosition()` → opens Recruitment Center |
| Remove stage | Right-click → Remove | `removeStep()` |
| Disable/enable stage | Right-click → Disable/Enable | `toggleStepDisabled()` |
| Make parallel | Right-click → Make Parallel | `toggleStepParallel()` |
| Duplicate stage | Right-click → Duplicate | `duplicateStep()` |
| Reorder stages | Drag & drop in pipeline | `reorderStep()` |
| Clone workflow to slot | Copy button in Library | `duplicateWorkflowToSlot()` |
| Drag workflow to slot | Drag from Library → drop zone | `handleDropToSlot()` → `loadWorkflowToSlot()` |
| Save as template | Template button in Library | `handleSaveAsTemplate()` → `addWorkflow({ isTemplate: true })` |
| Hover agent preview | Mouse hover on stage node (400ms) | `AgentPreviewCard` with computed stats |
