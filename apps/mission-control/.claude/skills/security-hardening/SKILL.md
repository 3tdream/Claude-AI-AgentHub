---
name: security-hardening
description: Proactive security improvements — headers, CSP, rate limiting, input sanitization, dependency audit
disable-model-invocation: true
---

Proactive security hardening pass.

Unlike `/cyber` (finds vulnerabilities), this skill **adds defenses** that may not exist yet.

## Checks & Improvements:

### HTTP Headers
- Content-Security-Policy configured?
- X-Frame-Options / X-Content-Type-Options set?
- Strict-Transport-Security enabled?
- Referrer-Policy set?
→ Generate middleware or next.config.ts headers

### Rate Limiting
- Are public API endpoints rate-limited?
- Are auth endpoints (login, register) throttled?
→ Suggest rate limit middleware

### Input Sanitization
- Are user inputs sanitized before DB/display?
- XSS vectors in dangerouslySetInnerHTML usage?
- SQL injection in raw queries?
→ Suggest sanitization helpers

### Dependency Audit
```bash
npm audit --production
```
→ Report vulnerabilities, suggest fixes

### Config Security
- Are secrets in environment variables (not hardcoded)?
- Is CORS properly configured?
- Are debug endpoints disabled in production?

## Output:
| # | Improvement | File | Effort | Impact |
Priority: HIGH (prevents real attacks) → MEDIUM → LOW (defense-in-depth)

Generate ready-to-apply code for each improvement.
