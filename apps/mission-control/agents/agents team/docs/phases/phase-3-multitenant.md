# Phase 3: Multi-tenancy + Notifications (Week 4)

## Goal
Multiple salons operate independently. Telegram notifications for booking events.

## Done Criteria
- [ ] Shop onboarding wizard (5 steps)
- [ ] Custom slug routing (/shop/{slug})
- [ ] Shop settings (hours, services, masters, logo)
- [ ] Tenant data isolation (RLS per shop_id)
- [ ] Telegram bot per salon (white-label)
- [ ] Booking confirmation notification
- [ ] Reminder cron (24h + 2h before visit)
- [ ] Cancellation notification

## Agent Assignments

| Agent | Status | Model | Tasks |
|-------|--------|-------|-------|
| Orchestrator | ACTIVE | sonnet | Coordinate, quality gates |
| PM-Agent | ACTIVE | haiku | Track scope, accept stories |
| Architect | ACTIVE | haiku | Review multi-tenant isolation only |
| Backend | ACTIVE | sonnet | Onboarding API, tenant isolation, Telegram bot |
| Frontend | ACTIVE | sonnet | Onboarding wizard, shop settings UI |
| Designer | IDLE | — | Reuse existing design tokens |
| QA | ACTIVE | sonnet | Multi-tenant isolation testing (critical) |
| DevOps | IDLE | — | Not needed |
| Cyber | ACTIVE | haiku | Verify tenant isolation, no data leaks |
| Research | IDLE | — | Not needed |

## Telegram Bot Architecture
- One bot per salon (BotFather → token stored in shop config)
- Notifications: booking created, reminder, cancelled
- Client can reply to confirm/cancel (stretch goal)
- Rate limit: 30 msgs/sec (Telegram API limit)

## Multi-tenant Strategy
- All tables have `shop_id` column
- Supabase RLS policies filter by `shop_id`
- Middleware extracts `shop_id` from JWT claims
- Admin super-panel bypasses RLS for platform ops
