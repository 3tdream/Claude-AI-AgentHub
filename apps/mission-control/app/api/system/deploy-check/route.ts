import { NextResponse } from "next/server";
import { runDeployCheck } from "@/lib/deploy-check";

/** GET /api/system/deploy-check — production readiness check */
export async function GET() {
  const report = await runDeployCheck();
  return NextResponse.json({ data: report });
}
