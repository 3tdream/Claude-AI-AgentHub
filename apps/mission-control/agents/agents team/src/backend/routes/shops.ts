// ============================================================================
// Beauty CRM — Phase 1 Booking MVP — Shop Routes
//   GET /api/v1/shops/:slug       — shop info
//   GET /api/v1/shops/:shopId/services — services grouped by category
//   GET /api/v1/shops/:shopId/masters  — masters list
// ============================================================================

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getSupabaseClient } from '../db/supabase';
import {
  getShopBySlugSchema,
  getServicesSchema,
  getMastersSchema,
} from '../validation/booking.schemas';
import { errorResponse, zodErrorResponse } from '../utils/response';
import type {
  ApiError,
  ApiSuccess,
  Master,
  Service,
  ServicesByCategory,
  Shop,
} from '../../shared/types/booking';

// ---------------------------------------------------------------------------
// 1. GET /api/v1/shops/:slug
// ---------------------------------------------------------------------------

export async function getShopBySlug(
  _request: NextRequest,
  params: { slug: string },
): Promise<NextResponse<ApiSuccess<Shop> | ApiError>> {
  try {
    const validated = getShopBySlugSchema.parse({ slug: params.slug });
    const supabase = getSupabaseClient();

    const { data: shop, error } = await supabase
      .from('shops')
      .select('*')
      .eq('slug', validated.slug)
      .eq('is_active', true)
      .single();

    if (error || !shop) {
      return errorResponse(404, 'NOT_FOUND', `Shop with slug "${validated.slug}" not found`);
    }

    return NextResponse.json({ data: shop as Shop });
  } catch (err) {
    if (err instanceof ZodError) {
      return zodErrorResponse(err);
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(500, 'INTERNAL_ERROR', message);
  }
}

// ---------------------------------------------------------------------------
// 2. GET /api/v1/shops/:shopId/services?category=
// ---------------------------------------------------------------------------

export async function getShopServices(
  request: NextRequest,
  params: { shopId: string },
): Promise<NextResponse<ApiSuccess<ServicesByCategory[]> | ApiError>> {
  try {
    const url = new URL(request.url);
    const category = url.searchParams.get('category') ?? undefined;

    const validated = getServicesSchema.parse({
      shopId: params.shopId,
      category,
    });

    const supabase = getSupabaseClient();

    let query = supabase
      .from('services')
      .select('*')
      .eq('shop_id', validated.shopId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (validated.category) {
      query = query.eq('category', validated.category);
    }

    const { data: services, error } = await query;

    if (error) {
      return errorResponse(500, 'INTERNAL_ERROR', `Failed to fetch services: ${error.message}`);
    }

    // Group by category
    const grouped = groupServicesByCategory((services ?? []) as Service[]);

    return NextResponse.json({ data: grouped });
  } catch (err) {
    if (err instanceof ZodError) {
      return zodErrorResponse(err);
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(500, 'INTERNAL_ERROR', message);
  }
}

/**
 * Group a flat array of services into ServicesByCategory[].
 */
function groupServicesByCategory(services: Service[]): ServicesByCategory[] {
  const map = new Map<string, Service[]>();

  for (const service of services) {
    const existing = map.get(service.category);
    if (existing) {
      existing.push(service);
    } else {
      map.set(service.category, [service]);
    }
  }

  return Array.from(map.entries()).map(([category, items]) => ({
    category,
    services: items,
  }));
}

// ---------------------------------------------------------------------------
// 3. GET /api/v1/shops/:shopId/masters?serviceId=
// ---------------------------------------------------------------------------

export async function getShopMasters(
  request: NextRequest,
  params: { shopId: string },
): Promise<NextResponse<ApiSuccess<Master[]> | ApiError>> {
  try {
    const url = new URL(request.url);
    const serviceId = url.searchParams.get('serviceId') ?? undefined;

    const validated = getMastersSchema.parse({
      shopId: params.shopId,
      serviceId,
    });

    const supabase = getSupabaseClient();

    if (validated.serviceId) {
      // Filter masters who provide this specific service
      // First get master IDs from master_services junction
      const { data: masterServiceRows, error: msError } = await supabase
        .from('master_services')
        .select('master_id')
        .eq('service_id', validated.serviceId);

      if (msError) {
        return errorResponse(
          500,
          'INTERNAL_ERROR',
          `Failed to fetch master-service links: ${msError.message}`,
        );
      }

      const masterIds = (masterServiceRows ?? []).map(
        (row: { master_id: string }) => row.master_id,
      );

      if (masterIds.length === 0) {
        return NextResponse.json({ data: [] });
      }

      const { data: masters, error } = await supabase
        .from('masters')
        .select('*')
        .eq('shop_id', validated.shopId)
        .eq('is_active', true)
        .in('id', masterIds)
        .order('sort_order', { ascending: true });

      if (error) {
        return errorResponse(500, 'INTERNAL_ERROR', `Failed to fetch masters: ${error.message}`);
      }

      return NextResponse.json({ data: (masters ?? []) as Master[] });
    }

    // No service filter — return all active masters for the shop
    const { data: masters, error } = await supabase
      .from('masters')
      .select('*')
      .eq('shop_id', validated.shopId)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      return errorResponse(500, 'INTERNAL_ERROR', `Failed to fetch masters: ${error.message}`);
    }

    return NextResponse.json({ data: (masters ?? []) as Master[] });
  } catch (err) {
    if (err instanceof ZodError) {
      return zodErrorResponse(err);
    }
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(500, 'INTERNAL_ERROR', message);
  }
}
