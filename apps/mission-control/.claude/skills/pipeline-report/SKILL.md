---
name: pipeline-report
description: Show quality scores table for all pipeline stages
disable-model-invocation: true
---

Display the pipeline quality scores report.

Execute this command:
```bash
cd apps/mission-control && node scripts/test-step.mjs report
```

After the command completes, summarize:
1. How many steps PASS vs FAIL
2. Average overall score
3. Any steps that need attention (score < 8.0 or missing)
