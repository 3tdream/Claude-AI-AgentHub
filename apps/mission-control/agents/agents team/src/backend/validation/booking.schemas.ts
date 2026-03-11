// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Zod Validation Schemas
// Every endpoint input is validated with zod .parse()
// ============================================================================

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Reusable primitives
// ---------------------------------------------------------------------------

const uuidSchema = z.string().uuid('Must be a valid UUID');

const dateStringSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format');

const phoneSchema = z
  .string()
  .min(7, 'Phone must be at least 7 characters')
  .max(20, 'Phone must be at most 20 characters')
  .regex(/^[\d+\-() ]+$/, 'Phone contains invalid characters');

const emailSchema = z.string().email('Invalid email address');

const bookingStatusSchema = z.enum([
  'pending',
  'confirmed',
  'cancelled',
  'completed',
  'no_show',
]);

const positiveInt = z.number().int().positive();

// ---------------------------------------------------------------------------
// 1. GET /api/v1/shops/:slug
// ---------------------------------------------------------------------------

export const getShopBySlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug too long')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
});

export type GetShopBySlugInput = z.infer<typeof getShopBySlugSchema>;

// ---------------------------------------------------------------------------
// 2. GET /api/v1/shops/:shopId/services?category=
// ---------------------------------------------------------------------------

export const getServicesSchema = z.object({
  shopId: uuidSchema,
  category: z.string().max(100).optional(),
});

export type GetServicesInput = z.infer<typeof getServicesSchema>;

// ---------------------------------------------------------------------------
// 3. GET /api/v1/shops/:shopId/masters?serviceId=
// ---------------------------------------------------------------------------

export const getMastersSchema = z.object({
  shopId: uuidSchema,
  serviceId: uuidSchema.optional(),
});

export type GetMastersInput = z.infer<typeof getMastersSchema>;

// ---------------------------------------------------------------------------
// 4. GET /api/v1/availability?masterId=&serviceId=&date=
// ---------------------------------------------------------------------------

export const getAvailabilitySchema = z.object({
  masterId: uuidSchema,
  serviceId: uuidSchema,
  date: dateStringSchema,
});

export type GetAvailabilityInput = z.infer<typeof getAvailabilitySchema>;

// ---------------------------------------------------------------------------
// 5. POST /api/v1/bookings
// ---------------------------------------------------------------------------

export const createBookingSchema = z.object({
  shop_id: uuidSchema,
  master_id: uuidSchema,
  service_id: uuidSchema,
  client_name: z
    .string()
    .min(1, 'Client name is required')
    .max(200, 'Client name too long'),
  client_phone: phoneSchema,
  client_email: emailSchema.optional(),
  start_at: z.string().datetime({ message: 'start_at must be ISO-8601 UTC' }),
  notes: z.string().max(1000, 'Notes too long').optional(),
});

export type CreateBookingSchemaInput = z.infer<typeof createBookingSchema>;

// ---------------------------------------------------------------------------
// 6. GET /api/v1/admin/bookings?shopId=&date=&dateFrom=&dateTo=&status=&masterId=&page=&perPage=
// ---------------------------------------------------------------------------

export const adminBookingsQuerySchema = z.object({
  shopId: uuidSchema,
  date: dateStringSchema.optional(),
  dateFrom: dateStringSchema.optional(),
  dateTo: dateStringSchema.optional(),
  status: bookingStatusSchema.optional(),
  masterId: uuidSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type AdminBookingsQueryInput = z.infer<typeof adminBookingsQuerySchema>;

// ---------------------------------------------------------------------------
// 7. PATCH /api/v1/admin/bookings/:id
// ---------------------------------------------------------------------------

export const updateBookingParamsSchema = z.object({
  id: uuidSchema,
});

export const updateBookingBodySchema = z
  .object({
    status: bookingStatusSchema.optional(),
    client_name: z.string().min(1).max(200).optional(),
    client_phone: phoneSchema.optional(),
    client_email: emailSchema.nullable().optional(),
    notes: z.string().max(1000).nullable().optional(),
    version: positiveInt,
  })
  .refine(
    (data) => {
      // At least one field besides version must be provided
      const { version: _version, ...rest } = data;
      return Object.values(rest).some((v) => v !== undefined);
    },
    { message: 'At least one field to update must be provided besides version' },
  );

export type UpdateBookingParamsInput = z.infer<typeof updateBookingParamsSchema>;
export type UpdateBookingBodyInput = z.infer<typeof updateBookingBodySchema>;
