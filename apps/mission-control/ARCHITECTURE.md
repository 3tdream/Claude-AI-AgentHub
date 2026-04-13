# Mission Control — Architecture

AI Agent Management Platform. 13 pages, 65+ API routes, 16 agents across 3 teams.

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
| AI SDKs | Anthropic SDK, OpenAI SDK |

## Data Flow

```
Browser → /api/* routes → Agent Hub REST API (primary)
                        → Anthropic Claude API (fallback 1)
                        → OpenAI API (fallback 2)
                        → Jira REST API
                        → data/*.json (local storage)
```

## Pages

| Route | Purpose |
|-------|---------|
| `/home` | **Main page** — agent fleet grid, pipeline execution panel, per-agent chat, activity feed |
| `/dashboard` | Agent KPI table |
| `/teams`, `/teams/[id]` | Organize agents into teams |
| `/logs` | Activity timeline (chat, decision, manual, system) |
| `/costs` | Spending dashboard with daily charts + provider breakdown |
| `/analytics` | Pipeline quality trends, retry distribution, status breakdown, execution history |
| `/health` | System health — API status, agent connectivity, service checks |
| `/knowledge` | Knowledge Base browser — global + per-project entries, confidence, evolution |
| `/jira`, `/jira/settings` | Issue tracker + credential setup |
| `/projects` | Project discovery, active projects, context loader |
| `/integrations` | External integrations management |
| `/guide` | Platform usage guide |
| `/settings` | App settings — theme, toast, defaults, execution mode |

## API Routes

### Agent Hub Proxy (`/api/agent-hub/*`)

All routes proxy through `agentHubFetch()` with cached fallback on failure.

| Route | Methods | Notes |
|-------|---------|-------|
| `/agents` | GET, POST | List/create |
| `/agents/[id]` | GET, PATCH, DELETE | CRUD |
| `/agents/[id]/prompt` | GET, PUT | System prompt + version history |
| `/teams` | GET, POST | Team CRUD |
| `/teams/[id]` | GET, PATCH, DELETE | Team CRUD |
| `/teams/[id]/agents` | GET | Agents in team |
| `/costs` | GET | Summary (total, by provider, by model) |
| `/costs/daily` | GET | 30-day rolling |
| `/sessions` | GET, POST | Session management |
| `/sessions/[id]` | GET, DELETE | Session CRUD |
| `/sessions/[id]/messages` | GET, POST | Messages |
| `/models` | GET | Available LLM models |
| `/execute` | POST | Agent Hub execute endpoint |

### Chat & AI Execution

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/chat` | POST | 3-tier streaming: Agent Hub → Anthropic Claude → OpenAI (see below) |
| `/api/ai/execute` | POST | Direct AI execution — standard (single prompt) or tool-enabled (multi-turn with file system access) |
| `/api/command` | POST | Unified command — intent classifier decides direct/pipeline/hybrid, Claude + file tools + KB |
| `/api/intent-test` | POST | Intent classifier testing endpoint |

### Pipeline

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/pipeline/route` | POST | Smart routing + simulation — classifies task, selects mode and agents |
| `/api/pipeline/simulate` | POST | Pipeline simulation (dry run) |
| `/api/pipeline/stats` | GET | Pipeline execution statistics |
| `/api/pipeline/baselines` | GET, POST | Eval baselines — quality tracking, run comparison, regression detection |
| `/api/pipeline/replay` | GET, POST | Execution log replay — load and step through past runs |
| `/api/pipeline/analytics` | GET, POST | Pipeline analytics — quality trends, stage performance |
| `/api/pipeline/cache` | GET, POST | Pipeline execution cache |
| `/api/pipeline/contracts` | GET, POST | Stage contract definitions |
| `/api/pipeline/replan` | POST | Pipeline replanning — adjust mid-flight |
| `/api/pipeline/evolution` | GET, POST | Pipeline evolution tracking |

