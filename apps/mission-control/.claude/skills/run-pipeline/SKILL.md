---
name: run-pipeline
description: Run full pipeline test — all 20 stages sequentially with quality evaluation
disable-model-invocation: true
argument-hint: [all]
---

Run the complete pipeline test (all 20 stages sequentially).

WARNING: This will make ~20 API calls and cost ~$15-20 in tokens. Takes ~50 minutes.

Execute this command:
```bash
cd apps/mission-control && node scripts/test-step.mjs all
```

After the command completes, show the full scores report table and summarize results.
