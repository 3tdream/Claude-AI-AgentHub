---
name: nightly-evolution
description: Autonomous improvement cycle — dead code scan, security hardening, performance pass, generate PRs
disable-model-invocation: true
---

Autonomous nightly improvement cycle.

WARNING: This runs multiple analysis passes and may suggest code changes. Review all changes before committing.

## PHASE 1 — SCAN (read-only)

### Dead Code Detection
- Grep for unused exports (exported but never imported elsewhere)
- Find unused components (files in components/ not imported by any page)
- Find unused API routes (routes not called from frontend)
- Find unused types (interfaces not referenced)

### Security Hardening
- Run `/secret-scan` logic
- Run `/env-audit` logic
- Check for `console.log` with sensitive data
- Check for TODO/FIXME/HACK comments with security implications

### Performance Pass
- Find N+1 patterns (nested fetches in loops)
- Find missing `loading.tsx` files for route segments
- Find large bundle imports (import entire library vs tree-shake)
- Find images without width/height (layout shift)
- Find components without `React.memo` in hot paths

### Dependency Check
- `npm audit` for known vulnerabilities
- Check for outdated major versions
- Find duplicate dependencies

## PHASE 2 — REPORT

```
NIGHTLY EVOLUTION REPORT — {date}

Dead Code:     {N} unused files, {M} unused exports
Security:      {N} findings ({Critical}/{High}/{Medium}/{Low})
Performance:   {N} optimization opportunities
Dependencies:  {N} vulnerabilities, {M} outdated

TOTAL ACTIONS:  {N}
AUTO-FIXABLE:   {M} (safe to apply without review)
NEEDS REVIEW:   {K} (show diff first)
```

## PHASE 3 — FIX (with approval)

For each auto-fixable issue:
1. Show the change
2. Apply if user approves
3. Group into one commit: "chore(mission-control): nightly evolution — {date}"

For review-needed issues:
1. List them with file:line references
2. Let user decide per-item

## SCHEDULING
This skill is manual but designed for regular use.
Suggest: run weekly before sprint planning, or after major feature merges.
