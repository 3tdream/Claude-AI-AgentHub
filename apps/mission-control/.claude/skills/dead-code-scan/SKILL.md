---
name: dead-code-scan
description: Find unused files, exports, components, routes, types in the codebase
disable-model-invocation: true
argument-hint: [directory] or empty for full project
---

Scan for dead code in: $ARGUMENTS (or full project)

## Checks:

### Unused Files
For each .ts/.tsx file in components/ and lib/:
- Is it imported by any other file?
- If not → candidate for removal

### Unused Exports
For each `export` in the codebase:
- Is the exported name imported elsewhere?
- Named exports that are never used

### Unused API Routes
For each route in app/api/:
- Is the endpoint URL referenced in any frontend file?
- Grep for the path string

### Unused Types
For each `interface`/`type` in types/:
- Is it referenced in any .ts/.tsx file?

### Unused Dependencies
- Compare package.json dependencies vs actual imports
- Flag packages installed but never imported

## Report:
| File/Export | Type | Last Modified | Confidence | Action |
|------------|------|---------------|------------|--------|
Confidence: HIGH (definitely unused) / MEDIUM (possibly used dynamically) / LOW (check manually)

DO NOT delete anything — report only. User decides what to remove.
