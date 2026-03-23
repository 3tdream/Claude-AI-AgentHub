---
name: dependency-map
description: Map dependencies between features, tasks, or components — what blocks what
argument-hint: <feature list or "current project">
---

Dependency map for: $ARGUMENTS

1. If "current project" — read pipeline stages from `lib/pipeline-templates.ts`
2. Otherwise parse the feature list from arguments

Output:
```
Feature A
  └── depends on: Feature B, Feature C
Feature B
  └── depends on: Feature D
Feature C
  └── no dependencies (can start immediately)
Feature D
  └── no dependencies (can start immediately)
```

**CRITICAL PATH:** Longest chain of dependencies → determines minimum timeline
**PARALLELIZABLE:** Features with no dependencies → can run simultaneously
**BOTTLENECKS:** Features that block 3+ others → prioritize these

If reading code — check imports, API calls, shared types to find real dependencies.
