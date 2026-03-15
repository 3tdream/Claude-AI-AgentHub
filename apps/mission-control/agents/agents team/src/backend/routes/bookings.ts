// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Booking Routes
//   POST  /api/v1/bookings              — create booking
//   GET   /api/v1/admin/bookings        — admin list (paginated)
//   PATCH /api/v1/admin/bookings/:id    — update with optimistic locking
// ============================================================================

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSupabaseClient, getSupabaseAdmin } from '../db/supabase';
import {
  createBookingSchema,
  adminBookingsQuerySchema,
  updateBookingParamsSchema,
  updateBookingBodySchema,
} from '../validation/booking.schemas';
import {
  createBooking,
  enrichBookingResponse,
  updateBooking,
  getAdminBookings,
  BookingError,
} from '../services/booking.service';
import { requireAdminAuth, isAuthenticated } from '../middleware/auth';
import { checkRateLimit, getClientIp } from '../middleware/rate-limit';
import { errorResponse, zodErrorResponse } from '../utils/response';
import type {
  ApiError,
  ApiSuccess,
  Booking,
  BookingConfirmationResponse,
  PaginatedResponse,
} from '../../shared/types/booking';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function handleServiceError(err: unknown): NextResponse<ApiError> {
  if (err instanceof BookingError) {
    return errorResponse(err.statusCode, err.code, err.message);
  }
  if (err instanceof ZodError) {
    return zodErrorResponse(err);
  }
  const message = err instanceof Error ? err.message : 'An unexpected error occurred';
  return errorResponse(500, 'INTERNAL_ERROR', message);
}

// ---------------------------------------------------------------------------
// Rate limit constants for booking creation
// ---------------------------------------------------------------------------

/** Maximum bookings a single IP can create per window */
const BOOKING_RATE_LIMIT_MAX = 10;
/** Rate limit window: 1 hour in milliseconds */
const BOOKING_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// POST /api/v1/bookings
// ---------------------------------------------------------------------------

export async function createBookingHandler(
  request: NextRequest,
): Promise<NextResponse<ApiSuccess<BookingConfirmationResponse> | ApiError>> {
  try {
    // ---- Rate limiting (SEC-1-003) ----
    const clientIp = getClientIp(request.headers);
    const rateLimitResult = checkRateLimit(
      `booking:create:${clientIp}`,
      BOOKING_RATE_LIMIT_MAX,
      BOOKING_RATE_LIMIT_WINDOW_MS,
    );

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many booking requests. Please try again later.',
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter ?? 3600),
          },
        },
      );
    }

    const body: unknown = await request.json();
    const validated = createBookingSchema.parse(body);

    const supabase = getSupabaseClient();
    const result = await createBooking(supabase, validated);

    // Return enriched confirmation response (BUG-1-004)
    const confirmation = await enrichBookingResponse(supabase, result.booking);

    return NextResponse.json({ data: confirmation }, { status: 201 });
  } catch (err) {
    return handleServiceError(err);
  }
}

// ---------------------------------------------------------------------------
// GET /api/v1/admin/bookings
// ---------------------------------------------------------------------------

export async function getAdminBookingsHandler(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse<Booking> | ApiError>> {
  // ---- Auth check (SEC-1-001) ----
  const authResult = requireAdminAuth(request);
  if (!isAuthenticated(authResult)) {
    return authResult;
  }

  try {
    const url = new URL(request.url);

    const validated = adminBookingsQuerySchema.parse({
      shopId: url.searchParams.get('shopId') ?? '',
      date: url.searchParams.get('date') ?? undefined,
      dateFrom: url.searchParams.get('dateFrom') ?? undefined,
      dateTo: url.searchParams.get('dateTo') ?? undefined,
      status: url.searchParams.get('status') ?? undefined,
      masterId: url.searchParams.get('masterId') ?? undefined,
      page: url.searchParams.get('page') ?? '1',
      perPage: url.searchParams.get('perPage') ?? '20',
    });

    // Admin routes use the service_role client (bypasses RLS)
    const supabase = getSupabaseAdmin();

    const result = await getAdminBookings(supabase, {
      shopId: validated.shopId,
      date: validated.date,
      dateFrom: validated.dateFrom,
      dateTo: validated.dateTo,
      status: validated.status,
      masterId: validated.masterId,
      page: validated.page,
      perPage: validated.perPage,
    });

    return NextResponse.json(result);
  } catch (err) {
    return handleServiceError(err);
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/v1/admin/bookings/:id
// ---------------------------------------------------------------------------

export async function updateBookingHandler(
  request: NextRequest,
  params: { id: string },
): Promise<NextResponse<ApiSuccess<Booking> | ApiError>> {
  // ---- Auth check (SEC-1-001) ----
  const authResult = requireAdminAuth(request);
  if (!isAuthenticated(authResult)) {
    return authResult;
  }

  try {
    const validatedParams = updateBookingParamsSchema.parse({ id: params.id });
    const body: unknown = await request.json();
    const validatedBody = updateBookingBodySchema.parse(body);

    // Admin routes use the service_role client (bypasses RLS)
    const supabase = getSupabaseAdmin();

    const result = await updateBooking(supabase, validatedParams.id, {
      status: validatedBody.status,
      client_name: validatedBody.client_name,
      client_phone: validatedBody.client_phone,
      client_email: validatedBody.client_email,
      notes: validatedBody.notes,
      version: validatedBody.version,
    });

    return NextResponse.json({ data: result.booking });
  } catch (err) {
    return handleServiceError(err);
  }
}
