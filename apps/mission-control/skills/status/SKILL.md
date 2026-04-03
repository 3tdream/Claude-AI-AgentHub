---
name: status
description: Current Mission Control system status — health, pipeline stats, KB, costs, recent tasks
disable-model-invocation: true
---

Show a comprehensive system status dashboard.

Steps:
1. Fetch all status data in parallel:
   - GET http://localhost:3077/api/system/health — system health score and alerts
   - GET http://localhost:3077/api/pipeline/stats — pipeline run statistics
   - GET http://localhost:3077/api/knowledge-base/validate — Knowledge Base validation status
   - GET http://localhost:3077/api/costs/real — API balances and spend
2. Read the last 5 task files from data/pipeline-runs/ directory (sorted by most recent)
3. Display a unified status report:
   - **Health**: score (color-coded), active alerts
   - **Pipeline**: total runs, success rate, last run time
   - **Knowledge Base**: entry count, validation errors if any
   - **Costs**: total spend, per-provider balances, budget warnings
   - **Recent Tasks**: last 5 tasks with ID, input summary, status, duration
4. If any endpoint fails, show which subsystem is unreachable and suggest checking if the server is running
