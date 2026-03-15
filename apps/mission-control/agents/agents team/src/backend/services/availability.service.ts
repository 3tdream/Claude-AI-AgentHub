// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Availability Service
// Slot calculation algorithm:
//   1. Get master schedule for day_of_week
//   2. Check schedule_overrides for specific date
//   3. Generate time slots based on shop.slot_interval
//   4. Query existing bookings for the date range
//   5. Mark slots as unavailable where they overlap
//   6. Apply buffer_minutes between slots
// ============================================================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  Booking,
  MasterService,
  Schedule,
  ScheduleOverride,
  Shop,
  TimeSlot,
} from '../../shared/types/booking';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Parse "HH:MM" into total minutes since midnight.
 */
export function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Format total minutes since midnight into "HH:MM".
 */
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Build an ISO-8601 UTC string from a date string ("YYYY-MM-DD") and
 * a local time ("HH:MM") in the given IANA timezone.
 *
 * We compute the offset manually to avoid heavy dependencies.
 * The approach: build a Date in UTC that represents local midnight,
 * then add the local minutes and subtract the timezone offset.
 */
export function localToUtcIso(
  dateStr: string,
  timeStr: string,
  timezone: string,
): string {
  // Build a "wall clock" date-time string and let Intl figure out the offset
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  // Create a UTC date at the "wall clock" values
  const naiveUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

  // Determine the real UTC offset for this timezone at this date-time
  // by comparing the formatted local time with the UTC time.
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // We need to find what UTC time corresponds to "dateStr timeStr" in the timezone.
  // Strategy: the naive UTC date formatted in the target tz tells us the offset.
  const parts = formatter.formatToParts(naiveUtc);
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  const localFromNaive = new Date(
    Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second')),
  );

  const offsetMs = localFromNaive.getTime() - naiveUtc.getTime();

  // The actual UTC time = naiveUtc - offset
  const actualUtc = new Date(naiveUtc.getTime() - offsetMs);
  return actualUtc.toISOString();
}

/**
 * Given a date string "YYYY-MM-DD", return the next day in the same format.
 * Handles month/year boundaries correctly.
 */
export function getNextDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + 1));
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Check if two time ranges overlap.
 * Ranges are [startA, endA) and [startB, endB) — half-open intervals.
 */
export function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}

// ---------------------------------------------------------------------------
// Slot generation (pure function — testable without DB)
// ---------------------------------------------------------------------------

export interface SlotGenerationInput {
  /** Master's working start time "HH:MM" */
  workStart: string;
  /** Master's working end time "HH:MM" */
  workEnd: string;
  /** Service duration in minutes (with possible custom override) */
  durationMin: number;
  /** Shop's slot grid interval in minutes */
  slotInterval: number;
  /** Buffer minutes between bookings */
  bufferMinutes: number;
  /** Existing bookings for the day (start/end as minutes since midnight in LOCAL time) */
  existingBookings: Array<{ startMin: number; endMin: number }>;
}

/**
 * Generate time slots for a single day.
 * Returns an array of slots with local times as minutes since midnight.
 *
 * Pure function — no side effects.
 */
export function generateSlots(input: SlotGenerationInput): Array<{
  startMin: number;
  endMin: number;
  available: boolean;
}> {
  const {
    workStart,
    workEnd,
    durationMin,
    slotInterval,
    bufferMinutes,
    existingBookings,
  } = input;

  const workStartMin = parseTime(workStart);
  const workEndMin = parseTime(workEnd);

  const slots: Array<{ startMin: number; endMin: number; available: boolean }> = [];

  for (
    let cursor = workStartMin;
    cursor + durationMin <= workEndMin;
    cursor += slotInterval
  ) {
    const slotStart = cursor;
    const slotEnd = cursor + durationMin;

    // Check if this slot overlaps with any existing booking (including buffer)
    const hasConflict = existingBookings.some((booking) => {
      // Expand booking range by buffer on both sides
      const bufferedStart = booking.startMin - bufferMinutes;
      const bufferedEnd = booking.endMin + bufferMinutes;
      return rangesOverlap(slotStart, slotEnd, bufferedStart, bufferedEnd);
    });

    slots.push({
      startMin: slotStart,
      endMin: slotEnd,
      available: !hasConflict,
    });
  }

  return slots;
}

// ---------------------------------------------------------------------------
// Full availability query (uses DB)
// ---------------------------------------------------------------------------

export interface AvailabilityParams {
  masterId: string;
  serviceId: string;
  date: string; // "YYYY-MM-DD"
}

