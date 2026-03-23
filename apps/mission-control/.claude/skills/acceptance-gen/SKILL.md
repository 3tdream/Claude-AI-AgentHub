---
name: acceptance-gen
description: Generate acceptance criteria from user story — GIVEN/WHEN/THEN format with IDs
argument-hint: <user story text>
---

Generate acceptance criteria for: $ARGUMENTS

For each criterion:
- **AC-N**: GIVEN [precondition] WHEN [action] THEN [expected result]
- Priority: P0 (must-have) / P1 (should-have) / P2 (nice-to-have)

Cover:
1. Happy path (P0) — main success scenario
2. Validation (P0) — invalid inputs, boundary values
3. Error handling (P0) — network failure, timeout, conflict
4. Authorization (P0) — who can/cannot perform this
5. Edge cases (P1) — empty state, max limits, concurrent access
6. UX polish (P2) — loading states, animations, feedback

IDs must be sequential: AC-1, AC-2, AC-3...
QA agent will reference these IDs in test results.
