---
name: run
description: Quick direct execution — send a task to Mission Control command API
disable-model-invocation: true
argument-hint: task description
---

Quick direct execution of a task via Mission Control.

Steps:
1. Take the user's task description from $ARGUMENTS
2. Read the active project ID from the Mission Control app store (check lib/stores/app-store.ts for activeProjectId)
3. Send POST http://localhost:3077/api/command with body: `{ "input": "$ARGUMENTS", "projectId": "<activeProjectId>" }`
4. Parse the response and display:
   - **Intent classification** — what the system understood
   - **Tool calls** — which tools were invoked
   - **Result** — the output
   - **Status** — success/failure
5. If the response indicates a pipeline routing decision:
   - Show the routing decision (which agents, which stages)
   - Ask the user for confirmation before proceeding
   - If confirmed, note that execution will continue via the pipeline
6. If the command fails, show the error and suggest fixes (e.g., is the server running on port 3077?)
