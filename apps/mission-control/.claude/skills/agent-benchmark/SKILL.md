---
name: agent-benchmark
description: Run a pipeline step 3 times to measure agent consistency and reliability
disable-model-invocation: true
argument-hint: <step-id> — e.g. s3.1, s4, s8
---

Benchmark step $ARGUMENTS by running it 3 times and comparing results.

Steps:
1. Run the step 3 times using test-step.mjs:
   ```bash
   cd apps/mission-control
   cp data/test-steps/$ARGUMENTS.txt data/test-steps/$ARGUMENTS.backup.txt 2>/dev/null
   node scripts/test-step.mjs <step-key>
   cp data/test-steps/<step-id>.txt data/test-steps/<step-id>.run1.txt
   node scripts/test-step.mjs <step-key>
   cp data/test-steps/<step-id>.txt data/test-steps/<step-id>.run2.txt
   node scripts/test-step.mjs <step-key>
   cp data/test-steps/<step-id>.txt data/test-steps/<step-id>.run3.txt
   ```
   (Map step-id to step-key: s3.1→s3.1, s0-research→s0, etc.)

2. Evaluate all 3 outputs
3. Compare scores across runs

Display:
| Run | Comp | Spec | Act | Task | Overall | Words | Stop |
|-----|------|------|-----|------|---------|-------|------|
| 1   |      |      |     |      |         |       |      |
| 2   |      |      |     |      |         |       |      |
| 3   |      |      |     |      |         |       |      |
| AVG |      |      |     |      |         |       |      |
| STD |      |      |     |      |         |       |      |

**CONSISTENCY VERDICT:**
- STD < 0.3 → Stable (prompt is reliable)
- STD 0.3-0.7 → Moderate (some variance, consider tightening prompt)
- STD > 0.7 → Unstable (prompt needs rework)

4. Restore the best-scoring run as the main output
5. Suggest prompt changes if unstable

WARNING: This makes 3 API calls. Costs ~$0.50-3.00 depending on step.
