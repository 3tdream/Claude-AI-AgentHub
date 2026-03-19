# Mission Control Pipeline — System Guide v3.0

> Last updated: 2026-03-19 | Medium mode COMPLETED (37.9s) | Backend 9.2/10

## Architecture

```
User Input → Smart Router → [quick/medium/full] → Pipeline Executor
                                                        │
                    13 Stages (sequential + parallel groups)
                    ┌──────────────────────────────────────┐
                    │ s0  Research        (sonnet, no tools)│
                    │ s1  Orchestrator    (sonnet, read)    │
                    │ s2  PM             (sonnet, read)    │
                    │ s3  Architect      (opus, read+save) │
                    │ s3.5 Cyber         (opus, read+save) │
                    │ s4  Backend        (sonnet, RW tools)│
                    │ s4  Frontend       (sonnet, RW tools)│
                    │ s4  Designer       (sonnet, no tools)│
                    │ s4.5 Checkpoint    (human approval)  │
                    │ s5  QA             (sonnet, RW+save) │
                    │ s5.5 Cyber Audit   (opus, RW+save)   │
                    │ s6  DevOps         (sonnet, RW tools)│
                    │ s7  Consolidation  (sonnet, no tools)│
                    └──────────────────────────────────────┘
                                    │
                    Quality Engine (per stage):
                    ├─ 4-axis scoring (task/comp/spec/act)
                    ├─ Per-agent weights + thresholds
                    ├─ Tool call visibility in evaluator
                    ├─ Smart retry (stop on degradation)
                    ├─ Hard enforcement (no edit → score 0)
                    ├─ Read loop kill switch
                    └─ Escalation → pipeline paused
                                    │
                    Persistence:
                    ├─ Task Cache (reuse past outputs)
                    ├─ Learning DB (per-agent stats)
                    ├─ Success Patterns (what works)
                    ├─ Failure Patterns (what breaks)
                    ├─ Pipeline Resume / Pause / Stop
                    └─ Staging Area → Deploy
```

## Agent Configuration

| Stage | Agent | Model | Threshold | MaxTurns | ReadBudget | Weights (T/C/S/A) |
|-------|-------|-------|-----------|----------|------------|-------------------|
| s0 | Research | sonnet | 7.0 | 4 | 5 | 40/30/20/10 |
| s1 | Orchestrator | sonnet | 7.0 | 4 | 5 | 40/20/10/30 |
| s2 | PM | sonnet | 7.3 | 5 | 8 | 45/35/10/10 |
| s3 | Architect | opus | 8.3 | 7 | 20 | 50/10/15/25 |
| s3.5 | Cyber | opus | 8.0 | 6 | 30 | 60/20/10/10 |
| s4 | Backend | sonnet | 7.5 | 5 | 2 | 70/10/10/10 |
| s4 | Frontend | sonnet | 7.5 | 5 | 2 | 70/10/10/10 |
| s4 | Designer | sonnet | 7.5 | 4 | 5 | 50/20/20/10 |
| s5 | QA | sonnet | 8.0 | 10 | 15 | 60/10/10/20 |
| s5.5 | Cyber Audit | opus | 8.0 | 6 | 30 | 60/20/10/10 |
| s6 | DevOps | sonnet | 7.5 | 7 | 10 | 70/10/10/10 |
| s7 | Consolidation | sonnet | 0 | 3 | 5 | 40/40/10/10 |

## Scoring System

### 4-Axis Evaluation (Role-Aware)

```
overall = taskCompletion × W_task + completeness × W_comp + specificity × W_spec + actionability × W_act
```

| Axis | What | Examples |
|------|------|---------|
| TaskCompletion | Did agent DELIVER? | Backend: edit_file succeeded. QA: VERDICT given |
| Completeness | All requirements covered? | Architect: referenced all files. PM: all AC |
| Specificity | Concrete paths, names? | Backend: exact endpoints. Architect: FILES_TO_EDIT |
| Actionability | Next agent can work? | Architect→Backend: detailed instructions |

### Tool Call Visibility (v3.0 fix)

The evaluator now receives tool call data alongside text output:

```
TOOL CALLS MADE (5 total):
  ✓ create_file(app/api/pipeline/summary/route.ts)
  ✓ read_file(app/api/pipeline/summary/route.ts)
  ✓ edit_file(app/api/pipeline/summary/route.ts)
  ✗ run_command(npx tsc --noEmit)
  ✓ run_command(tsc --noEmit)

IMPORTANT: Evaluate TOOL ACTIONS + TEXT OUTPUT together.
If tools succeeded (create_file, edit_file), the agent DID deliver.
```

**Why this matters:** Backend agent was creating perfect 82-line files but scoring 2.3/10 because the evaluator only saw the 412-char text summary. Now scores 9.2/10.

## Backend Enforcement Stack (7 Layers)

| Layer | Mechanism | Where |
|-------|-----------|-------|
| 1 | System prompt: "First call MUST be edit_file" | Agent .md prompt |
| 2 | Scoring penalty: "You lose 70% without edit" | pipeline-executor.ts buildPrompt |
| 3 | Hard enforcement: no edit → score 0, escalate | pipeline-executor.ts:322-342 |
| 4 | First tool correction: read first → injected warning | direct-ai-client.ts:219-232 |
| 5 | Read loop kill switch: 2 reads → "STOP READING" | direct-ai-client.ts:281-288 |
| 6 | Success pattern: "10/10 when edits first" | success-patterns.json |
| 7 | Fail stats: "Fail rate: 59%" | pipeline-analytics-storage.ts |

## Retry Protocol

