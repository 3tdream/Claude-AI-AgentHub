# Beauty CRM — Full Project Plan & Cost Estimate

**Date:** 2026-03-04
**Owner:** PM-Agent (Michael)
**Status:** Planning Phase

---

## Project Overview

AI-powered CRM platform for beauty businesses and medical cosmetology clinics.
- **Scenario A:** Basic salons — 4,990 RUB/month (up to 5 masters)
- **Scenario B:** Medical cosmetology — 9,990 RUB/month (152-FZ compliance)
- **Target MVP:** 20 salons
- **Scale target:** 500+ shops

### Tech Stack
- Frontend: Next.js 14 (Vercel)
- Backend: Node.js (Timeweb Cloud VPS)
- Database: Supabase PostgreSQL (non-PII) + Timeweb PostgreSQL (PII, 152-FZ)
- AI: Claude Sonnet + GPT-5.1
- Auth: Telegram, phone, email
- Languages: RU / EN / HE

### Agent Team (10 agents)
| Agent | Model | Role |
|-------|-------|------|
| Orchestrator | Claude Opus | Central coordinator |
| PM-Agent | Claude Sonnet | Product management, sole Jira owner |
| Architect | Claude Opus | System design, API contracts |
| Backend | GPT-5.1 | Node.js implementation |
| Frontend | GPT-5.1 | Next.js/React UI |
| Designer | Gemini 2.5 Pro | Aura design system |
| QA | Claude Sonnet | Testing, security review |
| DevOps | Claude Haiku | Infrastructure, CI/CD |
| Cyber | Claude Sonnet | 152-FZ, OWASP compliance |
| Research | Claude Haiku | Market analysis |

---

## Phase 1: Foundation (Sprints 1-2, 4 weeks)

### Sprint 1 — "Foundation & Core Flow" (42 SP)

| ID | Story | SP | Priority | Component |
|----|-------|----|----------|-----------|
| BCRM-BOOK-001 | Модель данных и API каталога услуг | 5 | Must | Backend |
| BCRM-BOOK-002 | Модель данных мастеров и API | 5 | Must | Backend |
| BCRM-BOOK-003 | Расписание и API свободных слотов | 8 | Must | Backend |
| BCRM-BOOK-004 | API создания записи (бронирования) | 5 | Must | Backend |
| BCRM-BOOK-005 | Веб-виджет — каталог услуг | 5 | Must | Frontend |
| BCRM-BOOK-006 | Веб-виджет — выбор мастера | 3 | Must | Frontend |
| BCRM-BOOK-007 | Веб-виджет — календарь и слоты | 8 | Must | Frontend |
| BCRM-BOOK-011 | Stepper-навигация виджета | 3 | Should | Frontend |

**Parallel tracks:**
- Backend (days 1-7): BOOK-001 → 002 → 003 → 004
- Frontend (days 3-14): BOOK-011 + 005 → 006 → 007

**Definition of Done:** Client can walk through steps 1-3 of booking widget. APIs fully functional with unit tests. Mobile-first tested.

### Sprint 2 — "Complete Flow & Admin" (34 SP)

| ID | Story | SP | Priority | Component |
|----|-------|----|----------|-----------|
| BCRM-BOOK-008 | Виджет — форма записи и подтверждение | 5 | Must | Frontend |
| BCRM-BOOK-009 | Админ-панель записей | 8 | Must | Frontend |
| BCRM-BOOK-010 | Система нотификаций | 5 | Must | Backend |
| BCRM-BOOK-012 | Публичная страница салона | 5 | Should | Frontend |
| BCRM-BOOK-013 | Согласие 152-ФЗ (Сценарий Б) | 3 | Must (Б) | Full-stack |
| BCRM-BOOK-014 | Real-time обновление слотов | 5 | Could | Full-stack |
| BCRM-BOOK-015 | Аналитика записей | 3 | Could | Backend |

**Definition of Done:** Full E2E booking flow works. Admin can manage bookings. Notifications sent. 152-FZ consent collected.

**Phase 1 Deliverable:** Working online booking flow end-to-end (76 SP)

