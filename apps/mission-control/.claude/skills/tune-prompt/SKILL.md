---
name: tune-prompt
description: Improve an agent's prompt in pipeline-templates.ts based on past results and failures
disable-model-invocation: true
argument-hint: <agent-name e.g. architect, backend, qa>
---

Analyze and suggest improvements for the $ARGUMENTS agent prompt.

Steps:
1. Read the agent's current prompt(s) in `lib/pipeline-templates.ts` — find all stages for this agent
2. Read past scores from `data/test-steps/scores.json`
3. Read past outputs from `data/test-steps/` for this agent's stages
4. Check `lib/agent-prompts-cache.ts` for the system prompt
5. Check Knowledge Base patterns in `agents/agents team/knowledge-base/`

Analyze:
- What scored low? (Completeness, Specificity, Actionability, Task Completion)
- What evaluator feedback was given?
- Is the prompt too vague, too restrictive, or conflicting?
- Are word limits appropriate for this agent's output type?
- Does the output format instruction match what evaluator expects?

Output:
1. CURRENT SCORE SUMMARY (per stage)
2. IDENTIFIED ISSUES (specific quotes from prompt that cause problems)
3. PROPOSED CHANGES (exact old → new text diffs)
4. EXPECTED IMPACT (which score axes should improve)

DO NOT apply changes — only propose. Wait for user approval.
