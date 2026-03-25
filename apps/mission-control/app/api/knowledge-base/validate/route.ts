import { NextRequest, NextResponse } from "next/server";
import { validateKBFile, validateAll } from "@/lib/kb-storage";
import type { KBCategory } from "@/types";

/** GET /api/knowledge-base/validate?category=X — hash integrity check */
export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") as KBCategory | null;

  if (category) {
    const result = await validateKBFile(category);
    return NextResponse.json({
      category,
      ...result,
      status: result.valid ? "ok" : "integrity_violation",
    });
  }

  // Validate all
  const index = await validateAll();
  const violations = index.categories.filter((c) => {
    // re-check each hash
    return false; // index already checks via validateAll
  });

  return NextResponse.json({
    integrityOk: index.integrityOk,
    totalEntries: index.totalEntries,
    categories: index.categories.map((c) => ({
      category: c.category,
      entries: c.entryCount,
      stale: c.stale,
      lastUpdated: c.lastUpdated,
    })),
    lastValidated: index.lastValidated,
  });
}
