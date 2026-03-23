---
name: cost-analysis
description: Analyze pipeline execution costs — token usage, USD by model, agent, trends
disable-model-invocation: true
---

Analyze pipeline execution costs.

Steps:
1. Read `data/test-steps/scores.json` for test run data
2. Read recent pipeline runs from `data/pipeline-runs/` (latest 5)
3. Read `data/pipeline-analytics.json` if exists

Calculate and display:

**PER-STEP COST TABLE:**
| Step | Agent | Model | Input Tok | Output Tok | Cost USD |
Use pricing: sonnet-4-6 ($3/$15 per 1M), opus-4-6 ($15/$75), haiku-4-5 ($0.8/$4), gpt-5.1 ($5/$15), gemini-2.5-pro ($1.25/$10)

**TOTALS:**
- Total tokens (input + output)
- Total cost USD
- Cost per step (average)
- Most expensive step
- Most expensive agent

**OPTIMIZATION SUGGESTIONS:**
- Steps that could use a cheaper model without quality loss
- Steps with excessive input context (truncation potential)
- Steps with low output/cost ratio