export async function getAvailability(
  supabase: SupabaseClient,
  params: AvailabilityParams,
): Promise<TimeSlot[]> {
  const { masterId, serviceId, date } = params;

  // ---- 1. Get the master (to find shop_id) ----
  const { data: master, error: masterErr } = await supabase
    .from('masters')
    .select('id, shop_id, is_active')
    .eq('id', masterId)
    .single();

  if (masterErr || !master) {
    throw new Error(`Master not found: ${masterId}`);
  }
  if (!master.is_active) {
    throw new Error(`Master is not active: ${masterId}`);
  }

  // ---- 2. Get shop settings ----
  const { data: shop, error: shopErr } = await supabase
    .from('shops')
    .select('id, timezone, slot_interval, buffer_minutes')
    .eq('id', master.shop_id)
    .single();

  if (shopErr || !shop) {
    throw new Error(`Shop not found for master: ${masterId}`);
  }

  const typedShop = shop as Pick<
    Shop,
    'id' | 'timezone' | 'slot_interval' | 'buffer_minutes'
  >;

  // ---- 3. Get service duration (check for custom override) ----
  const { data: service, error: serviceErr } = await supabase
    .from('services')
    .select('id, duration_min, is_active')
    .eq('id', serviceId)
    .single();

  if (serviceErr || !service) {
    throw new Error(`Service not found: ${serviceId}`);
  }
  if (!service.is_active) {
    throw new Error(`Service is not active: ${serviceId}`);
  }

  // Check for custom duration/price in master_services
  // Also validates that the master actually provides this service (BUG-1-006)
  const { data: masterService, error: msError } = await supabase
    .from('master_services')
    .select('custom_duration')
    .eq('master_id', masterId)
    .eq('service_id', serviceId)
    .single();

  if (msError || !masterService) {
    throw new Error(`Master does not provide this service`);
  }

  const typedMasterService = masterService as MasterService | null;
  const durationMin =
    typedMasterService?.custom_duration ?? service.duration_min;

  // ---- 4. Get schedule for day_of_week ----
  const dateObj = new Date(date + 'T00:00:00Z');
  const dayOfWeek = dateObj.getUTCDay(); // 0 = Sunday

  const { data: scheduleRows } = await supabase
    .from('schedules')
    .select('*')
    .eq('master_id', masterId)
    .eq('day_of_week', dayOfWeek)
    .eq('is_working', true);

  const schedules = (scheduleRows ?? []) as Schedule[];

  // ---- 5. Check for schedule overrides ----
  const { data: overrideRows } = await supabase
    .from('schedule_overrides')
    .select('*')
    .eq('master_id', masterId)
    .eq('override_date', date);

  const overrides = (overrideRows ?? []) as ScheduleOverride[];

  // Determine effective working hours
  let workStart: string | null = null;
  let workEnd: string | null = null;

  if (overrides.length > 0) {
    // Override takes precedence
    const override = overrides[0];
    if (!override.is_working) {
      // Master is off on this date — return empty
      return [];
    }
    workStart = override.start_time;
    workEnd = override.end_time;
  } else if (schedules.length > 0) {
    // Use regular schedule
    workStart = schedules[0].start_time;
    workEnd = schedules[0].end_time;
  }

  if (!workStart || !workEnd) {
    // No working hours for this day
    return [];
  }

  // ---- 6. Query existing bookings for this master on this date ----
  // Build day boundaries in UTC based on shop timezone.
  // Use next-day midnight as exclusive upper bound instead of "23:59"
  // to avoid missing bookings in the last minute of the day (BUG-1-005).
  const dayStartUtc = localToUtcIso(date, '00:00', typedShop.timezone);
  const nextDay = getNextDay(date);
  const dayEndUtc = localToUtcIso(nextDay, '00:00', typedShop.timezone);

  const { data: bookingRows } = await supabase
    .from('bookings')
    .select('start_at, end_at')
    .eq('master_id', masterId)
    .in('status', ['pending', 'confirmed'])
    .gte('start_at', dayStartUtc)
    .lt('start_at', dayEndUtc);

  const bookings = (bookingRows ?? []) as Pick<Booking, 'start_at' | 'end_at'>[];

  // Convert bookings to local minutes for comparison
  const existingBookings = bookings.map((b) => {
    const startUtc = new Date(b.start_at);
    const endUtc = new Date(b.end_at);

    // Convert UTC to local timezone minutes
    const startLocal = utcToLocalMinutes(startUtc, typedShop.timezone);
    const endLocal = utcToLocalMinutes(endUtc, typedShop.timezone);

    return { startMin: startLocal, endMin: endLocal };
  });

  // ---- 7. Generate slots ----
  const rawSlots = generateSlots({
    workStart,
    workEnd,
    durationMin,
    slotInterval: typedShop.slot_interval,
    bufferMinutes: typedShop.buffer_minutes,
    existingBookings,
  });

  // Convert local minute slots to UTC ISO strings
  return rawSlots.map((slot) => ({
    start: localToUtcIso(date, formatTime(slot.startMin), typedShop.timezone),
    end: localToUtcIso(date, formatTime(slot.endMin), typedShop.timezone),
    available: slot.available,
  }));
}

// ---------------------------------------------------------------------------
// Timezone helpers
// ---------------------------------------------------------------------------

/**
 * Convert a UTC Date to "minutes since midnight" in the given IANA timezone.
 */
function utcToLocalMinutes(utcDate: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0);

  return hour * 60 + minute;
}
