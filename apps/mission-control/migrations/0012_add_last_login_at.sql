-- Migration: 0012_add_last_login_at
-- Target: Timeweb PostgreSQL ONLY (PII store, ADR-001)
-- NEVER apply to Supabase
-- Row growth: ~0 new rows/month (column on existing table, ~10-50 admin users)

ALTER TABLE admin_users
  ADD COLUMN last_login_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN admin_users.last_login_at IS '152-FZ PII-adjacent: last successful login timestamp. Cascades on DELETE (row-level).';

CREATE INDEX idx_admin_users_last_login_at ON admin_users (last_login_at)
  WHERE last_login_at IS NOT NULL;

-- Verify: SELECT column_name, data_type, is_nullable FROM information_schema.columns
--   WHERE table_name = 'admin_users' AND column_name = 'last_login_at';
