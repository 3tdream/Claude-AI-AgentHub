-- Migration 003: loyalty_balance table (NOT a materialized view — SELECT FOR UPDATE required)

CREATE TABLE IF NOT EXISTS loyalty_balance (
  client_id      UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  salon_id       UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  current_points INTEGER NOT NULL DEFAULT 0 CHECK (current_points >= 0),
  tier           VARCHAR(50) NOT NULL DEFAULT '',
  version        INTEGER NOT NULL DEFAULT 0,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tier re-evaluation job: scan all clients per salon
CREATE INDEX IF NOT EXISTS idx_loyalty_balance_salon_id ON loyalty_balance(salon_id);

-- Dashboard top_clients query: ORDER BY current_points DESC within salon
CREATE INDEX IF NOT EXISTS idx_loyalty_balance_salon_points ON loyalty_balance(salon_id, current_points DESC);
