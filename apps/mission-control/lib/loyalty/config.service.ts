import { PoolClient } from 'pg';
import { query, withTransaction } from './db';
import { ConfigWithTiers, LoyaltyTier } from '../../types/loyalty';

export async function getLoyaltyConfig(salon_id: string): Promise<ConfigWithTiers | null> {
  const { rows: configs } = await query<ConfigWithTiers>(
    `SELECT c.*, json_agg(t ORDER BY t.min_points ASC) AS tiers
     FROM loyalty_config c
     LEFT JOIN loyalty_tiers t ON t.salon_id = c.salon_id
     WHERE c.salon_id = $1
     GROUP BY c.id`,
    [salon_id]
  );
  if (!configs.length) return null;
  return configs[0];
}

export interface UpdateConfigInput {
  earn_rate: number;
  redemption_rate: number;
  referral_bonus: number;
  birthday_bonus: number;
  expiry_enabled: boolean;
  tiers: { name: string; min_points: number }[];
}

export function validateConfig(input: UpdateConfigInput): string | null {
  if (input.earn_rate < 1) return 'earn_rate must be >= 1';
  if (input.redemption_rate < 1) return 'redemption_rate must be >= 1';
  if (!input.tiers || input.tiers.length < 2) return 'Minimum 2 tiers required';
  const sorted = [...input.tiers].sort((a, b) => a.min_points - b.min_points);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].min_points <= sorted[i - 1].min_points) {
      return 'Tier thresholds must be ascending';
    }
  }
  return null;
}

export async function upsertLoyaltyConfig(
  salon_id: string,
  input: UpdateConfigInput
): Promise<ConfigWithTiers> {
  return withTransaction(async (client: PoolClient) => {
    // Upsert config
    const { rows } = await client.query(
      `INSERT INTO loyalty_config (id, salon_id, earn_rate, redemption_rate, referral_bonus, birthday_bonus, expiry_enabled, updated_at)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (salon_id) DO UPDATE SET
         earn_rate = EXCLUDED.earn_rate,
         redemption_rate = EXCLUDED.redemption_rate,
         referral_bonus = EXCLUDED.referral_bonus,
         birthday_bonus = EXCLUDED.birthday_bonus,
         expiry_enabled = EXCLUDED.expiry_enabled,
         updated_at = NOW()
       RETURNING *`,
      [salon_id, input.earn_rate, input.redemption_rate, input.referral_bonus, input.birthday_bonus, input.expiry_enabled]
    );
    const config = rows[0];

    // Atomic tier replace: delete-insert
    await client.query('DELETE FROM loyalty_tiers WHERE salon_id = $1', [salon_id]);
    const tiers: LoyaltyTier[] = [];
    for (const tier of input.tiers) {
      const { rows: tierRows } = await client.query(
        `INSERT INTO loyalty_tiers (id, salon_id, name, min_points)
         VALUES (gen_random_uuid(), $1, $2, $3) RETURNING *`,
        [salon_id, tier.name, tier.min_points]
      );
      tiers.push(tierRows[0]);
    }

    return { ...config, tiers };
  });
}