---

## Phase 2: CRM Core (Sprints 3-4, 4 weeks)

### Sprint 3 — "Client Database" (~40 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| Client database schema + API | 8 | Backend |
| Client profiles (name, phone, email, visits, notes) | 5 | Full-stack |
| Visit history per client | 5 | Full-stack |
| Client search & filter (name, phone, tags) | 5 | Frontend |
| Client notes & tags system | 3 | Full-stack |
| Client import (CSV upload) | 5 | Full-stack |
| Client merge (deduplication) | 5 | Backend |
| RLS policies for client data | 4 | Backend |

### Sprint 4 — "Business Dashboard" (~35 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| Owner dashboard layout | 5 | Frontend |
| Revenue chart (daily/weekly/monthly) | 5 | Full-stack |
| Bookings today widget | 3 | Frontend |
| Popular services ranking | 3 | Backend |
| Master utilization (% filled slots) | 5 | Full-stack |
| Master personal dashboard (my schedule, my clients) | 8 | Frontend |
| Export reports (CSV/PDF) | 3 | Frontend |
| Dashboard real-time updates | 3 | Full-stack |

**Phase 2 Deliverable:** Salon owners manage clients + see business metrics (75 SP)

---

## Phase 3: Auth & Multi-tenancy (Sprints 5-6, 4 weeks)

### Sprint 5 — "Authentication" (~38 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| Telegram login (OAuth) | 8 | Full-stack |
| Phone verification (SMS code) | 5 | Backend |
| Email/password auth | 5 | Full-stack |
| JWT + refresh token system | 5 | Backend |
| Role-based access control (owner/admin/master/client) | 8 | Full-stack |
| Password reset flow | 3 | Full-stack |
| Session management (logout, revoke) | 4 | Backend |

### Sprint 6 — "Multi-tenancy" (~42 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| Shop onboarding wizard (5 steps) | 8 | Frontend |
| Custom slug/subdomain per shop (/shop/{slug}) | 5 | Full-stack |
| Shop settings (hours, services, masters, logo, photos) | 8 | Full-stack |
| Subscription billing (Scenario A: 4990, B: 9990) | 8 | Full-stack |
| Trial period (14 days free) | 3 | Backend |
| Shop deactivation / suspension | 3 | Backend |
| Tenant data isolation (RLS + middleware) | 5 | Backend |
| Admin super-panel (platform-wide) | 2 | Frontend |

**Phase 3 Deliverable:** Multiple salons register and operate independently (80 SP)

---

## Phase 4: Communication & AI (Sprints 7-8, 4 weeks)

### Sprint 7 — "Notifications & Messaging" (~35 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| SMS integration (SMS.ru provider) | 5 | Backend |
| Telegram bot per salon (white-label) | 8 | Backend |
| Email templates (booking confirm, reminder, cancel) | 5 | Backend |
| Reminder cron jobs (24h + 2h before visit) | 5 | Backend |
| In-app notifications (admin panel) | 5 | Frontend |
| Notification preferences (client opt-in/out) | 3 | Full-stack |
| Delivery status tracking + retry queue | 4 | Backend |

### Sprint 8 — "AI Features" (~40 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| AI appointment suggestions (optimal time for client) | 8 | Backend |
| Smart scheduling (fill gaps in master schedule) | 8 | Backend |
| Client churn prediction (no visit > 30 days) | 5 | Backend |
| Auto-response templates (AI-generated) | 5 | Backend |
| AI marketing text generator (promos, posts) | 5 | Full-stack |
| AI insights dashboard widget | 5 | Frontend |
| AI cost tracking & limits per salon | 4 | Backend |

**Phase 4 Deliverable:** Automated client communication + AI-powered insights (75 SP)

---

## Phase 5: Medical Scenario B (Sprints 9-10, 4 weeks)

