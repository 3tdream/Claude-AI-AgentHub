// Server-only: Timeweb PostgreSQL queries for admin_users
// PII fields (name, email, last_login_at) MUST NOT appear in logs
// NOTE: Requires `pg` package and TIMEWEB_PG_URL env var.
//       Returns mock data when pg is not installed.

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  last_login_at: string | null;
}

interface GetAdminUsersResult {
  data: AdminUser[];
  total: number;
}

async function getPool() {
  try {
    // Dynamic import to avoid build failure when pg is not installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pg = await (Function('return import("pg")')() as Promise<any>);
    const Pool = pg.Pool;
    if (!process.env.TIMEWEB_PG_URL) {
      throw new Error("TIMEWEB_PG_URL not configured");
    }
    return new Pool({ connectionString: process.env.TIMEWEB_PG_URL });
  } catch {
    return null;
  }
}

/**
 * Fetch paginated admin users from Timeweb PG.
 * Returns empty array when pg is not available.
 */
export async function getAdminUsers({
  limit,
  offset,
}: {
  limit: number;
  offset: number;
}): Promise<GetAdminUsersResult> {
  const pool = await getPool();
  if (!pool) {
    return { data: [], total: 0 };
  }

  const client = await pool.connect();
  try {
    const [rowsResult, countResult] = await Promise.all([
      client.query(
        `SELECT id, name, email, role,
                to_char(last_login_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS last_login_at
         FROM admin_users
         ORDER BY name ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      client.query("SELECT COUNT(*)::int AS count FROM admin_users"),
    ]);

    return {
      data: rowsResult.rows as AdminUser[],
      total: parseInt(countResult.rows[0]?.count ?? "0", 10),
    };
  } finally {
    client.release();
    await pool.end();
  }
}

/**
 * Update last_login_at for an admin user after successful authentication.
 * Returns silently when pg is not available.
 */
export async function updateLastLoginAt(adminId: string): Promise<void> {
  const pool = await getPool();
  if (!pool) return;

  const client = await pool.connect();
  try {
    await client.query(
      "UPDATE admin_users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1",
      [adminId]
    );
  } finally {
    client.release();
    await pool.end();
  }
}
