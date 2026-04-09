/**
 * GET /api/pipeline/runs/lookup?id=MC-001
 * Find a pipeline run by shortId (MC-NNN) or full UUID.
 * No auth required — read-only, local data.
 */
import { NextRequest, NextResponse } from "next/server";
import { findRunByShortId } from "@/lib/pipeline-run-storage";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "missing id param" }, { status: 400 });
  }

  const run = await findRunByShortId(id.toUpperCase());
  if (!run) {
    return NextResponse.json({ error: "not_found", id }, { status: 404 });
  }

  return NextResponse.json({ success: true, run });
}
