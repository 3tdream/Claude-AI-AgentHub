---
name: db-schema
description: Design database schema for an entity — fields, types, relations, indexes, constraints
argument-hint: <entity or feature name>
---

Database schema for: $ARGUMENTS

**Entity: `EntityName`**
| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, NOT NULL | auto-generated |
| | | | |

**Relations:**
- EntityA.field → EntityB.id (1:N, cascade delete)

**Indexes:**
- `idx_entity_field` on (field) — for query pattern: ...

**Estimated growth:** ~N rows/month
**Retention:** indefinite / 90 days / archive after 1 year

Output in plain English first, then SQL migration if requested.
Follow existing patterns — check `migrations/` folder.
