// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Shared Types
// All TypeScript interfaces matching the DB schema (7 tables)
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

export type Currency = 'ILS' | 'USD' | 'EUR' | 'RUB';

// ---------------------------------------------------------------------------
// JSONB sub-types
// ---------------------------------------------------------------------------

/** One day's working hours inside shop.working_hours JSONB */
export interface DayHours {
  /** 0 = Sunday … 6 = Saturday */
  day: number;
  open: string;   // "09:00"
  close: string;  // "20:00"
  is_working: boolean;
}

/** shop.working_hours is an array of 7 DayHours entries */
export type WorkingHoursJson = DayHours[];

// ---------------------------------------------------------------------------
// Table: shops
// ---------------------------------------------------------------------------

export interface Shop {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  timezone: string;            // IANA, e.g. "Asia/Jerusalem"
  slot_interval: number;       // minutes (e.g. 15, 30)
  buffer_minutes: number;      // gap between bookings
  working_hours: WorkingHoursJson;
  currency: Currency;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Table: services
// ---------------------------------------------------------------------------

export interface Service {
  id: string;
  shop_id: string;
  name: string;
  description: string | null;
  category: string;
  duration_min: number;
  price: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** Services grouped by category for the API response */
export interface ServicesByCategory {
  category: string;
  services: Service[];
}

// ---------------------------------------------------------------------------
// Table: masters
// ---------------------------------------------------------------------------

export interface Master {
  id: string;
  shop_id: string;
  name: string;
  bio: string | null;
  photo_url: string | null;
  specialization: string | null;
  rating: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Table: master_services (junction)
// ---------------------------------------------------------------------------

export interface MasterService {
  master_id: string;
  service_id: string;
  custom_duration: number | null;  // overrides service.duration_min
  custom_price: number | null;     // overrides service.price
}

// ---------------------------------------------------------------------------
// Table: schedules (weekly recurring)
// ---------------------------------------------------------------------------

export interface Schedule {
  id: string;
  master_id: string;
  day_of_week: number;   // 0-6 (Sun-Sat)
  start_time: string;    // "09:00"
  end_time: string;      // "18:00"
  is_working: boolean;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Table: schedule_overrides (specific date)
// ---------------------------------------------------------------------------

export interface ScheduleOverride {
  id: string;
  master_id: string;
  override_date: string;  // "YYYY-MM-DD"
  is_working: boolean;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Table: bookings
// ---------------------------------------------------------------------------

export interface Booking {
  id: string;
  shop_id: string;
  master_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  start_at: string;        // ISO-8601 UTC
  end_at: string;           // ISO-8601 UTC
  status: BookingStatus;
  price: number;
  notes: string | null;
  version: number;           // optimistic locking
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// API request / response helpers
// ---------------------------------------------------------------------------

export interface TimeSlot {
  start: string;   // ISO-8601 UTC
  end: string;     // ISO-8601 UTC
  available: boolean;
}

export interface CreateBookingInput {
  shop_id: string;
  master_id: string;
  service_id: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  start_at: string;
  notes?: string;
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  client_name?: string;
  client_phone?: string;
  client_email?: string;
  notes?: string;
  version: number;  // required for optimistic locking
}

export interface AdminBookingsFilter {
  shop_id: string;
  date?: string;         // single date YYYY-MM-DD
  date_from?: string;    // range start
  date_to?: string;      // range end
  status?: BookingStatus;
  master_id?: string;
  page?: number;
  per_page?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  error: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
}

// ---------------------------------------------------------------------------
// Booking confirmation (enriched response for clients)
// ---------------------------------------------------------------------------

export interface BookingConfirmationResponse {
  id: string;
  booking_code: string;
  shop_name: string;
  service_name: string;
  master_name: string;
  start_at: string;
  end_at: string;
  duration_min: number;
  price: number;
  currency: string;
  status: BookingStatus;
  client_name: string;
  client_phone: string;
}
