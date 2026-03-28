-- Migration 002: loyalty_tiers table

CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  salon_id    UUID NOT NULL REFERENCES salons(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  min_points  INTEGER NOT NULL CHECK (min_points >= 0)
);

-- Ordered scan for tier evaluation (find highest tier where min_points <= current_points)
CREATE INDEX IF NOT EXISTS idx_loyalty_tiers_salon_min ON loyalty_tiers(salon_id, min_points ASC);
