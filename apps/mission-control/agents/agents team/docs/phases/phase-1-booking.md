# Phase 1: Booking MVP (Week 1-2)

## Goal
Working online booking flow: client selects service → master → time → confirms. Admin manages bookings.

## Done Criteria
- [ ] DB schema deployed (services, masters, schedules, bookings)
- [ ] 6 REST endpoints working with tests
- [ ] Booking widget (4-step form) working on mobile
- [ ] Admin panel shows bookings with filters
- [ ] Public shop page (/shop/{slug}) live
- [ ] Basic notification on booking created

## Agent Assignments

| Agent | Status | Model | Tasks |
|-------|--------|-------|-------|
| Orchestrator | ACTIVE | sonnet | Coordinate all agents, quality gates |
| PM-Agent | ACTIVE | haiku | Epic created, monitor scope, accept stories |
| Architect | ACTIVE | opus | DB schema, API contracts, business rules |
| Backend | ACTIVE | sonnet | Migrations, all API endpoints, notification stub |
| Frontend | ACTIVE | sonnet | Booking widget, admin panel, shop page |
| Designer | ACTIVE | sonnet | Widget mockups, design tokens, component specs |
| QA | ACTIVE | haiku | API testing as endpoints land, E2E on day 10 |
| DevOps | IDLE | — | Not needed this phase |
| Cyber | ACTIVE | haiku | Review DB schema RLS policies only |
| Research | IDLE | — | Not needed this phase |

## Parallel Tracks

```
Day 1:   Architect (schema + API spec) | Designer (mockups)
Day 2-3: Backend (services + masters API) | Designer (tokens) | Cyber (RLS review)
Day 4-6: Backend (slots + booking API) | Frontend (widget steps 1-3)
Day 7-8: Backend (notifications) | Frontend (widget step 4 + admin)
Day 9-10: Frontend (shop page) | QA (full E2E testing)
```

## DB Schema (Architect output target)

Tables: `shops`, `services`, `masters`, `master_services`, `schedules`, `bookings`, `clients`

Key decisions needed:
- Slot interval: 15 or 30 min (configurable per shop)
- Booking conflict resolution: optimistic locking
- Buffer between appointments: 15 min default

## API Endpoints (Backend output target)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /api/shops/{id}/services | Service catalog |
| GET | /api/shops/{id}/masters?serviceId= | Available masters |
| GET | /api/availability?masterId=&date= | Free time slots |
| POST | /api/bookings | Create booking |
| PATCH | /api/bookings/{id} | Update status (admin) |
| GET | /api/bookings?shopId=&date= | List bookings (admin) |

## Frontend Pages (Frontend output target)

| Page | Route | Priority |
|------|-------|----------|
| Booking widget | /shop/{slug}/book | Must |
| Admin bookings | /dashboard/bookings | Must |
| Public shop page | /shop/{slug} | Must |

## Handoff Chain
```
Architect (day 1) → Backend (day 2-6) → Frontend (day 3-8) → QA (day 9-10)
                   → Designer (day 1-3) ↗
                   → Cyber (day 2) reviews Backend output
```
