// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Supabase Client
// Singleton initialization for @supabase/supabase-js
// ============================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        'Ensure it is set in .env.local or your deployment environment.',
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// Client instances
// ---------------------------------------------------------------------------

let clientInstance: SupabaseClient | null = null;
let adminInstance: SupabaseClient | null = null;

/**
 * Public Supabase client — uses the anon key.
 * Safe for use in API route handlers that serve public data.
 */
export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
    const anonKey = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

    clientInstance = createClient(url, anonKey, {
      auth: { persistSession: false },
      db: { schema: 'public' },
    });
  }
  return clientInstance;
}

/**
 * Admin Supabase client — uses the service_role key.
 * Use ONLY in server-side code (API routes, services).
 * Bypasses RLS policies.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!adminInstance) {
    const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
    const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

    adminInstance = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
      db: { schema: 'public' },
    });
  }
  return adminInstance;
}

/**
 * Reset client instances — used in testing.
 */
export function resetSupabaseClients(): void {
  clientInstance = null;
  adminInstance = null;
}
