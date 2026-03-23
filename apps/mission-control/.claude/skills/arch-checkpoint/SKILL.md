---
name: arch-checkpoint
description: Update ARCHITECTURE.md after code changes — new routes, stores, types, pages
disable-model-invocation: true
---

Update ARCHITECTURE.md to reflect current state of the codebase.

Steps:
1. Read current `ARCHITECTURE.md`
2. Run `git diff --name-only HEAD~3` to see recent changes
3. Scan for new/changed:
   - API routes in `app/api/`
   - Pages in `app/(shell)/`
   - Zustand stores in `lib/stores/`
   - Types in `types/`
   - Data files in `data/`
   - Components in `components/`
4. Compare findings against what ARCHITECTURE.md currently documents
5. Show diff of what needs updating
6. Apply changes after user confirms

Follow the format already established in ARCHITECTURE.md — do not restructure.