### Knowledge Base

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/knowledge-base` | GET, POST | KB CRUD — global entries |
| `/api/knowledge-base/projects` | GET, POST | Cross-project KB — per-project scoped entries |
| `/api/knowledge-base/sync` | POST | Sync KB between project and global layers |
| `/api/knowledge-base/validate` | POST | KB entry validation |
| `/api/knowledge/enrich` | POST | Auto-enriches KB from completed pipeline execution |
| `/api/knowledge/evolve` | GET, POST | KB confidence evolution — boost/decay, aging, health report |
| `/api/knowledge/feedback` | POST | KB feedback loop — user confirmations/rejections |
| `/api/knowledge/success` | POST | Success pattern extraction |

### Orchestration

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/orchestration/apply` | POST | Auto-Apply: writes parsed code blocks from pipeline output to filesystem |
| `/api/orchestration/deploy` | POST | Smart deploy — path resolution + deployment execution |

### Projects

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/projects/discover` | GET | Project discovery — scans apps/ directory for projects |
| `/api/projects/context` | GET | Project context summary |
| `/api/projects/context/load` | POST | Full project context loader — files, structure, dependencies |
| `/api/projects/list` | GET | List active/known projects |
| `/api/projects/toggle` | POST | Toggle project active status |
| `/api/projects/server` | GET | Server-side project info |

### System

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/system/health` | GET | System health check — API connectivity, service status |
| `/api/system/version` | GET | Version info |
| `/api/system/config` | GET | System configuration |
| `/api/system/config/update` | POST | Update system configuration |
| `/api/system/deploy-check` | GET | Pre-deploy validation checks |

### Costs

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/costs/real` | GET, POST | Real cost tracking — actual API spend per provider |
| `/api/costs/anthropic` | GET | Anthropic-specific cost breakdown |

### Agents

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/agents/performance` | GET | Agent performance stats — scores, durations, success rates |
| `/api/agents/evolve` | POST | Agent evolution — model/config recommendations based on history |

### Skills

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/skills/route` | POST | Skill routing — maps intent to skill |
| `/api/skills/proposals` | GET, POST | Skill proposals — suggested new skills |

### Jira

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/jira/config` | GET, PUT | Credential management (includes `defaultProjectKey`) |
| `/api/jira/config/test` | GET | Test Jira connection |
| `/api/jira/projects` | GET | List Jira projects |
| `/api/jira/issues` | GET, POST | Search/create issues |
| `/api/jira/feature-log` | POST | PM Agent hook — creates `[AI-Built]` Jira issue |
| `/api/jira/sync` | POST | Pipeline lifecycle sync |

### Other

| Route | Methods | Notes |
|-------|---------|-------|
| `/api/logs` | GET, POST | File-based log storage |
| `/api/integrations` | GET, POST | Integration management |
| `/api/integrations/test` | POST | Test integration connectivity |
| `/api/admin/users` | GET, POST | User administration |

## 3-Tier Chat Source

`POST /api/chat` implements a three-tier fallback:

1. **Tier 1 — Agent Hub**: Calls `executeAgent()` → SSE response. Header: `X-Chat-Source: agent-hub`
2. **Tier 2 — Anthropic Claude**: On Agent Hub failure, loads system prompt, streams via Anthropic SDK with model mapping. Header: `X-Chat-Source: anthropic`
3. **Tier 3 — OpenAI**: On Anthropic failure, streams via OpenAI SDK (`gpt-4.1-mini`). Header: `X-Chat-Source: openai-fallback`

Tool-enabled agents (backend, frontend, qa, devops, cyber) get a CHAT mode disclaimer — file tools only available via Pipeline or `/api/ai/execute`.

