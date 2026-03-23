---
name: a11y-check
description: Accessibility audit — ARIA labels, color contrast, keyboard navigation, screen reader, WCAG 2.1 compliance
argument-hint: [page-path or component-name]
---

Audit accessibility for $ARGUMENTS.

## Steps:

1. **Find target files** — same logic as responsive-audit
2. **Check WCAG 2.1 AA compliance:**

### A — Perceivable
- Images have `alt` text
- Icons have `aria-label` or `sr-only` text
- Color is not the only way to convey information
- Contrast ratios meet AA (4.5:1 text, 3:1 large text/UI)
- Text can be resized to 200% without loss

### B — Operable
- All interactive elements reachable by keyboard (Tab)
- Focus order is logical (not jumping around)
- Focus indicators are visible (`focus:ring-2` or similar)
- No keyboard traps
- Click targets >= 44x44px on touch devices
- `<button>` used for actions, `<a>` for navigation (not `<div onClick>`)

### C — Understandable
- Form inputs have `<label>` associations
- Error messages are descriptive and linked to fields
- Language is set (`<html lang="...">`)
- Consistent navigation patterns across pages

### D — Robust
- Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`)
- ARIA roles used correctly (not `role="button"` on a `<div>` when `<button>` works)
- Dynamic content uses `aria-live` regions
- Modals trap focus and restore on close

3. **Report:**
   | Issue | WCAG | Level | File | Line | Fix |
   Priority: A (critical) → AA (required) → AAA (nice-to-have)

4. **Auto-fix suggestions** with exact code changes

Rules:
- Read actual code — use Read/Grep tools
- Prioritize critical issues (keyboard, screen reader) over minor (contrast edge cases)
- Respond in the same language as the user's input
