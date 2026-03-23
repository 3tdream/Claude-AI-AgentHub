---
name: db-migration
description: Create a SQL migration file — CREATE TABLE, ALTER TABLE, indexes, constraints
argument-hint: <description> — e.g. "add loyalty_points table"
---

Create SQL migration for: $ARGUMENTS

1. Check existing migrations in `migrations/` for numbering convention
2. Generate migration file:

```sql
-- Migration NNN: description
-- Created: YYYY-MM-DD

-- UP
CREATE TABLE ... / ALTER TABLE ...

-- DOWN (rollback)
DROP TABLE ... / ALTER TABLE ...
```

Rules:
- Sequential numbering matching existing files
- Include both UP and DOWN migrations
- Add indexes for foreign keys and common query patterns
- Use proper constraints (NOT NULL, UNIQUE, CHECK, DEFAULT)
- UUID primary keys (uuid_generate_v4())
- Timestamps: created_at, updated_at with defaults
- Soft delete: deleted_at where applicable