```
POST /api/chat { agentId, messages[] }
  → Try: agentHubFetch(/{assistantId}/workspace-execute)
  → Catch: Anthropic streaming with cached system prompt
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

## Home Page — Component Architecture

The Home page (`/home`) is the main interface, split into 16 component files in `components/home/`:

```
components/home/
├── agent-card.tsx         — Individual agent card in the fleet grid
├── agent-panel.tsx        — Right panel: agent detail (tabs for chat, config, prompt, sessions)
├── chat-tab.tsx           — Per-agent chat with 3-tier streaming
├── checkpoint-bar.tsx     — Pipeline checkpoint approval/rejection UI
├── config-tab.tsx         — Agent configuration editor
├── execution-bar.tsx      — Pipeline execution progress bar
├── log-entry.tsx          — Single activity log entry
├── metric-box.tsx         — KPI metric display box
├── new-agent-panel.tsx    — Create new agent form
├── pipeline-history.tsx   — Past pipeline execution list
├── pipeline-input.tsx     — Task input + mode selector + route button
├── pipeline-panel.tsx     — Pipeline execution panel (orchestrates sub-components)
├── project-dropdown.tsx   — Active project selector dropdown
├── prompt-tab.tsx         — Agent system prompt editor
├── sessions-tab.tsx       — Agent session history browser
└── status-pill.tsx        — Agent status indicator pill
```

## Claude Code Hooks (`scripts/hooks/`)

| Hook | File | Lifecycle | Purpose |
|------|------|-----------|---------|
| Memory Persist | `memory-persist.mjs`, `memory-persist.sh` | SessionStart / Stop | Auto-save/load session context (project, KB stats) |
| Commit Quality | `commit-quality.sh` | PreToolUse (Bash) | Block secrets, warn console.log, validate commit format |
| Suggest Compact | `suggest-compact.sh` | PreToolUse (Bash) | Count tool calls, suggest /compact at 50/80/100 |
| TypeCheck Stop | `typecheck-stop.sh` | Stop | Run `tsc --noEmit` on modified TS files after each response |
| Session Learner | `session-learner.mjs` | Stop | Auto-extract patterns from Claude Code sessions into KB |

## Pipeline Architecture — V3 (19 stages, 4 gates)

### Pipeline Engine (`lib/pipeline-executor.ts`)

Core subsystems imported by the executor:

| Module | Purpose |
|--------|---------|
| `quality-evaluator.ts` | Score evaluation + pass@k (k=3 for gates) + retry prompt builder |
| `config.ts` | `PIPELINE`, `AGENT_CONFIG`, `MODE_CONFIG`, `TOOL_OUTPUT_LIMITS` |
| `pipeline-runner-cyber.ts` | Cyber redesign loop (Gate architecture guard) |
| `pipeline-runner-qa.ts` | QA feedback loop (Implementation guard) |
| `output-continuation.ts` | Truncation detection + output continuation |
| `stage-contracts.ts` | Contract prompt injection + validation + KB entries for contracts |
| `stage-output-schema.ts` | JSON schema validation + context injection validation |
| `kb-agent-context.ts` | KB context builder per agent |
| `project-context-loader.ts` | Project file/structure context loading |
| `failure-investigator.ts` | Pre-retry failure diagnosis (8 categories) |
| `design-validator.ts` | Design-to-code compliance checker |
| `confidence-gate.ts` | Per-stage confidence scoring + early termination |
| `budget-manager.ts` | Per-stage budget caps + cost calculation + model downgrade suggestions |
| `execution-logger.ts` | Full execution recording for replay |
| `stores/activity-store.ts` | Real-time activity event feed |

### Pipeline Features

**Model Escalation Chain**: `haiku-4-5 → sonnet-4-6 → opus-4-6`. Auto-escalates when score < threshold after retry. Logged as `[MODEL ESCALATION]`.

**Confidence Scoring + Early Termination**: Agents self-report confidence (0-1). Per-stage thresholds: critical stages 0.6, gates 0.5, others 0.4. Low confidence triggers model escalation or pipeline pause.

**Per-Stage Budget Caps**: USD caps per stage (planning $1, implementation $3, gates $0.50). Tracks cumulative spend using Anthropic 2025 pricing. Over-budget → suggest model downgrade or pause.

**Failure Taxonomy** (8 categories + unknown):
- `wrong_directory` — agent searched/read wrong path
- `no_edits` — implementation agent stuck in read-only loop
- `truncation` — output cut mid-file
- `tool_error` — permission or missing file errors
- `low_quality` — quality score too low
- `infra` — infrastructure/timeout issues
- `hallucination` — fabricated files or APIs
- `budget_exceeded` — stage budget exhausted
- `context_missing` — upstream context not available

**Design-to-Code Validator**: Checks frontend output against designer specs — CSS property usage, component name consistency, design token adherence. Returns compliance score 0-100.

**Execution Logger + Replay**: Records full per-stage data (input prompt, output, tool calls, model, tokens, duration, confidence). Saved to `data/execution-logs/`. Replay via `/api/pipeline/replay`.

**Ownership Feedback Loop**: After pipeline completion, `POST /api/knowledge/enrich` extracts lessons. Failure patterns, tech decisions, and architecture patterns are deduplicated (70% word overlap) and written to KB with auto-incremented IDs.

### Parallel DAG Execution

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

### Stage Table

> **Rule: Task Done threshold = 7.5 for ALL agents. Do NOT lower without explicit approval.**

```
Stage   Agent              Role                   Notes
─────   ─────              ────                   ─────
S0      Research           Market Scan            Raw data collection
S1      Orchestrator       Requirements & Goal    Translates Research → concrete goal
S2      PM                 PRD & Acceptance       "What we build" (AC-1..AC-N)
S2.5    Orchestrator       PRD Validation         GATE 1: is PRD sufficient for Architect?
S3.1    Architect          ADR (Strategy)         Tech choices, rationale
S3.2    Architect          API Contracts          Endpoint definitions (source of truth)
S3.3    Architect          ERD (Data Model)       Entities, relations (not SQL)
S3.4    Architect          File Plan              Execution map for coders
S4      Cyber              Design Audit           Security check on blueprints
S4.5    Orchestrator       Architecture Gate      GATE 2: Plan (S3.4) vs PRD (S2). Mismatch → back to S3.1
S5      Backend            Core Logic             SQL migrations, routes, types
S6      Designer           Visual Tokens          CSS tokens, component specs (parallel with S5)
S7      Frontend           UI/UX                  Pages wiring Designer + Backend
S8      Technical QA       White Box              Compilation, types, contract compliance
S8.5    Orchestrator       Technical Review       GATE 3: reviews QA logs. Dirty → back to coders
S9      Business QA        Black Box              PRD acceptance criteria check
S10     Cyber Audit        Code Audit             OWASP Top 10 on actual code
S11     Orchestrator       Final Verdict          GATE 4: "Ready for release or scrap?"
S12     Consolidation      Learning               Save experience to knowledge base
```

### Orchestrator Gates (4 checkpoints)

| Gate | Stage | Question | On Fail |
|------|-------|----------|---------|
| Gate 1 | S2.5 | Is PRD complete enough for Architect? | Return to PM (S2) |
| Gate 2 | S4.5 | Does Architecture match PRD scope? | Return to Architect (S3.1) |
| Gate 3 | S8.5 | Is code quality acceptable? | Return to Backend/Frontend (S5-S7) |
| Gate 4 | S11 | Is product ready for release? | Return to any stage or scrap |

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
- **Max 3 retries per agent** — smart retry stops if score doesn't improve by 0.5 after 2 attempts
- **pass@k for gates** — k=3 evaluations in parallel, 2/3 must pass (67% confidence)
- **Quick/Medium mode**: agents that don't receive upstream data mark assumptions with `[ASSUMED]`

### Quality Scoring (Orchestrator applies after each agent output)

Score 1-10 on four axes (weighted per-agent via `AGENT_SCORING_WEIGHTS`):
- **Task** — core task completion
- **Completeness** — all requirements addressed?
- **Specificity** — concrete values, not vague?
- **Actionability** — next agent can work without questions?

Per-mode thresholds:
- **Quick**: evaluation skipped entirely (threshold=0, auto-pass)
- **Medium**: final step must score >=7, other steps auto-pass
- **Full**: every step must score >=8.5, retries on failure, escalation if score <5 after max retries

### Self-Healing & Quality Gates

Two-layer automatic error correction system.

| Layer | Trigger | Max Cycles | Scope | Fallback |
|-------|---------|------------|-------|----------|
| **Architecture Guard** (S3.5) | Cyber CRITICAL (CVSS 9+) | 1 | Architect delta redesign | Escalate to user |
| **Implementation Guard** (S5) | QA FAIL on acceptance criteria | 2 | Targeted agent fix + full regression | Escalate to user |

**Architecture Guard** (`lib/pipeline-runner-cyber.ts`):
```
S3.5 Cyber → CRITICAL vulnerability found
  → Pipeline pauses
  → Architect receives targeted redesign prompt (delta only)
  → Cyber re-evaluates updated architecture
  → Resolved? → pipeline continues
  → Still CRITICAL? → escalate to user
