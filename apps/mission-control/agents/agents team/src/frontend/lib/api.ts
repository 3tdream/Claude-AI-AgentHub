// ============================================================
// Beauty CRM — Booking API Client
// Typed fetch wrapper for all booking endpoints
// ============================================================

import type {
  Shop,
  ServiceCategory,
  Master,
  DayAvailability,
  TimeSlot,
  CreateBookingPayload,
  BookingConfirmation,
  ApiError,
} from "../types/booking";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

// ── Helpers ──────────────────────────────────────────────────

class BookingApiError extends Error {
  code: string;
  statusCode: number;

  constructor(apiError: ApiError) {
    super(apiError.message);
    this.name = "BookingApiError";
    this.code = apiError.code;
    this.statusCode = apiError.statusCode;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let apiError: ApiError;
    try {
      apiError = (await res.json()) as ApiError;
    } catch {
      apiError = {
        message: res.statusText || "Unknown error",
        code: "UNKNOWN",
        statusCode: res.status,
      };
    }
    throw new BookingApiError(apiError);
  }

  const json = await res.json();
  // Backend wraps responses in { data: ... }
  return (json.data !== undefined ? json.data : json) as T;
}

// ── Backend ↔ Frontend Transformers ──────────────────────────

interface BackendTimeSlot {
  start: string;
  end: string;
  available: boolean;
}

function transformAvailability(slots: BackendTimeSlot[], date: string): DayAvailability[] {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.toLocaleDateString("en-US", { weekday: "short" });
  const dayOfMonth = dateObj.getDate();
  const month = dateObj.toLocaleDateString("en-US", { month: "short" });

  const transformedSlots: TimeSlot[] = slots.map(slot => ({
    datetime: slot.start,
    displayTime: new Date(slot.start).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    isAvailable: slot.available,
  }));

  return [{
    date,
    dayOfWeek,
    dayOfMonth,
    month,
    slots: transformedSlots,
  }];
}

interface BackendBookingConfirmation {
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
  status: string;
  client_name: string;
}

function transformBookingConfirmation(raw: BackendBookingConfirmation): BookingConfirmation {
  return {
    id: raw.id,
    bookingCode: raw.booking_code,
    shopName: raw.shop_name,
    serviceName: raw.service_name,
    masterName: raw.master_name,
    datetime: raw.start_at,
    duration: raw.duration_min,
    price: raw.price,
    currency: raw.currency,
    status: raw.status === "confirmed" ? "confirmed" : "pending",
  };
}

// ── Public API ───────────────────────────────────────────────

/** GET /api/v1/shops/:slug — Fetch shop info by slug */
export async function fetchShop(slug: string): Promise<Shop> {
  return request<Shop>(`/shops/${encodeURIComponent(slug)}`);
}

/** GET /api/v1/shops/:shopId/services — Fetch services grouped by category */
export async function fetchServices(
  shopId: string,
): Promise<ServiceCategory[]> {
  return request<ServiceCategory[]>(
    `/shops/${encodeURIComponent(shopId)}/services`,
  );
}

/** GET /api/v1/shops/:shopId/masters?serviceId= — Fetch masters filtered by service */
export async function fetchMasters(
  shopId: string,
  serviceId: string,
): Promise<Master[]> {
  const params = new URLSearchParams({ serviceId });
  return request<Master[]>(
    `/shops/${encodeURIComponent(shopId)}/masters?${params.toString()}`,
  );
}

/** GET /api/v1/availability?masterId=&serviceId=&date= — Fetch time slots */
export async function fetchAvailability(
  masterId: string,
  serviceId: string,
  date: string,
): Promise<DayAvailability[]> {
  const params = new URLSearchParams({ masterId, serviceId, date });
  const slots = await request<BackendTimeSlot[]>(`/availability?${params.toString()}`);
  return transformAvailability(slots, date);
}

/** POST /api/v1/bookings — Create a new booking */
export async function createBooking(
  payload: CreateBookingPayload,
): Promise<BookingConfirmation> {
  const raw = await request<BackendBookingConfirmation>("/bookings", {
    method: "POST",
    body: JSON.stringify({
      shop_id: payload.shopId,
      master_id: payload.masterId,
      service_id: payload.serviceId,
      start_at: payload.datetime,
      client_name: payload.customerName,
      client_phone: payload.customerPhone,
      notes: payload.comment || undefined,
    }),
  });
  return transformBookingConfirmation(raw);
}

export { BookingApiError };
