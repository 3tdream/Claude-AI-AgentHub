// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Booking Service
// Create booking with conflict check + update with optimistic locking
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Booking,
  BookingConfirmationResponse,
  CreateBookingInput,
  MasterService,
  PaginatedResponse,
  UpdateBookingInput,
} from '../../shared/types/booking';
import { localToUtcIso, getNextDay } from './availability.service';

// ---------------------------------------------------------------------------
// Create Booking
// ---------------------------------------------------------------------------

export interface CreateBookingResult {
  booking: Booking;
}

/**
 * Create a new booking with conflict detection.
 *
 * Conflict check flow:
 * 1. Validate that master provides this service
 * 2. Calculate end_at from start_at + duration
 * 3. Check for overlapping bookings (pending/confirmed) with buffer
 * 4. Insert if no conflict, otherwise throw 409
 */
export async function createBooking(
  supabase: SupabaseClient,
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const { shop_id, master_id, service_id, client_name, client_phone, client_email, start_at, notes } = input;

  // ---- 1. Validate master-service relationship ----
  const { data: masterService } = await supabase
    .from('master_services')
    .select('custom_duration, custom_price')
    .eq('master_id', master_id)
    .eq('service_id', service_id)
    .single();

  const typedMasterService = masterService as MasterService | null;

  // Get service details
  const { data: service, error: serviceErr } = await supabase
    .from('services')
    .select('duration_min, price, is_active')
    .eq('id', service_id)
    .single();

  if (serviceErr || !service) {
    throw new BookingError('Service not found', 'NOT_FOUND', 404);
  }
  if (!service.is_active) {
    throw new BookingError('Service is not active', 'INACTIVE_SERVICE', 400);
  }

  // Get shop for buffer_minutes and timezone
  const { data: shop, error: shopErr } = await supabase
    .from('shops')
    .select('buffer_minutes, timezone, is_active')
    .eq('id', shop_id)
    .single();

  if (shopErr || !shop) {
    throw new BookingError('Shop not found', 'NOT_FOUND', 404);
  }
  if (!shop.is_active) {
    throw new BookingError('Shop is not active', 'INACTIVE_SHOP', 400);
  }

  // Verify master belongs to shop and is active
  const { data: master, error: masterErr } = await supabase
    .from('masters')
    .select('id, shop_id, is_active')
    .eq('id', master_id)
    .eq('shop_id', shop_id)
    .single();

  if (masterErr || !master) {
    throw new BookingError('Master not found in this shop', 'NOT_FOUND', 404);
  }
  if (!master.is_active) {
    throw new BookingError('Master is not active', 'INACTIVE_MASTER', 400);
  }

  // ---- 2. Calculate end time ----
  const durationMin = typedMasterService?.custom_duration ?? service.duration_min;
  const price = typedMasterService?.custom_price ?? service.price;

  const startDate = new Date(start_at);
  const endDate = new Date(startDate.getTime() + durationMin * 60 * 1000);
  const end_at = endDate.toISOString();

  // ---- 3. Conflict check (app-level) ----
  //
  // Dual-layer conflict protection (SEC-1-004):
  //   Layer 1 (here): Application-level SELECT to detect conflicts early and
  //   return a user-friendly error message. This covers the common case.
  //   Layer 2 (catch block): PostgreSQL exclusion constraint (error 23P01)
  //   acts as an atomic failsafe for the race condition window between this
  //   SELECT and the INSERT below. Two concurrent requests for the same slot
  //   will both pass the SELECT, but only one INSERT will succeed — the other
  //   will be caught by the DB constraint and returned as a 409 conflict.
  //
  const bufferMs = shop.buffer_minutes * 60 * 1000;
  const bufferedStart = new Date(startDate.getTime() - bufferMs).toISOString();
  const bufferedEnd = new Date(endDate.getTime() + bufferMs).toISOString();

  const { data: conflicts, error: conflictErr } = await supabase
    .from('bookings')
    .select('id')
    .eq('master_id', master_id)
    .in('status', ['pending', 'confirmed'])
    .lt('start_at', bufferedEnd)
    .gt('end_at', bufferedStart);

  if (conflictErr) {
    throw new BookingError(
      'Failed to check for conflicts',
      'INTERNAL_ERROR',
      500,
    );
  }

  if (conflicts && conflicts.length > 0) {
    throw new BookingError(
      'Time slot is already booked or conflicts with an existing booking (including buffer time)',
      'CONFLICT',
      409,
    );
  }

  // ---- 4. Insert booking ----
  const { data: booking, error: insertErr } = await supabase
    .from('bookings')
    .insert({
      shop_id,
      master_id,
      service_id,
      client_name,
      client_phone,
      client_email: client_email ?? null,
      start_at,
      end_at,
      status: 'pending',
      price,
      notes: notes ?? null,
      version: 1,
    })
    .select('*')
    .single();

  if (insertErr) {
    // Layer 2: DB exclusion constraint catches race conditions (SEC-1-004).
    // PostgreSQL error code 23P01 = exclusion_violation.
    // Also check for the "exclusion" keyword in case the code isn't forwarded
    // correctly through the PostgREST proxy.
    if (insertErr.code === '23P01') {
      throw new BookingError(
        'Time slot conflict detected — another booking was just created for this time',
        'CONFLICT',
        409,
      );
    }
    if (insertErr.message?.toLowerCase().includes('exclusion')) {
      throw new BookingError(
        'Time slot conflict detected by database constraint',
        'CONFLICT',
        409,
      );
    }
    throw new BookingError(
      `Failed to create booking: ${insertErr.message}`,
      'INTERNAL_ERROR',
      500,
    );
  }

  return { booking: booking as Booking };
}

