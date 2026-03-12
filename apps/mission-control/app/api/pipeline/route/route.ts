import { NextRequest, NextResponse } from "next/server";
import { routeTask } from "@/lib/smart-router";

/**
 * POST /api/pipeline/route — Smart routing
 * Analyzes task and returns which agents to use.
 */
export async function POST(request: NextRequest) {
  try {
    const { input } = await request.json();

    if (!input?.trim()) {
      return NextResponse.json(
        { success: false, error: "input is required" },
        { status: 400 },
      );
    }

    const decision = await routeTask(input);

    return NextResponse.json({ success: true, decision });
  } catch (error) {
    console.error("[API] Smart routing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Routing failed",
      },
      { status: 500 },
    );
  }
}