```

**Implementation Guard** (`lib/pipeline-runner-qa.ts`):
```
S5 QA → VERDICT: FAIL (any P0 or P1 acceptance criteria)
  → Parse acceptance_results → group failures by responsible agent
  → Fix cycle: surgical fix prompt → QA re-validates ALL criteria (full regression)
  → Regression detection: previously passing → now failing = auto-P0
  → 2 cycles exhausted? → escalate to user
```

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

JSON schema validation via `lib/stage-output-schema.ts` — validates structure and context injection completeness.

## Command & Intent System

`POST /api/command` is the unified entry point for natural-language commands:

1. **Intent classifier** (`lib/intent-classifier.ts`) analyzes input → `direct | pipeline | hybrid`
2. **Direct mode**: Claude + file tools (`lib/agent-tools.ts`) + KB search + project context
3. **Pipeline mode**: Returns routing decision, UI redirects to pipeline execution
4. **Hybrid mode**: Quick AI answer + suggests pipeline for full implementation

Testing endpoint: `POST /api/intent-test` for classifier accuracy validation.

## File-Based Storage (`data/`)

| File | Purpose | Max Size |
|------|---------|----------|
| `logs.json` | Activity log entries | 2000 entries |
| `prompt-overrides.json` | Agent system prompt overrides | Per-agent keyed |
| `jira-config.json` | Jira credentials + `defaultProjectKey` (gitignored) | Single object |
| `api-keys.json` | API key storage (gitignored) | Single object |
| `active-projects.json` | Active project list | Array |
| `project-state.json` | Project state and configuration | Per-project keyed |
| `costs-config.json` | Cost tracking configuration | Single object |
| `pipeline-analytics.json` | Pipeline execution analytics data | Array |
| `.session-state.json` | Claude Code session state (hooks) | Single object |
| `execution-logs/` | Full pipeline execution logs for replay | Per-run files |

Pattern (from `lib/logs-storage.ts`):
- `ensureDataDir()` → `fs.mkdir(DATA_DIR, { recursive: true })`
- Read/write with `fs/promises`
- Newest-first insertion, capped arrays

## Zustand Stores

### `useAppStore` (persisted as `mission-control-app`)
```ts
{
  sidebarCollapsed: boolean,
  collapsedNavGroups: string[],
  commandPaletteOpen: boolean,
  settings: {
    theme: "light" | "dark" | "system",
    toastPosition: ToastPosition,
    soundEnabled: boolean,
    defaultExecutionMode: ExecutionMode,
    defaultProjectContext: string,
  },
  activeProjectId: string | null,   // global project selector
}
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

