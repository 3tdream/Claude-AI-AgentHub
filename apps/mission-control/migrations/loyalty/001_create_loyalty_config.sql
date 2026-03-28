-- Migration 001: loyalty_config table
-- 152-FZ: runs on Timeweb PostgreSQL only

CREATE TABLE IF NOT EXISTS loyalty_config (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id      UUID NOT NULL UNIQUE REFERENCES salons(id) ON DELETE CASCADE,
  earn_rate     INTEGER NOT NULL CHECK (earn_rate >= 1),
  redemption_rate INTEGER NOT NULL CHECK (redemption_rate >= 1),
  referral_bonus  INTEGER NOT NULL DEFAULT 0 CHECK (referral_bonus >= 0),
  birthday_bonus  INTEGER NOT NULL DEFAULT 0 CHECK (birthday_bonus >= 0),
  expiry_enabled  BOOLEAN NOT NULL DEFAULT false,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookup on every earn/redeem path
CREATE UNIQUE INDEX IF NOT EXISTS idx_loyalty_config_salon_id ON loyalty_config(salon_id);
