---
name: agent-report
description: Full agent matrix — all agents with provider, model, tools, budgets, performance
disable-model-invocation: true
---

Generate a comprehensive agent matrix report.

Steps:
1. Fetch data from multiple sources in parallel:
   - GET http://localhost:3077/api/agent-hub/agents — list of all agents
   - GET http://localhost:3077/api/agents/performance — performance statistics
   - Read lib/config.ts in the Mission Control project for AGENT_CONFIG (tools, budgets, limits)
2. Cross-reference the data to build a complete picture per agent
3. Output a markdown table with columns:
   | Name | Provider | Model | Tools | Max Turns | Read Budget | Success Rate |
   - **Name**: agent display name
   - **Provider**: anthropic, openai, google, etc.
   - **Model**: specific model ID
   - **Tools**: count of configured tools
   - **Max Turns**: maxToolSteps or equivalent
   - **Read Budget**: maxTokens or readBudget
   - **Success Rate**: from performance stats (or "N/A" if no data)
4. Below the table, add a summary:
   - Total agents count
   - Agents per provider breakdown
   - Agents with no recent activity
   - Any agents with below-average success rates (flag for attention)
