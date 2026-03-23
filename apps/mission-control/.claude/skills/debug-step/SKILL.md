---
name: debug-step
description: Debug a failed pipeline step, investigate root cause, analyze evaluator feedback
disable-model-invocation: true
argument-hint: <step-id e.g. s3.2>
---

Investigate why pipeline step $ARGUMENTS failed.

Steps:
1. Read the step output from `data/test-steps/$ARGUMENTS.txt` (if exists)
2. Read the scores from `data/test-steps/scores.json`
3. Check the step's prompt template in `lib/pipeline-templates.ts`
4. Check the agent's system prompt in `lib/agent-prompts-cache.ts`
5. Check the agent config in `lib/config.ts` (thresholds, limits)
6. Look at recent pipeline runs in `data/pipeline-runs/` for patterns

Diagnose:
- Was the output truncated? (stop_reason: max_tokens)
- Did the evaluator score fairly? (check criteria vs output)
- Is the prompt too vague or conflicting?
- Is the context from dependencies too large or truncated?
- Did the agent get contaminated prompts from old cache?

Output a ROOT CAUSE and RECOMMENDED FIX.
