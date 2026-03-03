# Phase 4: 152-FZ Compliance + Security (Week 5)

## Goal
Full 152-FZ compliance. Resolve all 4 security blockers. OWASP hardening.

## Done Criteria
- [ ] PII encryption at rest on Timeweb PostgreSQL
- [ ] Consent management system (versioned texts)
- [ ] Data deletion pipeline (right to be forgotten)
- [ ] Audit logging for all PII access
- [ ] OWASP Top 10 checklist passed
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Rate limiting on all public endpoints
- [ ] Final security review passed

## Agent Assignments

| Agent | Status | Model | Tasks |
|-------|--------|-------|-------|
| Orchestrator | ACTIVE | sonnet | Coordinate security sprint |
| PM-Agent | ACTIVE | haiku | Track security tickets |
| Architect | IDLE | — | No new architecture needed |
| Backend | ACTIVE | sonnet | Encryption, consent API, deletion pipeline, audit logs |
| Frontend | ACTIVE | haiku | Consent UI checkbox + policy link only |
| Designer | IDLE | — | Not needed |
| QA | ACTIVE | sonnet | Penetration testing, OWASP checklist |
| DevOps | ACTIVE | haiku | Security headers, SSL hardening |
| Cyber | **LEAD** | sonnet | Full audit, compliance review, sign-off |
| Research | IDLE | — | Not needed |

## 4 Security Blockers (Must resolve before production)

### Blocker 1: PII Encryption at Rest
- Encrypt: name, phone, email, address, medical history
- Timeweb PostgreSQL: pgcrypto extension
- Key management: environment variable, rotated quarterly
- Backend-Agent implements, Cyber-Agent verifies

### Blocker 2: Consent Management
- Versioned consent texts (v1, v2, etc.)
- Store: client_id, consent_version, timestamp, IP, user_agent
- Scenario B: additional medical data consent
- Must be auditable

### Blocker 3: Data Deletion Pipeline
- Client requests deletion → soft delete (30 day grace) → hard delete
- Cascade: bookings anonymized, PII fields nulled
- Audit log entry for deletion
- Admin confirmation required

### Blocker 4: PII Access Audit Log
- Log every read/write of PII fields
- Fields: who, what, when, from_where (IP)
- Retention: 3 years (152-FZ requirement)
- Read-only table, no updates/deletes allowed

## OWASP Top 10 Checklist
- [ ] A01: Broken Access Control → RBAC + RLS
- [ ] A02: Cryptographic Failures → PII encryption
- [ ] A03: Injection → Parameterized queries (Supabase handles)
- [ ] A04: Insecure Design → Architecture review
- [ ] A05: Security Misconfiguration → Headers, defaults
- [ ] A06: Vulnerable Components → npm audit
- [ ] A07: Auth Failures → JWT best practices
- [ ] A08: Data Integrity → Input validation (zod)
- [ ] A09: Logging Failures → Audit log
- [ ] A10: SSRF → No external fetches from user input
