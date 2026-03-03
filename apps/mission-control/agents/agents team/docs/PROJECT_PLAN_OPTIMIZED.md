# Beauty CRM — Optimized Project Plan (AI-First)

**Date:** 2026-03-04
**Version:** 2.0 (Compressed)
**Owner:** Michael
**Status:** Active

---

## Why 7 Weeks, Not 28

Traditional 28-week plan assumed human team constraints:
- 8-hour workdays, weekends off
- Standup meetings, retros, planning ceremonies
- Context switching between tasks
- Sequential handoffs with waiting time
- 2-week sprints with buffer

AI agent team reality:
- 24/7 execution, no breaks
- Zero context switching (each agent = dedicated specialist)
- 4-5 agents running in true parallel
- Instant handoffs (structured output → next agent input)
- 3-5 day cycles instead of 2-week sprints
- No onboarding, no sick days, no vacation

---

## Compressed Timeline (7 Weeks)

### Week 1-2: Booking MVP (Core Product)

**Day 1-3: Backend Foundation (parallel)**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Architect | DB schema (ERD), API contracts (OpenAPI spec) | Day 1 |
| Backend | Migrations + Services API + Masters API | Day 1-2 |
| Designer | Booking widget mockups + design tokens | Day 1-2 |
| Cyber | Review DB schema for 152-FZ, RLS policies | Day 2 |

**Day 3-7: Core Flow (parallel)**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Backend | Slots algorithm + Create booking API + Notifications stub | Day 3-5 |
| Frontend | Booking widget (4 steps: service → master → time → confirm) | Day 3-7 |
| QA | API testing with curl as endpoints land | Day 4-7 |

**Day 8-10: Admin + Polish**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Frontend | Admin panel (booking list, filters, actions) | Day 8-9 |
| Frontend | Public shop page (/shop/{slug}) | Day 9-10 |
| Backend | Booking confirmation + basic notifications | Day 8-9 |
| QA | E2E flow testing, edge cases | Day 9-10 |

**Week 1-2 Deliverable:** Working booking flow + admin panel

---

### Week 3: CRM Core + Auth

**Day 1-3: Client DB + Auth (parallel)**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Architect | Auth architecture (JWT + Telegram), client schema | Day 1 |
| Backend | Client CRUD API + visit history + auth endpoints | Day 1-3 |
| Frontend | Client profiles page + search/filter | Day 1-3 |
| Backend | Telegram OAuth + phone verification | Day 2-3 |

**Day 4-5: Dashboard**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Frontend | Owner dashboard (revenue, bookings today, utilization) | Day 4-5 |
| Frontend | Master personal schedule view | Day 4-5 |
| QA | Auth flow testing + client CRUD testing | Day 4-5 |

**Week 3 Deliverable:** Client management + auth + basic dashboard

---

### Week 4: Multi-tenancy + Notifications

**Day 1-3: Multi-tenant (parallel)**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Backend | Shop onboarding API, tenant isolation (RLS) | Day 1-2 |
| Frontend | Shop onboarding wizard (5 steps) | Day 1-3 |
| Backend | Custom slug routing, shop settings API | Day 2-3 |

**Day 4-5: Notifications**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Backend | Telegram bot integration (white-label per salon) | Day 4-5 |
| Backend | Reminder cron (24h + 2h before visit) | Day 4-5 |
| QA | Multi-tenant isolation testing | Day 4-5 |

**Week 4 Deliverable:** Multiple salons operate independently + Telegram notifications

---

### Week 5: 152-FZ Compliance + Security

**Day 1-3: Security hardening (parallel)**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Cyber | Full security audit, OWASP checklist | Day 1-2 |
| Backend | PII encryption at rest (Timeweb PostgreSQL) | Day 1-2 |
| Backend | Consent management (versioned texts, storage) | Day 2-3 |
| Backend | Data deletion pipeline (right to be forgotten) | Day 2-3 |

**Day 4-5: Audit + hardening**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Backend | Audit logging for PII access | Day 4 |
| DevOps | Security headers (CSP, HSTS), SSL hardening | Day 4 |
| Cyber | Final compliance review | Day 5 |
| QA | Security testing, penetration checklist | Day 4-5 |

**Week 5 Deliverable:** 152-FZ compliant, 4 security blockers resolved

---

### Week 6: Payments + Subscription

**Day 1-3: Payment integration (parallel)**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Backend | YooKassa SDK integration | Day 1-2 |
| Backend | Subscription billing (monthly auto-charge) | Day 2-3 |
| Frontend | Payment UI (checkout, receipts, history) | Day 1-3 |

**Day 4-5: Billing finalization**
| Agent | Task | Est. Time |
|-------|------|-----------|
| Backend | Refund processing + invoice generation | Day 4 |
| Frontend | Salon billing dashboard (plan, invoices, usage) | Day 4-5 |
| QA | Payment flow testing (success, failure, refund) | Day 4-5 |

**Week 6 Deliverable:** Salons can pay, clients can prepay bookings

---

### Week 7: Launch Preparation

**Day 1-3: Polish + Deploy**
| Agent | Task | Est. Time |
|-------|------|-----------|
| DevOps | CI/CD pipeline (GitHub Actions → Vercel + Timeweb) | Day 1-2 |
| DevOps | Production environment setup, monitoring (Sentry) | Day 1-2 |
| Frontend | Landing page + marketing site | Day 1-2 |
| QA | Full regression testing, load test (50 concurrent) | Day 2-3 |

