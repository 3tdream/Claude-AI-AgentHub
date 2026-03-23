---
name: agent-train
description: Add a high-quality output as few-shot example to an agent's knowledge base for learning
disable-model-invocation: true
argument-hint: <agent-name> [step-id] — e.g. architect s3.2
---

Add a successful output as a training example for the $0 agent.

Steps:
1. If step-id ($1) provided — read output from `data/test-steps/$1.txt`
   If not — find the highest-scored output for this agent in `data/test-steps/scores.json`
2. Verify the output scored >= 8.5 overall (only train on high-quality examples)
3. Read the agent's Knowledge Base file:
   - `agents/agents team/knowledge-base/success-patterns.json`
   - Or `projects/mission-control/knowledge-base/success-patterns.json`
4. Extract key qualities that made this output excellent:
   - Structure used
   - Level of specificity
   - Format patterns
   - What the evaluator praised
5. Create a training entry:
   ```json
   {
     "agent": "agent-name",
     "step": "step-id",
     "score": 9.3,
     "date": "2026-03-23",
     "qualities": ["specific API paths", "complete ERD", "no SQL"],
     "excerpt": "first 500 chars of output as reference",
     "lesson": "one-sentence takeaway"
   }
   ```
6. Add to success-patterns.json
7. Confirm what was learned

REJECT outputs below 8.5 — don't train on mediocre work.
