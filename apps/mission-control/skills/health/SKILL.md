---
name: health
description: System health deep dive — health score, subsystems, alerts, nightly evolution logs
disable-model-invocation: true
---

Deep system health check including nightly evolution results.

Steps:
1. Fetch health data:
   - GET http://localhost:3077/api/system/health — full health report
2. Read PM2 nightly evolution logs:
   - Run: `npx pm2 logs nightly-evolution --lines 15 --nostream`
   - If PM2 is not available or no logs, note this and continue
3. Display the health report:
   - **Overall Score**: numeric score with color indicator (green >80, yellow >60, red <=60)
   - **Subsystem Breakdown**: each subsystem with its individual score and status
   - **Active Alerts**: list all alerts with severity and description
   - **Nightly Evolution**: last run timestamp, what was evolved, success/failure
4. If health score is below 80, provide actionable recommendations:
   - Which subsystem is dragging the score down
   - Specific steps to fix each issue
5. If the health endpoint is unreachable, check if the server is running on port 3077
