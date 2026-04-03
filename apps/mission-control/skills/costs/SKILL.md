---
name: costs
description: API balances and pipeline spend — per-provider costs, budgets, warnings
disable-model-invocation: true
---

Show API costs, balances, and budget status.

Steps:
1. Fetch cost data:
   - GET http://localhost:3077/api/costs/real — real balances and spend data
2. Display the cost report:
   - **Fixed Costs**: monthly subscriptions, infrastructure
   - **Per-Provider Balances**: for each API provider (Anthropic, OpenAI, Google, etc.):
     - Current balance or credit remaining
     - Spend this period
     - Burn rate
   - **Pipeline Spend**: total cost of pipeline runs, cost per run average
   - **Budget Status**: are we within budget? Projected end-of-month spend
3. Highlight any warnings:
   - Low balance on any provider (below 20% of typical monthly spend)
   - Unusual spend spikes
   - Budget overruns
4. If the costs endpoint is unreachable, inform the user and suggest checking server status
