---
name: retro
description: Pipeline retrospective — analyze what went well, what failed, action items for improvement
argument-hint: [run-id] or "latest"
---

Retrospective for pipeline run: $ARGUMENTS

1. Read the run from `data/pipeline-runs/` (latest if not specified)
2. Read scores from `data/test-steps/scores.json`

## WHAT WENT WELL
- Steps that scored 9.0+ — what made them excellent
- Steps that completed faster than average
- Quality gates that caught real issues

## WHAT WENT WRONG
- Steps that scored < 8.0 — root cause
- Steps that were retried — why first attempt failed
- Steps that hit max_tokens — context too large?
- Escalations — what triggered them

## METRICS
| Metric | Value |
|--------|-------|
| Total duration | |
| Total cost | |
| Steps passed first try | |
| Steps retried | |
| Average score | |
| Lowest scoring step | |

## ACTION ITEMS
- [ ] Specific prompt changes
- [ ] Config adjustments
- [ ] KB patterns to add
- [ ] Skills to use next time