### Sprint 9 — "Medical Features" (~38 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| Contraindication questionnaire (per service) | 8 | Full-stack |
| Medical history per client | 5 | Full-stack |
| Treatment protocols (templates) | 5 | Full-stack |
| Doctor-specific fields (license, specialization) | 3 | Full-stack |
| Prescription tracking | 5 | Full-stack |
| Medical photo gallery (before/after) | 5 | Full-stack |
| Medical disclaimer on booking | 3 | Frontend |
| Scenario B feature flag (enable per shop) | 4 | Backend |

### Sprint 10 — "152-FZ Compliance & Security" (~42 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| PII encryption at rest (Timeweb PostgreSQL) | 8 | Backend |
| Consent management system (versioned texts) | 5 | Full-stack |
| Data deletion pipeline (right to be forgotten) | 8 | Backend |
| Audit logging for all PII access | 8 | Backend |
| OWASP Top 10 hardening | 5 | Backend |
| Security headers (CSP, HSTS, X-Frame) | 3 | DevOps |
| Penetration testing checklist | 3 | QA + Cyber |
| Privacy policy generator per salon | 2 | Full-stack |

**Phase 5 Deliverable:** Medical cosmetology clinics can use platform legally (80 SP)

---

## Phase 6: Payments & Loyalty (Sprints 11-12, 4 weeks)

### Sprint 11 — "Payments" (~40 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| YooKassa / Tinkoff Pay integration | 8 | Backend |
| Online prepayment for booking | 5 | Full-stack |
| Deposit system (partial prepayment) | 5 | Full-stack |
| Salon subscription billing (monthly auto-charge) | 8 | Backend |
| Invoice generation (PDF) | 5 | Backend |
| Refund processing | 5 | Backend |
| Payment history & receipts | 4 | Full-stack |

### Sprint 12 — "Loyalty Program" (~35 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| Points system (earn per visit/spend) | 8 | Full-stack |
| Referral program (invite friend → bonus) | 5 | Full-stack |
| Promo codes (%, fixed, first visit) | 5 | Full-stack |
| Gift certificates (digital) | 5 | Full-stack |
| Birthday auto-discount | 3 | Backend |
| Loyalty dashboard (client-facing) | 5 | Frontend |
| Loyalty analytics (salon-facing) | 4 | Frontend |

**Phase 6 Deliverable:** Full monetization pipeline (75 SP)

---

## Phase 7: Scale & Launch (Sprints 13-14, 4 weeks)

### Sprint 13 — "Internationalization & Performance" (~35 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| i18n setup (next-intl: RU/EN/HE) | 8 | Frontend |
| RTL support for Hebrew | 5 | Frontend |
| Translation management | 3 | Full-stack |
| Performance optimization (Core Web Vitals) | 5 | Frontend |
| Database query optimization + indexes | 5 | Backend |
| CDN setup for static assets | 3 | DevOps |
| Load testing (500+ concurrent shops) | 3 | QA |
| Caching layer (Redis/in-memory) | 3 | Backend |

### Sprint 14 — "Launch" (~30 SP)

| Feature | SP | Component |
|---------|-----|-----------|
| Marketing landing page | 5 | Frontend |
| Salon onboarding documentation | 3 | PM |
| API documentation (Swagger/OpenAPI) | 3 | Backend |
| Monitoring & alerting (Sentry, uptime) | 5 | DevOps |
| PWA setup (installable web app) | 3 | Frontend |
| Pilot program (20 salons) | 5 | PM + QA |
| Bug bash & stabilization | 3 | QA |
| Production deploy & DNS setup | 3 | DevOps |

**Phase 7 Deliverable:** Production-ready, multi-language platform (65 SP)

---

## Project Timeline Summary

```
Month 1  [████████] Phase 1: Foundation (Booking MVP)
Month 2  [████████] Phase 2: CRM Core (Clients + Dashboard)
Month 3  [████████] Phase 3: Auth & Multi-tenancy
Month 4  [████████] Phase 4: Communication & AI
Month 5  [████████] Phase 5: Medical Scenario B + 152-FZ
Month 6  [████████] Phase 6: Payments & Loyalty
Month 7  [████████] Phase 7: Scale & Launch
```

