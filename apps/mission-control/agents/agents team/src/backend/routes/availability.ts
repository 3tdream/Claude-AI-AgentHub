// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Availability Route
//   GET /api/v1/availability?masterId=&serviceId=&date=
// ============================================================================

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSupabaseClient } from '../db/supabase';
import { getAvailabilitySchema } from '../validation/booking.schemas';
import { getAvailability } from '../services/availability.service';
import { errorResponse, zodErrorResponse } from '../utils/response';
import type { ApiError, ApiSuccess, TimeSlot } from '../../shared/types/booking';

// ---------------------------------------------------------------------------
// GET /api/v1/availability
// ---------------------------------------------------------------------------

export async function getAvailabilityHandler(
  request: NextRequest,
): Promise<NextResponse<ApiSuccess<TimeSlot[]> | ApiError>> {
  try {
    const url = new URL(request.url);

    const validated = getAvailabilitySchema.parse({
      masterId: url.searchParams.get('masterId') ?? '',
      serviceId: url.searchParams.get('serviceId') ?? '',
      date: url.searchParams.get('date') ?? '',
    });

    const supabase = getSupabaseClient();

    const slots = await getAvailability(supabase, {
      masterId: validated.masterId,
      serviceId: validated.serviceId,
      date: validated.date,
    });

    return NextResponse.json({ data: slots });
  } catch (err) {
    if (err instanceof ZodError) {
      return zodErrorResponse(err);
    }

    // Handle known business errors from the service
    if (err instanceof Error) {
      const message = err.message;

      if (message.includes('not found')) {
        return errorResponse(404, 'NOT_FOUND', message);
      }
      if (message.includes('not active')) {
        return errorResponse(400, 'INACTIVE_ENTITY', message);
      }

      return errorResponse(500, 'INTERNAL_ERROR', message);
    }

    return errorResponse(500, 'INTERNAL_ERROR', 'An unexpected error occurred');
  }
}
