---
name: agent-gaps
description: Analyze an agent's weak points from score history — find which quality axes need improvement
disable-model-invocation: true
argument-hint: <agent-name> or "all" — e.g. architect, qa, all
---

Identify skill gaps for $ARGUMENTS agent(s).

Steps:
1. Read `data/test-steps/scores.json` — all historical scores
2. Read pipeline runs from `data/pipeline-runs/` — extract per-step scores
3. Filter scores for the target agent's stages

For each agent, calculate:
- Average per axis: Completeness, Specificity, Actionability, Task Completion
- Lowest-scoring axis (= primary gap)
- Score trend (improving or declining across runs)
- Consistency (std deviation)

Display:
**AGENT: architect-agent**
| Axis | Avg Score | Min | Max | Trend | Gap? |
|------|-----------|-----|-----|-------|------|
| Completeness | 8.8 | 7.5 | 9.5 | stable | |
| Specificity | 9.2 | 8.5 | 9.8 | up | |
| Actionability | 7.2 | 6.0 | 8.5 | down | PRIMARY GAP |
| Task Completion | 9.0 | 8.0 | 9.5 | stable | |

**ROOT CAUSE ANALYSIS:**
For primary gaps, read the evaluator feedback from scores.json and identify patterns:
- What does the evaluator consistently criticize?
- What's missing in the prompt that would fix this?

**RECOMMENDED ACTIONS:**
1. Specific prompt change to address the gap
2. Whether to use `/tune-prompt` or `/agent-train` next

If $ARGUMENTS is "all" — show summary table for all 10 agents sorted by weakest overall.