| Metric | Value |
|--------|-------|
| Total Sprints | 14 |
| Duration | 28 weeks (~7 months) |
| Total Story Points | ~526 SP |
| Total User Stories | ~100-120 |
| Total Epics | 12 |
| Avg Velocity | ~38 SP/sprint |

---

## Dependency Graph (Epics)

```
BCRM-BOOKING-MVP (Phase 1)
    │
    ├── BCRM-CRM-CORE (Phase 2)
    │   └── BCRM-DASHBOARD (Phase 2)
    │
    ├── BCRM-AUTH (Phase 3)
    │   └── BCRM-MULTI-TENANT (Phase 3)
    │       │
    │       ├── BCRM-NOTIFICATIONS (Phase 4)
    │       │   └── BCRM-AI-FEATURES (Phase 4)
    │       │
    │       ├── BCRM-MEDICAL (Phase 5)
    │       │   └── BCRM-COMPLIANCE (Phase 5)
    │       │
    │       └── BCRM-PAYMENTS (Phase 6)
    │           └── BCRM-LOYALTY (Phase 6)
    │
    └── BCRM-I18N-SCALE (Phase 7)
        └── BCRM-LAUNCH (Phase 7)
```

---

## Cost Breakdown

### 1. AI Agent Costs (Development)

| Agent | Model | Price (in/out per 1M tokens) | Est. Tokens/Sprint | Cost/Sprint |
|-------|-------|------------------------------|-------------------|-------------|
| Orchestrator | Claude Opus | $15 / $75 | ~500K in + 200K out | $22.50 |
| PM-Agent | Claude Sonnet | $3 / $15 | ~300K in + 150K out | $3.15 |
| Architect | Claude Opus | $15 / $75 | ~400K in + 200K out | $21.00 |
| Backend | GPT-5.1 | ~$10 / $30 | ~800K in + 400K out | $20.00 |
| Frontend | GPT-5.1 | ~$10 / $30 | ~800K in + 400K out | $20.00 |
| Designer | Gemini 2.5 Pro | ~$2.50 / $15 | ~300K in + 100K out | $2.25 |
| QA | Claude Sonnet | $3 / $15 | ~500K in + 200K out | $4.50 |
| DevOps | Claude Haiku | $0.25 / $1.25 | ~200K in + 100K out | $0.18 |
| Cyber | Claude Sonnet | $3 / $15 | ~300K in + 100K out | $2.40 |
| Research | Claude Haiku | $0.25 / $1.25 | ~200K in + 50K out | $0.11 |

| | Per Sprint | 14 Sprints |
|---|-----------|-----------|
| **AI Agent Total** | **~$96** | **~$1,344** |

### 2. Infrastructure (Monthly)

| Service | Purpose | Cost/Month |
|---------|---------|-----------|
| Vercel Pro | Frontend hosting, preview deploys | $20 |
| Timeweb Cloud VPS | Backend + PII database (Russia) | $15-25 |
| Supabase Pro | Non-PII database + Realtime + Auth | $25 |
| SMS.ru | SMS notifications (per volume) | $10-30 |
| Domain + SSL | Custom domains | $5 |
| Sentry | Error monitoring (free tier) | $0 |
| GitHub | Repository + Actions CI/CD (free tier) | $0 |

| | Monthly | 7 Months Dev |
|---|--------|-------------|
| **Infrastructure Total** | **$75-105** | **$525-735** |

### 3. External Services (One-time / Setup)

| Service | Cost |
|---------|------|
| YooKassa / Tinkoff Pay setup | Free (commission-based: 2.8-3.5%) |
| Apple Developer Account (PWA/App) | $99/year |
| Google Play Developer (if needed) | $25 one-time |
| Legal: 152-FZ compliance docs (lawyer) | $200-500 |
| Design assets (stock photos, icons) | $0-100 |

| | |
|---|---|
| **External Total** | **$325-725** |

### 4. Optional: Human Review / QA

| Service | Cost |
|---------|------|
| Security audit (freelance pentester) | $500-1,000 |
| Legal review (152-FZ lawyer, full) | $500-1,500 |
| UX testing (5 real users) | $100-300 |

| | |
|---|---|
| **Optional Total** | **$1,100-2,800** |

