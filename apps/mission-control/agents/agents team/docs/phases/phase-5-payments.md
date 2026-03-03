# Phase 5: Payments + Subscription (Week 6)

## Goal
Salons pay monthly subscription. Clients can prepay bookings. Invoices and refunds.

## Done Criteria
- [ ] YooKassa SDK integrated
- [ ] Client prepayment on booking (optional per salon)
- [ ] Salon subscription billing (4990/9990 monthly)
- [ ] Auto-charge on subscription renewal
- [ ] Invoice PDF generation
- [ ] Refund processing
- [ ] Payment history (client + salon)
- [ ] Trial period (14 days free)

## Agent Assignments

| Agent | Status | Model | Tasks |
|-------|--------|-------|-------|
| Orchestrator | ACTIVE | sonnet | Coordinate payment integration |
| PM-Agent | ACTIVE | haiku | Track payment stories |
| Architect | IDLE | — | Not needed (YooKassa SDK handles architecture) |
| Backend | ACTIVE | sonnet | YooKassa integration, billing logic, invoices |
| Frontend | ACTIVE | sonnet | Checkout UI, billing dashboard, payment history |
| Designer | IDLE | — | Reuse existing components |
| QA | ACTIVE | sonnet | Payment flow testing (critical — money involved) |
| DevOps | ACTIVE | haiku | Webhook endpoint setup, SSL verification |
| Cyber | ACTIVE | haiku | PCI compliance review, payment data handling |
| Research | IDLE | — | Not needed |

## YooKassa Integration

### Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | /api/payments/create | Create payment (booking prepay) |
| POST | /api/payments/webhook | YooKassa callback |
| GET | /api/payments/{id} | Payment status |
| POST | /api/subscriptions/create | Start salon subscription |
| POST | /api/subscriptions/cancel | Cancel subscription |
| GET | /api/billing/invoices | Salon invoice history |
| POST | /api/payments/refund | Process refund |

### Payment Flow
1. Client clicks "Pay" → POST /api/payments/create
2. Redirect to YooKassa checkout page
3. Client pays → YooKassa sends webhook
4. Backend confirms booking + updates payment status
5. Client redirected to success page

### Subscription Flow
1. Salon owner selects plan (A: 4990, B: 9990)
2. 14-day free trial starts
3. Day 14: auto-charge via saved card
4. Monthly recurring charge
5. Failed payment → 3-day grace → suspend account

## Security Notes
- Never store card numbers (YooKassa handles PCI)
- Webhook signature verification required
- Idempotency keys on payment creation
- Refund requires admin confirmation
