---
name: agent-memory
description: Extract lessons learned from a pipeline run and save to Knowledge Base for future runs
disable-model-invocation: true
argument-hint: [run-id] or "latest"
---

Extract lessons from pipeline run and persist to Knowledge Base.

Steps:
1. If $ARGUMENTS is "latest" or empty — find the most recent run in `data/pipeline-runs/`
   Otherwise read the specified run ID
2. Read the run JSON and extract:
   - Which steps passed/failed
   - Quality scores per step
   - Evaluator feedback per step
   - Any escalations or retries

3. For each step, classify the outcome:

   **SUCCESS (score >= 8.5):**
   - What made it work well? → add to `success-patterns.json`
   - Extract: structure, format, specificity level

   **FAILURE (score < 7.5 or status: failed):**
   - What went wrong? → add to `failure-patterns.json`
   - Extract: root cause, evaluator criticism, prompt issue

   **ARCHITECTURE INSIGHT (from Architect/Cyber steps):**
   - New patterns discovered → add to `architecture-patterns.json`

   **SECURITY FINDING (from Cyber steps):**
   - New vulnerability patterns → add to `security-playbook.json`

4. Display summary:
   | Type | Count | Examples |
   |------|-------|---------|
   | Success patterns | N | "ADR with specific tech names scored 9.4" |
   | Failure patterns | N | "Backend truncated at 65K tokens" |
   | Architecture | N | "SQS FIFO for event processing" |
   | Security | N | "JWT in URL path = Critical" |

5. Write all new patterns to KB files
6. Report what was learned

This is how agents get smarter over time — each run feeds the knowledge base.
