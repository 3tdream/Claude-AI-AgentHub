# Mission Control — Architecture

AI Agent Management Platform. 8 feature areas, 19 API routes, 16 agents across 3 teams.

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
  executionHistory: PipelineExecution[]  // capped at 50
}
```

## Type System (`types/`)

| File | Key Types |
|------|-----------|
| `agent.ts` | `Agent`, `AgentKPI`, `LLMProvider`, `PromptVersion`, `ExecuteParams` |
| `team.ts` | `Team`, `CreateTeamParams` |
| `session.ts` | `Session`, `Message`, `SessionChannel` |
| `cost.ts` | `CostSummary`, `DailyCost`, `LLMModel` |
| `workflow.ts` | `Workflow`, `WorkflowStep`, `PipelineExecution`, `StepResult` |
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

## Beauty CRM Pipeline — 10-Stage Execution

```
Stage 0   Research-Agent      Market research, competitor analysis (before everything)
Stage 1   Orchestrator        Clarify requirements (5-10 questions to user)
Stage 2   PM-Agent            Product Definition + Jira epic/story setup
Stage 3   Architect-Agent     System Architecture + ADRs
Stage 3.5 Cyber-Agent         Threat Model (MANDATORY if public API / auth / payments)
Stage 4   PARALLEL            Backend-Agent + Frontend-Agent + Designer-Agent
Stage 4.5 Orchestrator        ⚠️ HUMAN CHECKPOINT — must wait for user confirmation
Stage 5   QA-Agent            Attack Plan (minimum 12 findings required)
Stage 5.5 Cyber-Agent         Deep Security Audit
Stage 6   DevOps-Agent        Infrastructure + CI/CD + rollback plan
Stage 7   Orchestrator        Final Consolidation + Weekly Report
```

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
