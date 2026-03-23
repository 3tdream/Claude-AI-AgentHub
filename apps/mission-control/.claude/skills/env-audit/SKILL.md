---
name: env-audit
description: Audit environment variables — find unused, missing, exposed, undocumented env vars
argument-hint: [directory] or empty for current project
---

Environment variable audit.

1. **Scan code for env var usage:**
   - `process.env.` references
   - `.env` file entries
   - `.env.example` entries
   - `data/api-keys.json` entries

2. **Cross-reference:**

| Variable | In Code | In .env | In .env.example | In .gitignore | Status |
|----------|---------|---------|-----------------|---------------|--------|
| | Yes/No | Yes/No | Yes/No | Yes/No | |

Status:
- OK — used, documented, not exposed
- UNUSED — in .env but not referenced in code
- MISSING — referenced in code but not in .env.example
- EXPOSED — in committed files (security risk!)
- UNDOCUMENTED — used but not in .env.example

3. **Security check:**
   - Any secrets in committed files?
   - Any default values that are real credentials?
   - Any vars with `your-` prefix (placeholder not replaced)?

4. **Recommendations:**
   - Remove unused vars
   - Add missing vars to .env.example
   - Move exposed vars to .env (gitignored)
