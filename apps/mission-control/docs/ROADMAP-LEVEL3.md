# Roadmap: Level 2 → Level 3

## Autonomy Levels

- **Level 1**: Guided Autonomy — agents work, human directs everything
- **Level 2**: Stable Full Mode — pipeline end-to-end, smart retry, 4-axis scoring
- **Level 3**: Self-Directed Engineering — auto task generation, reduced checkpoints
- **Level 4**: Self-Evolving System — meta-agent tunes other agents
- **Level 5**: Self-Governing Product Engine — product-level autonomy

## Current: Level 2 (in progress)

### Level 2 Completion Checklist

| # | Task | Status | Criteria |
|---|------|--------|----------|
| 2.1 | Full mode end-to-end | NOT DONE | 13/13 stages completed, all ≥ threshold |
| 2.2 | Backend stable in full mode | NOT DONE | Score ≥7.5 on 3 consecutive runs |
| 2.3 | All agents ≥70% success rate | PARTIAL | Architect ✓, Cyber ✓, Backend ✗ |
| 2.4 | Pipeline ≤15 min for full mode | NOT DONE | With cache: expected ~5 min |
| 2.5 | Speed Governor tested | DONE | edit 250 hard / create 120 hard |

### What's Built (Level 2 infrastructure)

| Feature | Status | Details |
|---------|--------|---------|
| 4-axis scoring (role-aware) | DONE | taskCompletion + completeness + specificity + actionability |
| Per-agent scoring weights | DONE | Backend 70% task, PM 50% task, Research 40% task |
| Per-agent config (AGENT_CONFIG) | DONE | thresholds, turns, context, read budget, diff limits |
| Smart retry (stop on degradation) | DONE | lastScore tracker, stop if score drops |
| Surgical retry (clean context) | DONE | No previous output, exact feedback, score shown |
| Agent Tool-Belt | DONE | read/edit/create/run/save_failure_pattern |
| Task Cache | DONE | Reuse past outputs for same task |
| Resume pipeline | DONE | Continue from failed stage |
| Pause / Stop | DONE | Buttons during execution |
| Learning database | DONE | 44 runs, per-agent stats, recent runs in prompt |
| Failure patterns (auto) | DONE | QA/Architect/Cyber save_failure_pattern |
| Failure patterns (user) | DONE | Discard feedback dialog |
| Tool calls UI | DONE | Agent Activity timeline in Stage Detail |
| Agent prompts synced | DONE | All 10 agents know Next.js, tools, known pitfalls |
| Backend "edit first" | DONE | First call must be edit/create, not read |
| Streaming | DONE | No 10-min timeout |
| Staging Area | DONE | Stage → Deploy with overwrite protection |

## Level 3: Self-Directed Engineering

### Brick 1: Auto Task Generation

| # | Task | Status | Criteria |
|---|------|--------|----------|
| 3.1 | PM reads pipeline-analytics.json | NOT DONE | PM uses read_file on analytics |
| 3.2 | PM generates tasks from failure-patterns | NOT DONE | FAIL-XXX → task in queue |
| 3.3 | PM prioritizes by severity + frequency | NOT DONE | Critical > High > Medium |
| 3.4 | Task queue in data/task-queue.json | NOT DONE | Persisted, readable |
| 3.5 | UI: /tasks page | NOT DONE | View + approve/reject |

### Brick 2: Speed Governor (extended)

| # | Task | Status | Criteria |
|---|------|--------|----------|
| 3.6 | edit_file hard limit | DONE | 250 lines max |
| 3.7 | create_file hard limit | DONE | 120 lines max |
| 3.8 | Max 1 file per agent run | DONE | In prompt |
| 3.9 | Change budget per feature | NOT DONE | Max 100 lines total across all agents |
| 3.10 | Core files protection list | NOT DONE | Critical files need human approve |

### Brick 3: Auto Follow-ups

| # | Task | Status | Criteria |
|---|------|--------|----------|
| 3.11 | QA FAIL → auto Jira ticket | NOT DONE | save_failure_pattern → Jira |
| 3.12 | Repeated failure (3x) → auto ADR | NOT DONE | Architect creates ADR |
| 3.13 | Pipeline complete → update ARCHITECTURE.md | NOT DONE | New routes/stores/pages |
| 3.14 | Discard feedback → next pipeline reads it | DONE | failure-patterns.json |

### Brick 4: Reduced Human Checkpoints

| # | Task | Status | Criteria |
|---|------|--------|----------|
| 3.15 | Risk zones defined | NOT DONE | Config with protected paths |
| 3.16 | Low-risk tasks skip checkpoint | NOT DONE | UI/docs/config → no s4.5 |
| 3.17 | High-risk tasks force checkpoint | NOT DONE | API/stores/types → mandatory |
| 3.18 | Auto-merge for score ≥9 + low-risk | NOT DONE | Git commit without human |

## Scoreboard

```
Level 2: 2/5 complete (2.5 done, 2.3 partial)
Level 3: 4/18 complete (3.6, 3.7, 3.8, 3.14)
```

## Blocking Issue

**Backend agent** is the only blocker for Level 2 completion:
- 4/4 last full mode runs: Backend failed (score 0-2.1)
- Root cause: agent reads files instead of editing
- Latest fix: "edit first, never read" prompt + 3 max turns + readBudget 1
- Status: **untested** — next full mode run will validate

## Execution Order

1. **NOW**: Full mode test (validate Backend "edit first" fix)
2. **THEN**: 2.1-2.4 (full mode stability, 3 consecutive passes)
3. **NEXT**: 3.9-3.10 (Speed Governor extended)
4. **THEN**: 3.1-3.5 (Auto Task Generation)
5. **THEN**: 3.11-3.14 (Auto Follow-ups)
6. **LAST**: 3.15-3.18 (Reduced Checkpoints)
