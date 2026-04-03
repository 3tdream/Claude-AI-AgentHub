---
name: rerun
description: Resume a failed or interrupted pipeline task from where it left off
disable-model-invocation: true
argument-hint: [taskId] or "latest"
---

Resume a failed or interrupted task by skipping completed stages.

Steps:
1. Determine the target task:
   - If $ARGUMENTS is a task ID, use it directly
   - If $ARGUMENTS is "latest" or empty, find the most recent run in data/pipeline-runs/ directory (sort by timestamp, pick newest)
2. Read the task's JSON file from data/pipeline-runs/{taskId}.json
3. Analyze the run status:
   - List all stages and their statuses (completed, failed, pending, running)
   - If all stages completed successfully, inform the user — nothing to rerun
   - If has failed or pending stages, show which stages will be skipped (completed) and which will be re-executed
4. Show the original input and ask the user to confirm the rerun
5. On confirmation, send POST http://localhost:3077/api/command with the original input from the task
6. Monitor and display the new execution result
7. Compare: show what changed between the original run and the rerun
