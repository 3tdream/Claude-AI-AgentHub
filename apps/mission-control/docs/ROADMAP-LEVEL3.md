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
| 2.1 | Full mode end-to-end | NOT DONE | 13/13 stages completed, all ≥7.5 |
| 2.2 | Backend stable in full mode | NOT DONE | Score ≥7.5 on 3 consecutive runs |
| 2.3 | All agents ≥70% success rate | NOT DONE | pipeline-analytics.json |
| 2.4 | Pipeline ≤15 min for full mode | NOT DONE | Total duration |
| 2.5 | Speed Governor tested | NOT DONE | edit_file/create_file limits verified |

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
| 3.6 | edit_file max 30 lines diff | DONE | commit 002bc1e |
| 3.7 | create_file max 80 lines | DONE | commit 002bc1e |
| 3.8 | Max 1 file per agent run | DONE | in prompt |
| 3.9 | Change budget per feature | NOT DONE | Max 100 lines total |
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
Level 2: 0/5 complete
Level 3: 3/18 complete (3.6, 3.7, 3.8, 3.14)
```

## Execution Order

1. **NOW**: 2.1-2.5 (full mode stability)
2. **NEXT**: 3.9-3.10 (Speed Governor extended)
3. **THEN**: 3.1-3.5 (Auto Task Generation)
4. **THEN**: 3.11-3.14 (Auto Follow-ups)
5. **LAST**: 3.15-3.18 (Reduced Checkpoints)
