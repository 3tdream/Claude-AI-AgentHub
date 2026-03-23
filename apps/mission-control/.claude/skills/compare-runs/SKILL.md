---
name: compare-runs
description: Compare two pipeline runs — quality scores regression/progress analysis
disable-model-invocation: true
argument-hint: [run-id-1] [run-id-2] or "latest 2"
---

Compare pipeline runs to detect quality regression or progress.

Steps:
1. If $ARGUMENTS is "latest 2" or empty — find the 2 most recent runs in `data/pipeline-runs/`
2. Otherwise parse two run IDs from arguments
3. Read both run JSON files
4. Extract per-step scores from both runs

Display:

**COMPARISON TABLE:**
| Step | Agent | Run 1 Score | Run 2 Score | Delta | Status |
Status: improved (+0.5+), regressed (-0.5+), stable

**SUMMARY:**
- Steps improved: N
- Steps regressed: N
- Steps stable: N
- Overall average: run1 vs run2

**REGRESSIONS** (if any):
For each regressed step, show:
- What changed between runs (prompt? model? context?)
- Evaluator feedback diff
- Suggested action
