---
name: jira-log
description: Log a completed feature to Jira via POST /api/jira/feature-log
disable-model-invocation: true
argument-hint: <feature name>
---

Log a completed feature to Jira.

Steps:
1. Gather context from recent git changes: `git diff --name-only HEAD~3`
2. Identify:
   - `feature_name`: from $ARGUMENTS or recent commit messages
   - `files_changed`: from git diff
   - `routes_affected`: any files in `app/api/`
   - `stores_affected`: any files in `lib/stores/`
   - `dual_chat_touched`: check if chat-related files changed
   - `offline_fallback_touched`: check if fallback/cache files changed
   - `summary`: 2-3 sentence description from commit messages

3. Show the payload to the user for confirmation
4. After confirmation, execute:
```bash
curl -X POST http://localhost:3000/api/jira/feature-log \
  -H "Content-Type: application/json" \
  -d '<payload>'
```
5. Report the Jira issue key and URL

DO NOT send without user confirmation.