---

## Total Cost Summary

### Minimum (AI-only development)

| Category | Cost |
|----------|------|
| AI Agents (14 sprints) | $1,344 |
| Infrastructure (7 months) | $525 |
| External services | $325 |
| **TOTAL MINIMUM** | **$2,194** |

### Recommended (with security & legal review)

| Category | Cost |
|----------|------|
| AI Agents (14 sprints) | $1,344 |
| Infrastructure (7 months) | $735 |
| External services | $725 |
| Security audit | $750 |
| Legal review | $1,000 |
| **TOTAL RECOMMENDED** | **$4,554** |

### Maximum (full coverage)

| Category | Cost |
|----------|------|
| AI Agents (14 sprints) | $1,600 |
| Infrastructure (7 months) | $735 |
| External services | $725 |
| Security + legal + UX | $2,800 |
| Buffer (15%) | $880 |
| **TOTAL MAXIMUM** | **$6,740** |

---

## Post-Launch Monthly Costs (Production)

| Category | Cost/Month |
|----------|-----------|
| Vercel Pro | $20 |
| Timeweb VPS | $25 |
| Supabase Pro | $25 |
| SMS (per 1000 messages) | $10-50 |
| AI runtime (Claude + GPT) | $30-80 |
| Domain + SSL | $5 |
| Monitoring | $0-10 |
| **Monthly Operational** | **$115-215** |

---

## Revenue Projections & Break-Even

### Pricing

| Plan | Price/Month | Annual |
|------|-----------|--------|
| Scenario A (basic salon) | 4,990 RUB (~$55) | 59,880 RUB (~$660) |
| Scenario B (medical) | 9,990 RUB (~$110) | 119,880 RUB (~$1,320) |

### Break-Even Scenarios

| Scenario | Shops | Monthly Revenue | Monthly Costs | Profit |
|----------|-------|----------------|---------------|--------|
| MVP (month 1) | 10A + 2B | $770 | $165 | $605 |
| Growth (month 3) | 15A + 5B | $1,375 | $180 | $1,195 |
| Target (month 6) | 30A + 10B | $2,750 | $215 | $2,535 |
| Scale (year 1) | 100A + 30B | $8,800 | $350 | $8,450 |

### ROI Timeline

| Milestone | When |
|-----------|------|
| Development cost recovered | Month 2-3 after launch |
| Monthly profit > $1,000 | Month 3-4 after launch |
| Monthly profit > $5,000 | Month 8-10 after launch |
| Annual revenue > $100,000 | ~500 shops (year 2) |

---

## Risks & Mitigations

| # | Risk | Impact | Probability | Mitigation |
|---|------|--------|-------------|------------|
| 1 | Race condition on booking slots | High | Medium | Optimistic locking + DB transactions |
| 2 | 152-FZ non-compliance | Critical | Medium | Cyber-Agent review + lawyer audit |
| 3 | SMS provider reliability | Medium | Medium | Multi-provider fallback + Telegram |
| 4 | AI cost overrun | Low | Low | Token budgets per agent, monitoring |
| 5 | Scaling beyond 500 shops | Medium | Low | Horizontal scaling plan from Sprint 13 |
| 6 | Payment fraud | High | Low | YooKassa built-in fraud protection |
| 7 | Mobile UX poor | Medium | Medium | Mobile-first design, real device testing |
| 8 | Competitor launches similar | Medium | Medium | Speed to market, AI differentiation |

---

## Quality Gates (Per Sprint)

Every sprint must pass before moving to the next:

- [ ] All Must Have stories completed
- [ ] Unit test coverage > 70%
- [ ] No Critical/High bugs open
- [ ] Mobile responsive tested (iOS + Android)
- [ ] API response time < 500ms (p95)
- [ ] Accessibility WCAG AA compliant
- [ ] Security review passed (QA + Cyber agents)
- [ ] PM-Agent sprint review documented

---

*Generated by Beauty CRM Agent Team | 2026-03-04*
*Pipeline: Orchestrator → PM-Agent → Architect-Agent*
