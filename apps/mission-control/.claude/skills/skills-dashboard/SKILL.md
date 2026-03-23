---
name: skills-dashboard
description: Show status of all skill categories, project state, agent readiness — full mission control overview
disable-model-invocation: true
---

Mission Control Skills Dashboard.

## 1. PROJECT STATE
Read `data/project-state.json`:
```
Feature: [current feature or "none"]
Updated: [date]
Sections filled: N/8
Pipeline ready: YES/NO
```

## 2. TEAM STATUS
For each agent, check recent activity:
| Agent | Last Skill Used | Last Score | Health | Ready |
|-------|----------------|------------|--------|-------|
| Research | /market-scan (2h ago) | — | OK | Yes |
| PM | /user-story (1h ago) | — | OK | Yes |
| Architect | — | 9.3 | OK | Yes |
| Cyber | — | 9.4 | WARN: KB empty | No |
Read from:
- `data/test-steps/scores.json` for pipeline scores
- `data/project-state.json` for skill outputs
- KB files for health status

## 3. SKILL CATALOG SUMMARY
| Category | Total | Used Today | Most Used |
|----------|-------|------------|-----------|
| Agent Roles | 10 | | |
| Specialized | 39 | | |
| Pipeline Ops | 4 | | |
| Evolution | 6 | | |
| Design/UI | 6 | | |
| Meta (L1-L4) | 7+ | | |

## 4. PIPELINE METRICS
Read from `data/pipeline-runs/` and `data/pipeline-analytics.json`:
- Total runs: N
- Average score: X.X
- Average cost: $X.XX
- Last run: [date] — [status]
- Cost trend: up/down/stable

## 5. RECOMMENDATIONS
Based on current state, suggest:
- "Run /preflight — 3 items missing before pipeline"
- "Run /agent-health — KB not updated in 14 days"
- "Run /nightly-evolution — 5 days since last scan"
