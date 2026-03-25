export type LedgerType = 'earn' | 'earn_reversal' | 'redeem' | 'refund_restore' | 'manual_adjust' | 'expiry';
export type SourceEnum = 'booking' | 'birthday' | 'referral' | 'manual' | 'expiry';

export interface LoyaltyConfig {
  id: string;
  salon_id: string;
  earn_rate: number;
  redemption_rate: number;
  referral_bonus: number;
  birthday_bonus: number;
  expiry_enabled: boolean;
  updated_at: string;
}

export interface LoyaltyTier {
  id: string;
  salon_id: string;
  name: string;
  min_points: number;
}

export interface LoyaltyBalance {
  client_id: string;
  salon_id: string;
  current_points: number;
  tier: string;
  version: number;
  updated_at: string;
}

export interface LedgerEntry {
  id: string;
  salon_id: string;
  client_id: string;
  type: LedgerType;
  delta_points: number;
  balance_after: number;
  source: SourceEnum | null;
  ref_id: string | null;
  idempotency_key: string | null;
  admin_id: string | null;
  reason: string | null;
  created_at: string;
}

export interface BirthdayLog {
  id: string;
  client_id: string;
  year: number;
  ledger_id: string;
  created_at: string;
}

export interface ConfigWithTiers extends LoyaltyConfig {
  tiers: LoyaltyTier[];
}