```
Attempt 1 → score X → lastScore = X
  If X ≥ threshold → PASS
  If X < threshold → retry (always retry once)

Attempt 2 → score Y → lastScore = Y
  If Y ≥ threshold → PASS
  If Y < lastScore - 0.3 → DEGRADED → STOP
  If Y > lastScore + 0.5 → improving → retry again

Attempt 3 (max) →
  If score ≥ escalationThreshold → accept with warning
  If score < escalationThreshold → ESCALATE → pipeline paused

Retry prompt: clean context (no previous output), exact feedback, score shown.
```

## Tool System

| Tool | Who Uses | Limits |
|------|----------|--------|
| list_files | PM, Architect, Cyber, QA, DevOps | Output: 12K chars |
| read_file | All tool agents | Output: 12K chars. Line ranges supported |
| edit_file | Backend, Frontend, DevOps | Hard limit: 250 lines diff |
| create_file | Backend, Frontend, DevOps | Hard limit: 120 lines. Fails if exists |
| run_command | Backend, Frontend, QA, Cyber, DevOps | Timeout: 20s. Output > 5K → summarized |
| save_failure_pattern | Architect, Cyber, QA, DevOps | Writes to failure-patterns.json |

## Learning System

### Data Flow

```
Pipeline Run → Analytics Save → Agent Stats Update
                    ↓
              Success Capture (QA-gated for impl agents)
                    ↓
              Knowledge Base:
              ├─ success-patterns.json (102 wins, 11 agents)
              ├─ failure-patterns.json (39 patterns)
              ├─ pipeline-analytics.json (aggregated stats)
              └─ pipeline-runs/*.json (per-run data)
```

### Agent Prompt Injection (~180 tokens)

```
### YOUR PERFORMANCE STATS (from 34 past runs)
- Avg score: 4.4/10
- Success rate (8+): 41%
- Fail rate (<7): 59%

### WHAT WORKS FOR YOU (from 7 successful runs)
Perfect 10/10 when it edits first. 3 tool calls optimal.
- Optimal tool calls: 3.1 avg (range 9-13)

### SIMILAR PAST WINS (api-route)
  ✓ 10/10 (3 tools) — "Create GET /api/health endpoint"

### YOUR RECENT RUNS
  ✓ 10/10 — "add option edit name pipeline..."
  ✗ 2/10 — "Implement Last Login..."
```

### QA-Gated Success Capture

```
Backend scores 9+ ──→ DEFERRED (pendingSuccessCaptures)
Frontend scores 9+ ──→ DEFERRED
QA: "VERDICT: PASS" ──→ FLUSH all pending → saved
QA: "VERDICT: FAIL" ──→ DROPPED (never saved)
Research scores 9+ ──→ SAVED immediately (no code)
```

Prevents "hallucinated success" — code wins only count if QA confirms.

### Context-Aware Matching

Tasks classified into snippets: `api-route`, `new-page`, `ui-component`, `refactor`, `security`, `testing`, `devops`, `pipeline-logic`, `general`.

Only matching past wins are injected — agent sees relevant examples, not noise.

## Pipeline Config

| Setting | Value |
|---------|-------|
| MAX_RETRIES | 3 |
| SMART_RETRY | Stop if score degrades by 0.3 |
| STEP_TIMEOUT_MS | 0 (disabled) |
| MAX_OUTPUT_TOKENS | 65,536 |
| STREAMING | Enabled |
| SHORT_OUTPUT_AUTO_FAIL | < 100 chars AND no tool calls |
| Tool output truncation | read: 12K, cmd: 5K (summarized), other: 8K |

## Routing Modes

| Mode | Eval | Agents | Tokens | Time |
|------|------|--------|--------|------|
| Quick | None | Router-selected only | ~5-10K | ~30-60s |
| Medium | Final step only (≥7) | Skip Research, Cyber | ~30-50K | ~2-3 min |
| Full | All steps (≥8.5) | All 13 stages | ~100K+ | ~5-10 min |

## Key Files

| File | Purpose |
|------|---------|
| lib/pipeline-executor.ts | Main executor — stages, retries, cache, resume, enforcement |
| lib/quality-evaluator.ts | 4-axis scoring with tool call visibility |
| lib/config.ts | AGENT_CONFIG, AGENT_SCORING_WEIGHTS, PIPELINE |
| lib/direct-ai-client.ts | Anthropic/OpenAI API, streaming, tool loop, read guard |
| lib/agent-tools.ts | Tool definitions + server-side executor |
| lib/pipeline-analytics-storage.ts | Save runs, agent stats, success pattern injection |
| lib/task-cache.ts | Search past runs by input match |
| app/api/ai/execute/route.ts | API: execute agent (standard or tool-use) |
| app/api/pipeline/analytics/route.ts | API: save/read learning context |
| app/api/pipeline/cache/route.ts | API: task cache lookup |
| app/api/knowledge/success/route.ts | API: auto-capture success patterns |
| app/api/knowledge/feedback/route.ts | API: user discard feedback |
| app/api/orchestration/apply/route.ts | API: staging area |
| app/api/orchestration/deploy/route.ts | API: deploy staged files |

## Current Performance

| Agent | Avg Score | Success ≥7.5 | Status |
|-------|-----------|-------------|--------|
| Orchestrator | 10.0 | 100% | Stable |
| Frontend | 10.0 | 92% | Stable |
| Research | 8.6 | 86% | Stable |
| Architect | 9.7 | Rising | Fixed (opus) |
| Cyber | 8.9 | Rising | Fixed (threshold 8.0) |
| PM | 9.7 | Rising | Fixed (weights 45/35) |
| Backend | 9.2 | Rising | Fixed (evaluator + enforcement) |
| QA | 9.1 | 63% | Stable but expensive |