// ---------------------------------------------------------------------------
// Enrich Booking Response (BUG-1-004)
// ---------------------------------------------------------------------------

/**
 * Enrich a raw booking row with human-readable names and a booking code.
 *
 * Joins:
 *  - service name from services table
 *  - master name from masters table
 *  - shop name + currency from shops table
 *
 * Generates a short booking code from the last 4 characters of the UUID.
 */
export async function enrichBookingResponse(
  supabase: SupabaseClient,
  booking: Booking,
): Promise<BookingConfirmationResponse> {
  // Fetch related entities in parallel
  const [serviceResult, masterResult, shopResult] = await Promise.all([
    supabase
      .from('services')
      .select('name, duration_min')
      .eq('id', booking.service_id)
      .single(),
    supabase
      .from('masters')
      .select('name')
      .eq('id', booking.master_id)
      .single(),
    supabase
      .from('shops')
      .select('name, currency')
      .eq('id', booking.shop_id)
      .single(),
  ]);

  const serviceName = serviceResult.data?.name ?? 'Unknown Service';
  const durationMin = serviceResult.data?.duration_min ?? 0;
  const masterName = masterResult.data?.name ?? 'Unknown Master';
  const shopName = shopResult.data?.name ?? 'Unknown Shop';
  const currency = shopResult.data?.currency ?? 'ILS';

  // Generate a short booking code: "BK-" + last 4 chars of UUID (uppercased)
  const bookingCode = `BK-${booking.id.slice(-4).toUpperCase()}`;

  return {
    id: booking.id,
    booking_code: bookingCode,
    shop_name: shopName,
    service_name: serviceName,
    master_name: masterName,
    start_at: booking.start_at,
    end_at: booking.end_at,
    duration_min: durationMin,
    price: booking.price,
    currency,
    status: booking.status,
    client_name: booking.client_name,
    client_phone: booking.client_phone,
  };
}

// ---------------------------------------------------------------------------
// Update Booking (with optimistic locking)
// ---------------------------------------------------------------------------

export interface UpdateBookingResult {
  booking: Booking;
}

/**
 * Update an existing booking using optimistic locking (version field).
 *
 * Flow:
 * 1. Read current booking
 * 2. Compare version with provided version
 * 3. If versions match, update and increment version
 * 4. If versions differ, return 409 Conflict
 */
