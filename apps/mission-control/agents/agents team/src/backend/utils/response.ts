// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Shared Response Helpers
// Centralised error response builders used across all route files
// ============================================================================

import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import type { ApiError } from '../../shared/types/booking';

/**
 * Build a structured JSON error response.
 */
export function errorResponse(
  status: number,
  error: string,
  message: string,
  details?: unknown,
): NextResponse<ApiError> {
  return NextResponse.json({ error, message, details }, { status });
}

/**
 * Build a 400 response from a Zod validation error.
 */
export function zodErrorResponse(err: ZodError): NextResponse<ApiError> {
  return errorResponse(
    400,
    'VALIDATION_ERROR',
    'Invalid request parameters',
    err.issues,
  );
}