### `useActivityStore` (not persisted)
```ts
{
  events: ActivityEvent[],  // real-time pipeline activity feed
  // ActivityType: kb_read | kb_write | kb_search | contract_load | contract_validate |
  //   simulation | replan | skill | agent | routing | system | schema_validate |
  //   confidence_gate | budget_warn | budget_pause | design_validate
}
```

## Type System (`types/`)

| File | Key Types |
|------|-----------|
| `agent.ts` | `Agent`, `AgentKPI`, `LLMProvider`, `PromptVersion`, `ExecuteParams` |
| `team.ts` | `Team`, `CreateTeamParams` |
| `session.ts` | `Session`, `Message`, `SessionChannel` |
| `cost.ts` | `CostSummary`, `DailyCost`, `LLMModel` |
| `costs.ts` | Real cost tracking types |
| `workflow.ts` | `Workflow`, `WorkflowStep`, `PipelineExecution`, `StepResult`, `WorkflowSlot`, `SlotStatus`, `AgentCatalogEntry`, `AgentDepartment`, `ExecutionMode` |
| `knowledge-base.ts` | `KBEntry`, `KBEntryWithLayer`, `KBCategory`, `KBScope` |
| `stage-contract.ts` | Stage contract definitions |
| `strategy.ts` | Strategy types |
| `log.ts` | `LogEntry`, `CreateLogParams` |
| `api.ts` | `ApiResponse<T>`, `PaginatedResponse<T>` |
| `index.ts` | Re-exports + shared types (`AgentStatus`, `AgentRole`, `PipelineAgent`, `Pipeline3DData`) |

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
| `useMobileNav()` | Client-only — mobile nav state |

