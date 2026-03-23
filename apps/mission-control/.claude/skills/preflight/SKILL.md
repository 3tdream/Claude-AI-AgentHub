---
name: preflight
description: Pre-pipeline readiness check — verify all inputs ready before spending API tokens
disable-model-invocation: true
argument-hint: [feature-name] or empty for current project-state
---

Preflight check before pipeline run.

## Steps:

### 1. Load Context
Read `data/project-state.json` — check what's prepared

### 2. Checklist
| # | Requirement | Status | Source |
|---|------------|--------|--------|
| 1 | Feature description clear? | | input text |
| 2 | User stories defined? | | /user-story or /init-feature |
| 3 | Scope boundaries set? | | /feature-scope |
| 4 | Acceptance criteria written? | | /acceptance-gen |
| 5 | API endpoints sketched? | | /api-design |
| 6 | Security concerns identified? | | /threat-model |
| 7 | Tech decisions made? | | /tech-decision |
| 8 | Project context available? | | /sync-context |

### 3. Verdict
- **GO** — all critical items (1-4) ready → pipeline will run efficiently
- **PARTIAL** — some items missing → pipeline will work but may retry more
- **NOT READY** — critical items missing → fix before running pipeline

### 4. Cost Estimate
Based on prepared context:
- Full run without preflight: ~$15, ~50 min
- With current preflight coverage: ~$X, ~Y min
- Estimated savings: $Z, N min

### 5. Recommendations
- Missing items → which skill to run
- Potential pipeline failures → what to prepare
- Suggested pipeline mode (quick/medium/full) based on readiness

### 6. Pipeline Input
If GO — generate optimized pipeline input text that includes:
- Feature description
- Key decisions already made
- References to project-state.json sections
This reduces S0/S1 work and saves tokens.
