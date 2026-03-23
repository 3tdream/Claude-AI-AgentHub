---
name: monitoring-setup
description: Set up health checks, monitoring endpoints, alerting configuration
argument-hint: <"health-check" or "full setup">
---

Monitoring setup for the project.

## Health Check Endpoint
Create `app/api/health/route.ts`:
```typescript
// Returns: { status, uptime, version, checks: { db, redis, api } }
```

Each check:
- Database: can connect and query
- External APIs: reachable
- Disk/memory: within limits

## Monitoring Points
| What | How | Alert Threshold |
|------|-----|----------------|
| API response time | middleware timer | > 2s |
| Error rate | error counter | > 5% of requests |
| Memory usage | process.memoryUsage() | > 80% |
| Queue depth | SQS/Redis queue length | > 100 |
| Database connections | pool stats | > 80% capacity |

## Alerting
- Error logging format (structured JSON)
- Alert channels (Slack webhook, email)
- Severity levels: critical (page), warning (notify), info (log)

## Dashboard Metrics
Suggested Grafana/DataDog panels:
- Request rate (rpm)
- Error rate (%)
- P50/P95/P99 latency
- Active connections
- Pipeline execution duration
