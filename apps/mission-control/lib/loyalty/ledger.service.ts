import { PoolClient } from 'pg';
import { query } from './db';
import { LedgerEntry, LedgerType, SourceEnum } from '../../types/loyalty';

export interface AppendLedgerInput {
  salon_id: string;
  client_id: string;
  type: LedgerType;
  delta_points: number;
  balance_after: number;
  source?: SourceEnum | null;
  ref_id?: string | null;
  idempotency_key?: string | null;
  admin_id?: string | null;
  reason?: string | null;
}

export async function appendLedgerEntry(
  txClient: PoolClient,
  input: AppendLedgerInput
): Promise<LedgerEntry> {
  const { rows } = await txClient.query(
    `INSERT INTO loyalty_ledger
       (id, salon_id, client_id, type, delta_points, balance_after, source, ref_id, idempotency_key, admin_id, reason, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
     RETURNING *`,
    [
      input.salon_id,
      input.client_id,
      input.type,
      input.delta_points,
      input.balance_after,
      input.source ?? null,
      input.ref_id ?? null,
      input.idempotency_key ?? null,
      input.admin_id ?? null,
      input.reason ?? null,
    ]
  );
  return rows[0];
}

export async function getLedgerEntries(
  client_id: string,
  page: number,
  limit: number,
  type?: string
): Promise<{ entries: LedgerEntry[]; total: number }> {
  const offset = (page - 1) * limit;
  const typeFilter = type ? `AND type = '${type}'` : '';

  const { rows: entries } = await query<LedgerEntry>(
    `SELECT id, type, delta_points, balance_after, source, ref_id, reason, created_at
     FROM loyalty_ledger
     WHERE client_id = $1 ${typeFilter}
     ORDER BY created_at DESC
     LIMIT $2 OFFSET $3`,
    [client_id, limit, offset]
  );

  const { rows: countRows } = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM loyalty_ledger WHERE client_id = $1 ${typeFilter}`,
    [client_id]
  );

  return { entries, total: parseInt(countRows[0]?.count ?? '0', 10) };
}

export async function findLedgerByIdempotencyKey(
  idempotency_key: string
): Promise<LedgerEntry | null> {
  const { rows } = await query<LedgerEntry>(
    'SELECT * FROM loyalty_ledger WHERE idempotency_key = $1',
    [idempotency_key]
  );
  return rows[0] ?? null;
}

export async function findEarnEntryByBooking(
  client_id: string,
  booking_id: string
): Promise<LedgerEntry | null> {
  const { rows } = await query<LedgerEntry>(
    `SELECT * FROM loyalty_ledger
     WHERE client_id = $1 AND ref_id = $2 AND type = 'earn'
     LIMIT 1`,
    [client_id, booking_id]
  );
  return rows[0] ?? null;
}

export async function findRedeemEntryByBooking(
  client_id: string,
  booking_id: string
): Promise<LedgerEntry | null> {
  const { rows } = await query<LedgerEntry>(
    `SELECT * FROM loyalty_ledger
     WHERE client_id = $1 AND ref_id = $2 AND type = 'redeem'
     LIMIT 1`,
    [client_id, booking_id]
  );
  return rows[0] ?? null;
}
