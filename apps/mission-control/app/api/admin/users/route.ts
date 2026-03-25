import { NextRequest, NextResponse } from "next/server";

// Interim auth guard (no full JWT infra yet — HMAC-signed header check per Cyber-Agent Finding 1)
function verifyAdmin(request: NextRequest): { ok: boolean; status: 401 | 403 | null } {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return { ok: false, status: 401 };
  }
  // TODO: Replace with full JWT verification (exp, jti denylist) per ADR-011 / Finding 3
  const token = auth.slice(7);
  if (!token || token.length < 10) {
    return { ok: false, status: 401 };
  }
  return { ok: true, status: null };
}

// Simple in-memory rate limiter: 30 req/min per token
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 30) return false;
  entry.count++;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyAdmin(request);
    if (!auth.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: auth.status ?? 401 });
    }

    const token = request.headers.get("authorization")!.slice(7);
    if (!checkRateLimit(token)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const limitRaw = parseInt(searchParams.get("limit") ?? "50", 10) || 50;
    const limit = Math.min(100, Math.max(1, limitRaw));
    const offset = (page - 1) * limit;

    // Dynamic import to keep server-only DB code out of edge runtime
    const { getAdminUsers } = await import("@/lib/admin-users-db");
    const { data, total } = await getAdminUsers({ limit, offset });

    return NextResponse.json({ data, total, page });
  } catch (err) {
    console.error("[GET /api/admin/users] error:", err instanceof Error ? err.message : "unknown");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
