import { Pool, PoolClient } from 'pg';

// 152-FZ: Isolated Timeweb PostgreSQL connection for loyalty domain (PII residency)
const loyaltyPool = new Pool({
  connectionString: process.env.TIMEWEB_LOYALTY_DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

loyaltyPool.on('error', (err) => {
  console.error('[loyalty-db] Unexpected pool error:', err);
});

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await loyaltyPool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<{ rows: T[]; rowCount: number }> {
  const result = await loyaltyPool.query(sql, params);
  return { rows: result.rows as T[], rowCount: result.rowCount ?? 0 };
}

export default loyaltyPool;
