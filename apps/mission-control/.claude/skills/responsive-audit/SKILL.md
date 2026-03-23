---
name: responsive-audit
description: Audit responsive design — check mobile, tablet, desktop breakpoints, layout issues
argument-hint: [page-path or component-name] — e.g. "orchestration", "SlotBar"
---

Audit responsive design for $ARGUMENTS.

## Steps:

1. **Find target files:**
   - If page name → look in `app/(shell)/$ARGUMENTS/`
   - If component name → search in `components/`
   - If empty → audit all pages

2. **Check each file for:**

### Breakpoint Coverage
- Has mobile styles (default / `sm:`)
- Has tablet styles (`md:`)
- Has desktop styles (`lg:` / `xl:`)
- Uses responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`)

### Common Issues
- Fixed widths that break on mobile (`w-[500px]` without responsive)
- Overflow risks (no `overflow-hidden` or `truncate` on text)
- Touch targets too small (< 44px on mobile)
- Hidden content on mobile without alternative (`hidden md:block` with no mobile equivalent)
- Horizontal scroll on mobile (flex without `flex-wrap`)
- Font sizes too small on mobile (< 14px)

### Layout Patterns
- Sidebar collapses on mobile?
- Navigation adapts to mobile?
- Tables convert to cards/stacked on mobile?
- Modals/dialogs are full-screen on mobile?

3. **Report:**
   | File | Mobile | Tablet | Desktop | Issues |
   | --- | --- | --- | --- | --- |

4. **Suggest fixes** with exact Tailwind classes to add

Rules:
- Read actual code — use Read/Grep tools
- Focus on real issues, not hypothetical ones
- Respond in the same language as the user's input
