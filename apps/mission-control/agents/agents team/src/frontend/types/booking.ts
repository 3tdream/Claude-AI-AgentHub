// ============================================================
// Beauty CRM — Booking Widget Types
// Phase 1: 4-step booking flow
// ============================================================

/** A single service offered by a salon */
export interface Service {
  id: string;
  name: string;
  description: string | null;
  /** Duration in minutes */
  duration: number;
  /** Price in the salon's currency (minor units, e.g. kopecks) */
  price: number;
  /** Currency code, e.g. "RUB", "ILS" */
  currency: string;
  /** Lucide icon name, e.g. "scissors", "sparkles" */
  icon: string;
  categoryId: string;
  categoryName: string;
  /** Whether the service is currently available for booking */
  isAvailable: boolean;
}

/** Category grouping for services */
export interface ServiceCategory {
  id: string;
  name: string;
  services: Service[];
}

/** A master (stylist / specialist) */
export interface Master {
  id: string;
  name: string;
  /** URL to avatar image */
  avatarUrl: string | null;
  specialization: string;
  /** Rating 0-5 */
  rating: number;
  /** Total review count */
  reviewCount: number;
  /** Whether this master has availability for the selected service */
  isAvailable: boolean;
  /** Short bio / tagline */
  bio?: string;
}

/** A single bookable time slot */
export interface TimeSlot {
  /** ISO 8601 datetime string */
  datetime: string;
  /** Display time, e.g. "10:00" */
  displayTime: string;
  /** Whether this slot is still available */
  isAvailable: boolean;
}

/** Grouped time slots for a single date */
export interface DayAvailability {
  /** ISO 8601 date string, e.g. "2026-03-15" */
  date: string;
  /** Day of week short label, e.g. "Mon" */
  dayOfWeek: string;
  /** Day of month number */
  dayOfMonth: number;
  /** Month short label, e.g. "Mar" */
  month: string;
  slots: TimeSlot[];
}

/** Shop (salon) information */
export interface Shop {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  address: string | null;
  phone: string | null;
  /** Timezone, e.g. "Asia/Jerusalem" */
  timezone: string;
  currency: string;
}

/** Form data for the contact/confirmation step */
export interface BookingFormData {
  name: string;
  phone: string;
  comment: string;
}

/** The 4 steps of the booking flow */
export type BookingStep = 1 | 2 | 3 | 4;

/** Overall booking state managed by the useBooking hook */
export interface BookingState {
  step: BookingStep;
  shop: Shop | null;
  services: ServiceCategory[];
  masters: Master[];
  availability: DayAvailability[];

  selectedService: Service | null;
  selectedMaster: Master | null;
  selectedDate: string | null;
  selectedTime: TimeSlot | null;
  formData: BookingFormData;

  /** Loading / error state per concern */
  isLoadingShop: boolean;
  isLoadingServices: boolean;
  isLoadingMasters: boolean;
  isLoadingAvailability: boolean;
  isSubmitting: boolean;

  error: string | null;
}

/** Actions the booking reducer understands */
export type BookingAction =
  | { type: "SET_SHOP"; payload: Shop }
  | { type: "SET_SERVICES"; payload: ServiceCategory[] }
  | { type: "SET_MASTERS"; payload: Master[] }
  | { type: "SET_AVAILABILITY"; payload: DayAvailability[] }
  | { type: "SELECT_SERVICE"; payload: Service }
  | { type: "SELECT_MASTER"; payload: Master }
  | { type: "SELECT_DATE"; payload: string }
  | { type: "SELECT_TIME"; payload: TimeSlot }
  | { type: "SET_FORM_DATA"; payload: Partial<BookingFormData> }
  | { type: "SET_STEP"; payload: BookingStep }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_LOADING"; payload: { key: LoadingKey; value: boolean } }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };

export type LoadingKey =
  | "isLoadingShop"
  | "isLoadingServices"
  | "isLoadingMasters"
  | "isLoadingAvailability"
  | "isSubmitting";

/** Payload sent to POST /api/v1/bookings */
export interface CreateBookingPayload {
  shopId: string;
  serviceId: string;
  masterId: string;
  /** ISO 8601 datetime of chosen slot */
  datetime: string;
  customerName: string;
  customerPhone: string;
  comment?: string;
}

/** Response from POST /api/v1/bookings */
export interface BookingConfirmation {
  id: string;
  /** Human-readable booking code, e.g. "BK-0412" */
  bookingCode: string;
  shopName: string;
  serviceName: string;
  masterName: string;
  datetime: string;
  duration: number;
  price: number;
  currency: string;
  status: "confirmed" | "pending";
}

/** API error shape */
export interface ApiError {
  message: string;
  code: string;
  statusCode: number;
}
