---
name: eval-stage
description: Evaluate existing pipeline stage output without re-running the API call
disable-model-invocation: true
argument-hint: <s0|s1|s2|s2.5|s3.1|s3.2|s3.3|s3.4|s4|s4.5|s5|s6|s7|s8|s8.5|s9|s10|s11|s12a|s12b>
---

Evaluate a previously saved pipeline step output (no new API call — only evaluation).

Execute this command:
```bash
cd apps/mission-control && node scripts/test-step.mjs $ARGUMENTS --eval
```

After the command completes:
1. Report quality scores: Completeness, Specificity, Actionability, Task Completion, Overall
2. Report PASS/FAIL status
3. Show evaluator feedback