export async function updateBooking(
  supabase: SupabaseClient,
  bookingId: string,
  input: UpdateBookingInput,
): Promise<UpdateBookingResult> {
  const { version, ...fieldsToUpdate } = input;

  // Build the update payload — only include defined fields
  const updatePayload: Record<string, unknown> = {};
  if (fieldsToUpdate.status !== undefined) updatePayload.status = fieldsToUpdate.status;
  if (fieldsToUpdate.client_name !== undefined) updatePayload.client_name = fieldsToUpdate.client_name;
  if (fieldsToUpdate.client_phone !== undefined) updatePayload.client_phone = fieldsToUpdate.client_phone;
  if (fieldsToUpdate.client_email !== undefined) updatePayload.client_email = fieldsToUpdate.client_email;
  if (fieldsToUpdate.notes !== undefined) updatePayload.notes = fieldsToUpdate.notes;

  // Increment version
  updatePayload.version = version + 1;
  updatePayload.updated_at = new Date().toISOString();

  // Atomic update with version check — only updates if version matches
  const { data: updated, error: updateErr } = await supabase
    .from('bookings')
    .update(updatePayload)
    .eq('id', bookingId)
    .eq('version', version)
    .select('*')
    .single();

  if (updateErr) {
    // If no row matched, it's a version conflict or booking not found
    if (updateErr.code === 'PGRST116') {
      // Check if booking exists at all
      const { data: existing } = await supabase
        .from('bookings')
        .select('id, version')
        .eq('id', bookingId)
        .single();

      if (!existing) {
        throw new BookingError('Booking not found', 'NOT_FOUND', 404);
      }

      throw new BookingError(
        `Version conflict: expected version ${version}, current version is ${(existing as { version: number }).version}. Another update was made concurrently.`,
        'VERSION_CONFLICT',
        409,
      );
    }

    throw new BookingError(
      `Failed to update booking: ${updateErr.message}`,
      'INTERNAL_ERROR',
      500,
    );
  }

  if (!updated) {
    // Fallback: no row returned means version mismatch
    const { data: existing } = await supabase
      .from('bookings')
      .select('id, version')
      .eq('id', bookingId)
      .single();

    if (!existing) {
      throw new BookingError('Booking not found', 'NOT_FOUND', 404);
    }

    throw new BookingError(
      `Version conflict: expected version ${version}, current version is ${(existing as { version: number }).version}`,
      'VERSION_CONFLICT',
      409,
    );
  }

  return { booking: updated as Booking };
}

// ---------------------------------------------------------------------------
// Get Admin Bookings (paginated)
// ---------------------------------------------------------------------------

export interface AdminBookingsParams {
  shopId: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  masterId?: string;
  page: number;
  perPage: number;
}

export async function getAdminBookings(
  supabase: SupabaseClient,
  params: AdminBookingsParams,
): Promise<PaginatedResponse<Booking>> {
  const { shopId, date, dateFrom, dateTo, status, masterId, page, perPage } = params;

  // Get shop timezone for date filtering
  const { data: shop, error: shopErr } = await supabase
    .from('shops')
    .select('timezone')
    .eq('id', shopId)
    .single();

  if (shopErr || !shop) {
    throw new BookingError('Shop not found', 'NOT_FOUND', 404);
  }

  let query = supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .eq('shop_id', shopId)
    .order('start_at', { ascending: true });

  // Date filters
  // Use next-day midnight as exclusive upper bound instead of "23:59"
  // to avoid missing bookings in the last minute of the day (BUG-1-005).
  if (date) {
    const dayStart = localToUtcIso(date, '00:00', shop.timezone);
    const dayEnd = localToUtcIso(getNextDay(date), '00:00', shop.timezone);
    query = query.gte('start_at', dayStart).lt('start_at', dayEnd);
  } else {
    if (dateFrom) {
      const fromUtc = localToUtcIso(dateFrom, '00:00', shop.timezone);
      query = query.gte('start_at', fromUtc);
    }
    if (dateTo) {
      const toUtc = localToUtcIso(getNextDay(dateTo), '00:00', shop.timezone);
      query = query.lt('start_at', toUtc);
    }
  }

  if (status) {
    query = query.eq('status', status);
  }
  if (masterId) {
    query = query.eq('master_id', masterId);
  }

  // Pagination
  const offset = (page - 1) * perPage;
  query = query.range(offset, offset + perPage - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new BookingError(
      `Failed to fetch bookings: ${error.message}`,
      'INTERNAL_ERROR',
      500,
    );
  }

  const total = count ?? 0;

  return {
    data: (data ?? []) as Booking[],
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  };
}

// ---------------------------------------------------------------------------
// Custom error class
// ---------------------------------------------------------------------------

export class BookingError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.name = 'BookingError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