All use `revalidateOnFocus: false`.

## Shell Layout

```
<RootLayout>                    — fonts, Sonner provider
  <ShellLayout>                 — sidebar + topbar + command palette
    <Sidebar />                 — 13 nav items, collapsible (60px / 16px margin)
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

# Anthropic (required for chat tier 2 + pipeline execution)
ANTHROPIC_API_KEY=<key>

# OpenAI fallback (required for chat tier 3)
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

### Per-Agent Configuration (`AGENT_CONFIG`)

All 10 pipeline agents configured in `lib/config.ts`:

| Agent | Quality Threshold | Max Turns | Read Budget | Special |
|-------|------------------|-----------|-------------|---------|
| research-agent | 7.5 | 4 | 5 | word limit 4000 |
| orchestrator | 7.5 | 4 | 5 | word limit 4000 |
| pm-agent | 7.5 | 5 | 8 | word limit 4000 |
| architect-agent | 7.5 | 5 | 5 | word limit 4000 |
| cyber-agent | 7.5 | 6 | 10 | word limit 4000 |
| backend-agent | 7.5 | 5 | 5 | diff limits: edit 50, create 120, hard 250 |
| frontend-agent | 7.5 | 5 | 5 | diff limits: edit 30, create 80, hard 150 |
| designer-agent | 7.5 | 5 | 5 | word limit 4000 |
| qa-agent | 7.5 | 10 | 15 | word limit 4000 |
| devops-agent | 7.5 | 7 | 10 | — |

## KB Evolution (`lib/kb-evolution.ts`)

Confidence tiers: 0.3 tentative → 0.5 moderate → 0.7 strong → 0.9 near-certain.
- **Boost**: +0.1 per pipeline confirmation (cap 0.95)
- **Decay**: -0.02/day after 7-day grace period (floor 0.1)
- **Stale**: 30+ days without confirmation → -0.15 penalty
- **Agent context filter**: Only `moderate+` entries injected into agent prompts
- **API**: `GET/POST /api/knowledge/evolve`

### Two-Layer Knowledge Base

| Layer | Storage | Scope |
|-------|---------|-------|
| Global | `data/knowledge-base/*.json` | Cross-project patterns, shared across all pipeline runs |
| Project | `projects/{id}/knowledge-base/*.json` | Project-specific patterns, promotable to global |

Categories: `failure-patterns`, `success-patterns`, `security-playbook`, `architecture-patterns`, `tech-decisions`

KB types (`types/knowledge-base.ts`): `KBEntry` (core), `KBEntryWithLayer` (merged results with `_layer` annotation), `KBCategory`, `KBScope` (global | project).

### Nightly Evolution (PM2 cron)

Scheduled KB maintenance:
- **Confidence decay**: -0.02/day for entries not confirmed in 7+ days
- **Stale penalty**: -0.15 for entries unconfirmed 30+ days
- **Pattern extraction**: Auto-extract lessons from recent pipeline runs
- **Health report**: Summary of KB health (entry counts, avg confidence, stale entries)

### Continuous Learning (`scripts/hooks/session-learner.mjs`)

Stop hook that auto-extracts patterns from Claude Code sessions into KB.
Detects: TypeScript fixes, build resolutions, hydration issues, workarounds, API patterns, user corrections.
Accumulates observations in `data/.session-observations.jsonl`, flushes to KB when threshold (5) reached.
New entries start at confidence 0.3 (tentative).

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

### Overview

The Orchestration page has a multi-slot workspace with dynamic pipeline construction. Users can run up to 4 workflows in parallel slots, add/remove/reorder agents via drag-and-drop and context menus, and compose parallel stages from the Recruitment Center.

### Architecture

```
SlotBar (header)          — 4 bookmark slots, status indicators, progress bars
TemplateLibrary (sidebar) — saved templates vs user workflows, drag-to-slot zones
PipelineGraph (main)      — stage nodes + InsertStepButton + drag reorder + context menu
RecruitmentCenter (modal) — 16 agents / 5 departments, single + parallel multi-select
AgentPreviewCard (hover)  — avgScore, avgDuration, successRate from execution history
StageContextMenu (right-click) — remove, enable/disable, make parallel, duplicate
```

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
