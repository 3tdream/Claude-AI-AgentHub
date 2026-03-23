---
name: agent-ab-test
description: A/B test two prompt variants for an agent — run both, compare scores, pick winner
disable-model-invocation: true
argument-hint: <agent-name> — e.g. architect, pm, cyber
---

A/B test two prompt variants for the $ARGUMENTS agent.

## SETUP
1. Read current prompt from `lib/pipeline-templates.ts` → this is Variant A
2. Ask the user to describe what to change for Variant B
   Or propose a change based on `/agent-gaps` analysis
3. Show both variants side by side for confirmation

## EXECUTION
After user confirms both variants:

1. **Run Variant A** (current prompt):
   ```bash
   node scripts/test-step.mjs <step>
   ```
   Save output as `data/test-steps/<step-id>.variant-a.txt`

2. **Apply Variant B** prompt change to pipeline-templates.ts

3. **Run Variant B**:
   ```bash
   node scripts/test-step.mjs <step>
   ```
   Save output as `data/test-steps/<step-id>.variant-b.txt`

4. **Restore Variant A** prompt (revert change)

## COMPARISON
| Metric | Variant A | Variant B | Winner |
|--------|-----------|-----------|--------|
| Completeness | | | |
| Specificity | | | |
| Actionability | | | |
| Task Completion | | | |
| Overall | | | |
| Words | | | |
| Cost (tokens) | | | |

## DECISION
- If Variant B wins by > 0.3 overall → ask user to apply permanently
- If tie → keep Variant A (don't change what works)
- If Variant A wins → discard B, log why it failed

WARNING: This makes 2 API calls. Costs ~$0.40-2.00.
