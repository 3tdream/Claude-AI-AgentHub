---
name: migration-plan
description: Plan data or system migration — steps, rollback, validation, zero-downtime strategy
argument-hint: <what to migrate> — e.g. "PostgreSQL to PlanetScale", "v1 API to v2"
---

Migration plan for: $ARGUMENTS

## PRE-MIGRATION
- [ ] Backup current state
- [ ] Document current schema/API/config
- [ ] Identify affected services/consumers
- [ ] Set up staging environment

## MIGRATION STEPS
| Step | Action | Duration | Reversible? |
|------|--------|----------|-------------|
| 1 | | | Yes/No |

## DATA MIGRATION
- Volume estimate: N rows / N GB
- Strategy: big-bang / incremental / dual-write
- Transformation rules: field mapping, type changes

## ROLLBACK PLAN
- Trigger: what indicates failure
- Steps to revert
- Data reconciliation after rollback

## VALIDATION
- [ ] Data integrity checks (counts, checksums)
- [ ] Functional smoke tests
- [ ] Performance comparison (before/after)
- [ ] Monitor for 24h post-migration

## ZERO-DOWNTIME STRATEGY
If applicable: blue-green, canary, feature flags
