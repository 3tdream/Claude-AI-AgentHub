---
name: test-stage
description: Run a single pipeline stage via direct API call and evaluate output quality
disable-model-invocation: true
argument-hint: <s0|s1|s2|s2.5|s3.1|s3.2|s3.3|s3.4|s4|s4.5|s5|s6|s7|s8|s8.5|s9|s10|s11|s12a|s12b>
---

Run a single pipeline step test with quality evaluation.

Execute this command:
```bash
cd apps/mission-control && node scripts/test-step.mjs $ARGUMENTS
```

After the command completes:
1. Report the step name, agent, word count, duration, and stop reason
2. Report quality scores: Completeness, Specificity, Actionability, Task Completion, Overall
3. Report PASS/FAIL status
4. If FAIL — show the evaluator feedback

Available steps: s0, s1, s2, s2.5, s3.1, s3.2, s3.3, s3.4, s4, s4.5, s5, s6, s7, s8, s8.5, s9, s10, s11, s12a, s12b
