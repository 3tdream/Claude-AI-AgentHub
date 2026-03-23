---
name: auth-review
description: Audit authentication and authorization — JWT, sessions, RBAC, OAuth, permission checks
argument-hint: [file or feature to audit]
---

Authentication & authorization audit for: $ARGUMENTS

1. **Read the code** — find auth-related files:
   - Middleware, guards, auth routes
   - JWT/session handling
   - Role/permission checks

2. **Check:**
   - Token storage (httpOnly cookies? localStorage? — security implications)
   - Token expiration and refresh flow
   - Password hashing algorithm (bcrypt? argon2?)
   - Rate limiting on login endpoints
   - Account lockout after failed attempts
   - RBAC implementation (role checks on every protected route?)
   - API key management
   - OAuth flow security (state parameter, PKCE)

3. **Report:**
   | Finding | Severity | File | Fix |

   Severity: Critical (auth bypass) / High (privilege escalation) / Medium / Low
