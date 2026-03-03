# Phase 2: CRM Core + Auth (Week 3)

## Goal
Client database with profiles and visit history. Authentication via Telegram + phone. Owner and master dashboards.

## Done Criteria
- [ ] Client CRUD API + search/filter
- [ ] Visit history linked to bookings
- [ ] Telegram OAuth login working
- [ ] Phone verification (SMS code) working
- [ ] JWT + refresh token auth
- [ ] Role-based access (owner/admin/master/client)
- [ ] Owner dashboard (revenue, bookings, utilization)
- [ ] Master schedule view

## Agent Assignments

| Agent | Status | Model | Tasks |
|-------|--------|-------|-------|
| Orchestrator | ACTIVE | sonnet | Coordinate, quality gates |
| PM-Agent | ACTIVE | haiku | Accept stories, track velocity |
| Architect | ACTIVE | sonnet | Auth architecture, client data model |
| Backend | ACTIVE | sonnet | Auth endpoints, client CRUD, Telegram OAuth |
| Frontend | ACTIVE | sonnet | Client pages, dashboard, login UI |
| Designer | ACTIVE | haiku | Dashboard layout, client profile specs |
| QA | ACTIVE | sonnet | Auth flow testing, RBAC edge cases |
| DevOps | IDLE | — | Not needed |
| Cyber | ACTIVE | haiku | Auth security review (JWT, token storage) |
| Research | IDLE | — | Not needed |

## Key Decisions (Architect)
- JWT expiry: 15min access + 7d refresh
- Telegram OAuth flow (bot token + widget)
- Phone verification provider: Telegram code (free) vs SMS.ru
- Client deduplication strategy (phone as unique key)

## API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/auth/telegram | Telegram OAuth callback |
| POST | /api/auth/phone/send | Send verification code |
| POST | /api/auth/phone/verify | Verify code, return JWT |
| POST | /api/auth/refresh | Refresh access token |
| GET | /api/clients?search=&page= | Client list with search |
| GET | /api/clients/{id} | Client profile + visits |
| POST | /api/clients | Create client |
| PATCH | /api/clients/{id} | Update client |
| GET | /api/dashboard/stats | Owner KPIs |
| GET | /api/dashboard/master/{id} | Master schedule |

## Handoff Chain
```
Architect (day 1) → Backend (day 1-3) → Frontend (day 1-3) → QA (day 4-5)
                   → Cyber (day 2) reviews auth implementation
```
