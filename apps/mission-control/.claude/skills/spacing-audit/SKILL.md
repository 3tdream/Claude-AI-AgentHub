---
name: spacing-audit
description: Audit spacing consistency — padding, margins, gaps across components
argument-hint: [page or component to audit]
---

Spacing audit for: $ARGUMENTS

1. Read target files and extract all spacing values
2. Check consistency against the project's 4px grid:

**EXPECTED SCALE:** p-1(4), p-2(8), p-3(12), p-4(16), p-6(24), p-8(32), p-12(48), p-16(64)

| File | Line | Class | Value | On Grid? | Suggested Fix |
|------|------|-------|-------|----------|---------------|
| | | `p-[13px]` | 13px | No | `p-3` (12px) |
| | | `gap-7` | 28px | No | `gap-6` (24px) or `gap-8` (32px) |

**ISSUES:**
- Arbitrary values (`p-[17px]`) — should use scale
- Inconsistent gaps in similar components
- Different padding for same-level cards
- Missing responsive spacing adjustments

**SUMMARY:**
- Total spacing declarations: N
- On grid: N (X%)
- Off grid: N — list fixes
