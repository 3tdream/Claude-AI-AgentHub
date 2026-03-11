# Mission Control — Claude Instructions

## Project Context
AI Agent Management Platform — see [ARCHITECTURE.md](ARCHITECTURE.md) for full system design.

## Key Rules
- Next.js **15.5.4** — do NOT use Next 16 APIs. Build with `node_modules/.bin/next build` (root has next@16.1.1).
- React 19 — use `use()` hook carefully, Server Components by default, `"use client"` only when needed.
- Tailwind CSS **4** — no `tailwind.config.ts` classes, use CSS-first config in `app/globals.css`.
- All API routes proxy through Agent Hub with cached fallback — follow the pattern in existing routes.
- File-based storage goes in `data/` — follow `lib/logs-storage.ts` pattern (ensureDataDir, fs/promises).
- Sensitive files (`data/jira-config.json`) must be in `.gitignore`.

## Feature Development Workflow

### Pre-flight Check (MANDATORY before writing code)
Before implementing any new feature, read ARCHITECTURE.md and CLAUDE.md, then answer:
1. Which existing API routes, Zustand stores, or types are affected?
2. Does this touch the dual chat source or offline fallback? If yes, describe the impact.
3. What new files will be created and what existing files modified?

**Do not write code until the user confirms the architectural plan.**

### Implementation Sequence
1. **Spec** — Define data shape, API endpoints, Zustand store changes
2. **API** — Create `/api/*` route with Agent Hub proxy + cached fallback pattern
3. **UI** — Build page in `app/(shell)/` using existing component patterns (SWR, Tailwind, Radix)
4. **Validate** — Check offline resilience (empty data), hydration safety (no `Date.now()` in SSR)

### Checkpoint (MANDATORY after completing a feature)
After each feature is done, update ARCHITECTURE.md if any of these changed:
- New or modified API routes
- New or modified Zustand stores
- New data files in `data/`
- New pages or navigation items
- Changes to the type system

This keeps ARCHITECTURE.md as the single source of truth for the next session.

### PM Agent — Log to Jira (MANUAL trigger)
When the user says **"log this to Jira"** after a Checkpoint, call `POST /api/jira/feature-log` with:
```json
{
  "feature_name": "Feature Name",
  "files_changed": ["lib/foo.ts", "app/bar/page.tsx"],
  "routes_affected": ["/api/foo"],
  "stores_affected": [],
  "dual_chat_touched": false,
  "offline_fallback_touched": false,
  "summary": "2-3 sentence description of what was built and why."
}
```
Populate from the Pre-flight Check and implementation context. On success, confirm with the Jira issue key and URL.
Requires `defaultProjectKey` to be set in `/jira/settings`.

## Don't
- Don't use `npx next` — it resolves to root's next@16.1.1
- Don't add state to Zustand stores unless persistence is needed across page navigations
- Don't create new component libraries — use Radix + Tailwind patterns from existing pages
- Don't commit `data/*.json` files with sensitive data
