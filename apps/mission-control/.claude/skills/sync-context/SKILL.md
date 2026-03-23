---
name: sync-context
description: Collect outputs from ad-hoc skills into shared project-state.json — agents hear each other
disable-model-invocation: true
argument-hint: [save|show|clear] — save current context, show state, or clear
---

Shared context manager — the "nervous system" between skills.

File: `data/project-state.json`

## Commands:

### `save` (default)
Scan recent conversation for skill outputs and save to project-state.json:

```json
{
  "project": "current project name",
  "updatedAt": "ISO date",
  "context": {
    "research": { "summary": "...", "updatedAt": "...", "source": "/market-scan" },
    "user_stories": { "stories": [...], "updatedAt": "...", "source": "/user-story" },
    "scope": { "in": [...], "out": [...], "updatedAt": "...", "source": "/feature-scope" },
    "api_contracts": { "endpoints": [...], "updatedAt": "...", "source": "/api-design" },
    "db_schema": { "entities": [...], "updatedAt": "...", "source": "/db-schema" },
    "threat_model": { "risks": [...], "updatedAt": "...", "source": "/threat-model" },
    "acceptance_criteria": { "criteria": [...], "updatedAt": "...", "source": "/acceptance-gen" },
    "design_tokens": { "tokens": {...}, "updatedAt": "...", "source": "/theme-factory" }
  },
  "pipeline_ready": false,
  "missing_for_pipeline": ["research", "scope"]
}
```

### `show`
Read and display current project-state.json as a summary table:
| Section | Status | Last Updated | Source Skill | Size |

### `clear`
Reset project-state.json to empty state (confirm first).

## How other skills use this:
When any skill starts, it should check `data/project-state.json` for existing context.
Example: `/frontend` reads api_contracts from state instead of asking "what API?"

## Auto-update:
After each skill produces output, prompt: "Save to project context? (y/n)"
