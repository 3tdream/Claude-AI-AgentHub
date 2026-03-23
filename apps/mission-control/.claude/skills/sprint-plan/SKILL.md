---
name: sprint-plan
description: Plan sprints from user stories — assign story points, group into sprints, balance capacity
argument-hint: <"from PRD" or list of stories>
---

Sprint planning for: $ARGUMENTS

1. If "from PRD" — read latest PRD from `data/test-steps/s2-pm.txt`
2. Extract or parse user stories

For each story:
- Estimate story points (Fibonacci: 1, 2, 3, 5, 8, 13)
- Identify dependencies
- Assign priority (P0/P1/P2)

**SPRINT PLAN** (capacity: 40-50 SP per sprint):

### Sprint 1 — Foundation
| Story | SP | Priority | Depends On |
Total: XX SP

### Sprint 2 — Core Features
| Story | SP | Priority | Depends On |
Total: XX SP

### Sprint 3 — Polish & QA
| Story | SP | Priority | Depends On |
Total: XX SP

Rules:
- P0 stories must be in Sprint 1-2
- Dependencies must be in earlier sprint than dependents
- No sprint exceeds capacity
- Include 10% buffer for bugs/tech debt
