---
name: secret-scan
description: Grep-based secret scanner — find exposed API keys, passwords, tokens in code and git history
argument-hint: [directory to scan] or empty for full project
---

Secret scan for exposed credentials.

1. **Grep for patterns:**
   - API keys: `sk-`, `sk_live_`, `pk_`, `AKIA`, `ghp_`, `github_pat_`
   - Passwords: `password\s*=`, `secret\s*=`, `passwd`
   - Tokens: `token\s*=`, `bearer`, `jwt`
   - Connection strings: `postgresql://`, `mongodb://`, `redis://`
   - Private keys: `-----BEGIN`, `PRIVATE KEY`
   - AWS: `aws_access_key`, `aws_secret`

2. **Check files:**
   - `.env` files (should be in .gitignore)
   - `*.json` config files
   - Hardcoded strings in source code
   - Comments with credentials
   - Git history (`git log -p --all -S 'password'`)

3. **Report:**
   | File | Line | Type | Risk | Status |
   Status: exposed (in code) / gitignored (safe) / env-var (safe)

4. **Verify .gitignore** covers:
   - `.env`, `.env.local`, `.env.production`
   - `data/api-keys.json`, `data/jira-config.json`
   - Any file containing secrets
