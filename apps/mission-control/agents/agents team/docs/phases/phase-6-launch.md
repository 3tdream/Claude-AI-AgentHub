# Phase 6: Launch Preparation (Week 7)

## Goal
Production deploy. CI/CD pipeline. Monitoring. Pilot with 3-5 salons.

## Done Criteria
- [ ] CI/CD: GitHub Actions → Vercel + Timeweb auto-deploy
- [ ] Production environment configured
- [ ] Monitoring: Sentry errors + uptime checks
- [ ] Landing page live
- [ ] Onboarding documentation for salon owners
- [ ] 3-5 pilot salons onboarded
- [ ] Smoke tests passed on production
- [ ] No Critical/High bugs open

## Agent Assignments

| Agent | Status | Model | Tasks |
|-------|--------|-------|-------|
| Orchestrator | ACTIVE | sonnet | Final coordination, launch checklist |
| PM-Agent | ACTIVE | sonnet | Onboarding docs, pilot outreach, launch plan |
| Architect | IDLE | — | Not needed |
| Backend | ACTIVE | haiku | Bug fixes, performance tuning |
| Frontend | ACTIVE | haiku | Landing page, bug fixes |
| Designer | ACTIVE | haiku | Landing page design specs |
| QA | ACTIVE | sonnet | Full regression, load test, smoke tests |
| DevOps | **LEAD** | sonnet | CI/CD, production deploy, monitoring, DNS |
| Cyber | ACTIVE | sonnet | Final security scan before go-live |
| Research | IDLE | — | Not needed |

## CI/CD Pipeline

```
Push to main
  → GitHub Actions
    → lint (eslint)
    → type-check (tsc --noEmit)
    → test (vitest)
    → build
    → deploy frontend (Vercel, automatic)
    → deploy backend (SSH to Timeweb VPS)
```

## Production Checklist

### Infrastructure
- [ ] Vercel project linked to repo (auto-deploy main)
- [ ] Timeweb VPS: Node.js + PM2 + nginx
- [ ] Supabase: production project (separate from dev)
- [ ] Domain: DNS A record → Vercel, backend subdomain → Timeweb
- [ ] SSL: Vercel auto-SSL, Timeweb Let's Encrypt

### Environment Variables
- [ ] SUPABASE_URL, SUPABASE_ANON_KEY
- [ ] TIMEWEB_DB_URL (PII database)
- [ ] JWT_SECRET, JWT_REFRESH_SECRET
- [ ] YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY
- [ ] TELEGRAM_BOT_TOKEN (platform bot)
- [ ] SENTRY_DSN

### Monitoring
- [ ] Sentry: error tracking (frontend + backend)
- [ ] Uptime: healthcheck endpoint pinged every 5 min
- [ ] Alerts: Telegram notification on errors

### Launch Day
1. Final QA smoke test on staging
2. DevOps deploys to production
3. DNS switch
4. Cyber runs final security scan
5. PM onboards 3-5 pilot salons
6. Monitor for 48 hours (on-call: QA + DevOps)
