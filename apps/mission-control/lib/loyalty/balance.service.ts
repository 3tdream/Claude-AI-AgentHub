import { PoolClient } from 'pg';
import { query } from './db';
import { LoyaltyBalance } from '../../types/loyalty';

export async function getBalance(client_id: string): Promise<LoyaltyBalance | null> {
  const { rows } = await query<LoyaltyBalance>(
    'SELECT * FROM loyalty_balance WHERE client_id = $1',
    [client_id]
  );
  return rows[0] ?? null;
}

/** SELECT FOR UPDATE — must be called inside a transaction */
export async function lockBalanceRow(
  txClient: PoolClient,
  client_id: string
): Promise<LoyaltyBalance | null> {
  const { rows } = await txClient.query(
    'SELECT * FROM loyalty_balance WHERE client_id = $1 FOR UPDATE',
    [client_id]
  );
  return rows[0] ?? null;
}

export async function upsertBalance(
  txClient: PoolClient,
  client_id: string,
  salon_id: string,
  new_points: number,
  tier: string
): Promise<LoyaltyBalance> {
  const { rows } = await txClient.query(
    `INSERT INTO loyalty_balance (client_id, salon_id, current_points, tier, version, updated_at)
     VALUES ($1, $2, $3, $4, 1, NOW())
     ON CONFLICT (client_id) DO UPDATE SET
       current_points = EXCLUDED.current_points,
       tier = EXCLUDED.tier,
       version = loyalty_balance.version + 1,
       updated_at = NOW()
     RETURNING *`,
    [client_id, salon_id, new_points, tier]
  );
  return rows[0];
}

export async function resolveTier(
  txClient: PoolClient,
  salon_id: string,
  points: number
): Promise<string> {
  const { rows } = await txClient.query(
    `SELECT name FROM loyalty_tiers
     WHERE salon_id = $1 AND min_points <= $2
     ORDER BY min_points DESC LIMIT 1`,
    [salon_id, points]
  );
  return rows[0]?.name ?? 'Bronze';
}
