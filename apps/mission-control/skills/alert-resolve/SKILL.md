---
name: alert-resolve
description: Step-by-step resolution guide for an active health alert — diagnose, fix, verify
disable-model-invocation: true
argument-hint: alert name or subsystem (e.g. "database" or "high memory")
---

Walk through resolving an active Mission Control health alert.

Steps:
1. Fetch current alerts:
   - GET http://localhost:3077/api/system/health
   - Extract the `alerts` array from the response
2. Identify the target alert from $ARGUMENTS:
   - If an argument is provided, find the alert whose name or subsystem matches (case-insensitive)
   - If no argument, list all active alerts and ask the user to pick one
3. Display the alert details:
   - **Alert**: name and severity (critical / warning / info)
   - **Subsystem**: which component is affected
   - **Description**: what the alert is reporting
   - **Since**: how long the alert has been active
4. Run subsystem-specific diagnostics:
   - **memory**: Run `free -h` or check process memory via `ps aux --sort=-%mem | head -10`
   - **disk**: Run `df -h`
   - **database**: Attempt a lightweight DB ping or check connection pool status
   - **api**: Re-curl the failing endpoint and capture the HTTP status and response time
   - **agent**: GET http://localhost:3077/api/agents and check the specific agent's status field
5. Provide a numbered resolution playbook tailored to the alert type:
   - Each step is a concrete shell command or UI action
   - Include an expected outcome for each step
6. After the user signals they have applied the fix, re-fetch health:
   - GET http://localhost:3077/api/system/health
   - Confirm whether the alert has cleared ✅ or is still active ❌
7. If still active after fix attempt, escalate: suggest checking PM2 logs (`npx pm2 logs --lines 50`) and opening a KB entry to record the pattern
