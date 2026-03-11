// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Auth Middleware
// Simple API key authentication for admin routes (Phase 1)
// ============================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { ApiError } from '../../shared/types/booking';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthResult {
  authenticated: true;
}

// ---------------------------------------------------------------------------
// Admin auth check
// ---------------------------------------------------------------------------

/**
 * Verify that the request carries a valid admin API key.
 *
 * Expected header:  Authorization: Bearer <ADMIN_API_KEY>
 *
 * Returns `{ authenticated: true }` on success.
 * Returns a 401 NextResponse if the key is missing or invalid.
 */
export function requireAdminAuth(
  request: NextRequest,
): AuthResult | NextResponse<ApiError> {
  const adminApiKey = process.env.ADMIN_API_KEY;

  if (!adminApiKey) {
    // Misconfiguration — fail closed
    return NextResponse.json(
      {
        error: 'AUTH_CONFIG_ERROR',
        message: 'Server authentication is not configured',
      },
      { status: 500 },
    );
  }

  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        message: 'Missing Authorization header',
      },
      { status: 401 },
    );
  }

  // Expect "Bearer <token>"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        message: 'Authorization header must use Bearer scheme',
      },
      { status: 401 },
    );
  }

  const token = parts[1];

  // Constant-time comparison is ideal but for a simple API key check
  // against a server-side env var, a direct comparison is acceptable in Phase 1.
  if (token !== adminApiKey) {
    return NextResponse.json(
      {
        error: 'UNAUTHORIZED',
        message: 'Invalid API key',
      },
      { status: 401 },
    );
  }

  return { authenticated: true };
}

/**
 * Type guard: check if the auth result is an authenticated success.
 */
export function isAuthenticated(
  result: AuthResult | NextResponse<ApiError>,
): result is AuthResult {
  return 'authenticated' in result && result.authenticated === true;
}
