---
name: init-feature
description: Initialize a new feature — auto-chain user-story → feature-scope → api-design → sync-context
disable-model-invocation: true
argument-hint: <feature description>
---

Meta-orchestrator: initialize feature "$ARGUMENTS" through a skill chain.

## CHAIN EXECUTION:

### Step 1 — Research (if needed)
Ask: "Do you have market context for this feature? (y/skip)"
- If yes → run `/market-scan $ARGUMENTS` logic
- If skip → proceed without

### Step 2 — User Stories
Run `/user-story $ARGUMENTS` logic:
- Generate 5-10 user stories with priorities
- Show to user → confirm or edit

### Step 3 — Scope
Run `/feature-scope $ARGUMENTS` logic:
- IN / OUT / DEFERRED boundaries
- Show to user → confirm or edit

### Step 4 — Acceptance Criteria
For each P0 story from Step 2:
- Run `/acceptance-gen` logic → generate AC-1..AC-N
- Show to user → confirm

### Step 5 — API Design
Run `/api-design $ARGUMENTS` logic using stories + scope from above:
- Design endpoints needed for P0 stories
- Show to user → confirm

### Step 6 — Save Context
Run `/sync-context save` — persist all outputs to `data/project-state.json`

### Step 7 — Readiness Check
Display summary:
```
Feature: $ARGUMENTS
Stories: N (P0: X, P1: Y, P2: Z)
Acceptance Criteria: N
API Endpoints: N
Scope: IN(X) / OUT(Y) / DEFERRED(Z)

Pipeline readiness: READY / NOT READY (missing: ...)
Next: run pipeline via /run-pipeline or UI
```

## RULES:
- Stop after EACH step for user confirmation
- User can edit/skip any step
- All outputs accumulate in conversation context
- Final state saved to project-state.json
- Estimated time: 5-10 minutes (all free, no API calls)
