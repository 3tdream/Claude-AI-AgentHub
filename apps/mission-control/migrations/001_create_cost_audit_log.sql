-- Migration: 001_create_cost_audit_log
-- Append-only financial audit trail for upstream Anthropic API fetches

CREATE TABLE IF NOT EXISTS cost_audit_log (
  id                    SERIAL PRIMARY KEY,
  cache_key             VARCHAR(80)     NOT NULL,
  period_start          DATE            NOT NULL,
  period_end            DATE            NOT NULL,
  total_usd             NUMERIC(10, 2),
  fetched_at            TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  upstream_status_code  INTEGER         NOT NULL,
  upstream_response_ms  INTEGER         NOT NULL,
  was_cached            BOOLEAN         NOT NULL DEFAULT FALSE,
  error_message         VARCHAR(500)
);

-- Constraints
ALTER TABLE cost_audit_log
  ADD CONSTRAINT chk_period_order CHECK (period_start <= period_end),
  ADD CONSTRAINT chk_was_cached_false CHECK (was_cached = FALSE);

-- Indexes
CREATE INDEX idx_cost_audit_fetched_at ON cost_audit_log (fetched_at DESC);
CREATE INDEX idx_cost_audit_cache_key  ON cost_audit_log (cache_key);
CREATE INDEX idx_cost_audit_errors     ON cost_audit_log (upstream_status_code)
  WHERE upstream_status_code <> 200;