**Day 4-5: Go Live**
| Agent | Task | Est. Time |
|-------|------|-----------|
| DevOps | Production deploy, DNS, SSL | Day 4 |
| PM | Onboarding docs, pilot salon outreach | Day 4 |
| QA | Smoke tests on production | Day 4-5 |
| All | Bug fixes from pilot feedback | Day 5 |

**Week 7 Deliverable:** Live production with 3-5 pilot salons

---

## What's IN MVP (7 weeks)

- Online booking widget (4-step flow)
- Public shop pages (/shop/{slug})
- Admin panel (bookings, clients, dashboard)
- Master schedule view
- Auth (Telegram + phone)
- Multi-tenancy (multiple salons)
- Telegram notifications (confirm, remind, cancel)
- 152-FZ compliance (consent, encryption, audit, deletion)
- Payments (YooKassa, subscriptions)
- Basic analytics (bookings count, revenue, utilization)
- CI/CD + monitoring
- Russian language only

## What's DEFERRED to v1.1 (post-launch)

- AI features (smart scheduling, churn prediction, auto-responses)
- Loyalty program (points, referrals, promos, gift cards)
- Multi-language (EN, HE) + RTL
- Real-time slot updates (WebSocket) — polling for MVP
- Medical photo gallery (before/after)
- CSV import/export
- SMS integration (Telegram-first for MVP)
- PWA / app store
- Advanced analytics dashboard

---

## Optimized Cost Breakdown

### AI Agent Costs

**Model optimization per task type:**

| Task Type | Model | Why |
|-----------|-------|-----|
| Architecture decisions | Opus | Complex reasoning required |
| Code generation (complex) | Sonnet | Good balance of quality/cost |
| Code generation (CRUD/boilerplate) | Haiku | Simple patterns, 10x cheaper |
| Testing, review | Sonnet | Needs understanding of code |
| Deployment, config | Haiku | Scripted operations |
| Research, docs | Haiku | Structured output, simple |

**Estimated tokens per week (all agents combined):**

| Week | Focus | Est. Tokens (in+out) | Est. Cost |
|------|-------|---------------------|-----------|
| 1-2 | Booking MVP | ~8M | $80 |
| 3 | CRM + Auth | ~5M | $45 |
| 4 | Multi-tenant + Notif | ~4M | $35 |
| 5 | Security + 152-FZ | ~3M | $30 |
| 6 | Payments | ~3M | $30 |
| 7 | Launch | ~2M | $15 |
| **Total** | | **~25M tokens** | **~$235** |

### Infrastructure (Development Phase)

| Service | Tier | Cost/Month |
|---------|------|-----------|
| Vercel | Hobby (free) | $0 |
| Supabase | Free tier (500MB, 50K rows) | $0 |
| Timeweb VPS | Minimal (for PII DB) | $10 |
| Domain | .ru domain | $3 |
| GitHub | Free tier | $0 |
| Sentry | Free tier | $0 |

**Infra during dev (2 months): ~$26**

### Infrastructure (Production, post-launch)

| Service | Tier | Cost/Month |
|---------|------|-----------|
| Vercel | Pro (when traffic grows) | $0-20 |
| Supabase | Free → Pro at 20+ salons | $0-25 |
| Timeweb VPS | Scaled as needed | $10-25 |
| Telegram Bot API | Free | $0 |
| Domain + SSL | Annual | $3 |
| Sentry | Free tier | $0 |

**Production monthly: $13-73** (scales with usage)

### External / One-time

| Item | Cost |
|------|------|
| Domain registration (.ru) | $5 |
| YooKassa setup | Free (commission-based) |
| Apple Developer (later, for PWA) | Deferred |
| Legal 152-FZ review | Deferred until 10+ clients |

**External: ~$5**

---

## Total Cost Summary

| Category | Cost |
|----------|------|
| AI Agents (7 weeks) | $235 |
| Infrastructure (2 months dev) | $26 |
| External services | $5 |
| **TOTAL TO LAUNCH** | **~$266** |

### Comparison

| Plan | Duration | Cost |
|------|----------|------|
| Original (v1.0) | 28 weeks | $2,194 - $6,740 |
| Optimized (v2.0) | 7 weeks | **~$266** |
| **Savings** | **75% faster** | **88-96% cheaper** |

---

## Revenue vs Cost

| Month | Salons | Revenue | Costs | Net |
|-------|--------|---------|-------|-----|
| Dev (month 1-2) | 0 | $0 | $266 | -$266 |
| Launch (month 3) | 5A + 1B | $385 | $30 | +$355 |
| Growth (month 4) | 10A + 3B | $880 | $50 | +$830 |
| Scale (month 6) | 20A + 5B | $1,650 | $73 | +$1,577 |

**Break-even: Week 1 after launch (with just 5 salons)**

---

## Risks

| Risk | Mitigation |
|------|-----------|
| Free tier limits hit during dev | Supabase free = 500MB, enough for dev. Upgrade at launch. |
| Telegram bot rate limits | 30 msgs/sec limit is fine for MVP scale |
| No SMS = lost clients | 85%+ of target audience uses Telegram in Russia |
| 152-FZ without lawyer | Use standard templates, get legal review when profitable |
| AI agent quality issues | Quality gates: QA reviews every PR before merge |

---

*Beauty CRM Agent Team | Optimized Plan v2.0 | 2026-03-04*
