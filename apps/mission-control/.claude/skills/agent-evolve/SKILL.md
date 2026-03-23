---
name: agent-evolve
description: Full agent improvement cycle — analyze gaps, tune prompt, test, compare, commit if better
disable-model-invocation: true
argument-hint: <agent-name> — e.g. architect, backend, cyber
---

Run a full evolution cycle for the $ARGUMENTS agent.

This is a 5-phase automated improvement loop:

## PHASE 1 — DIAGNOSE
- Run `/agent-gaps $ARGUMENTS` logic internally
- Identify the primary weak axis and root cause
- Read evaluator feedback history

## PHASE 2 — PROPOSE
- Analyze current prompt in `lib/pipeline-templates.ts`
- Draft a specific prompt change targeting the weak axis
- Show the EXACT diff (old text → new text)
- **STOP and wait for user approval before continuing**

## PHASE 3 — APPLY & TEST
After user approves:
- Apply the prompt change to `lib/pipeline-templates.ts`
- Save backup: `cp pipeline-templates.ts pipeline-templates.ts.backup`
- Run the agent's step via `node scripts/test-step.mjs <step>`
- Evaluate the new output

## PHASE 4 — COMPARE
- Compare new score vs previous score
- Show delta table:
  | Axis | Before | After | Delta |
- IMPROVED: delta > +0.3 on target axis without regression on others
- REGRESSED: any axis dropped > 0.5
- NEUTRAL: no significant change

## PHASE 5 — DECIDE
- If IMPROVED → commit the change, update KB with lesson learned
- If REGRESSED → revert from backup, log failure pattern to KB
- If NEUTRAL → ask user whether to keep or revert

Rules:
- NEVER skip Phase 2 approval — always show diff first
- NEVER commit a regression
- Only change ONE thing per evolution cycle
- Log the result to success-patterns or failure-patterns

WARNING: This makes 1-2 API calls. Costs ~$0.20-1.00.
