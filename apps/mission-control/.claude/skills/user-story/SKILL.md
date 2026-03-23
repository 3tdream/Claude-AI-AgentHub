---
name: user-story
description: Generate user stories from a feature description — persona, action, outcome, priority
argument-hint: <feature description>
---

Generate user stories for: $ARGUMENTS

Format per story:
**US-N** (P0/P1/P2)
As a [persona], I want to [action], so that [outcome].

Generate 5-10 stories covering:
- Happy path (P0)
- Error handling (P0-P1)
- Edge cases (P1-P2)
- Admin/config (P1)
- Analytics/reporting (P2)

Each story should be:
- Independent (can be implemented alone)
- Testable (has clear pass/fail criteria)
- Small enough for one sprint (< 8 SP)
