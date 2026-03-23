---
name: regression-suite
description: Generate regression test cases to prevent known bugs from returning
argument-hint: <feature or "from KB"> — use Knowledge Base failure patterns
---

Regression suite for: $ARGUMENTS

1. If "from KB" — read `agents/agents team/knowledge-base/failure-patterns.json`
2. Otherwise analyze the feature code for common regression risks

For each potential regression:
```
REG-N: [Title]
Trigger: What caused the original bug
Test: How to verify it's still fixed
Priority: P0 (broke production) / P1 (broke tests) / P2 (cosmetic)
```

Categories:
- **Data integrity** — calculations, aggregations, cascades
- **UI state** — forms remembering stale data, modals not closing
- **API contract** — response shape changes breaking frontend
- **Auth** — permission checks that were bypassed
- **Performance** — N+1 queries, memory leaks, large payloads

Output as a checklist that QA can run before each release.
