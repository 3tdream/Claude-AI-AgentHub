import { NextRequest, NextResponse } from "next/server";
import { classifyIntent } from "@/lib/intent-classifier";

/**
 * POST /api/intent-test — Test intent classifier WITHOUT calling Claude API
 *
 * Body: { inputs: string[] } — array of test inputs
 * Returns classification for each without executing anything
 * Zero API calls, zero tokens, zero cost.
 */
export async function POST(req: NextRequest) {
  try {
    const { inputs } = await req.json();

    if (!Array.isArray(inputs) || inputs.length === 0) {
      return NextResponse.json({ error: "inputs must be a non-empty array of strings" }, { status: 400 });
    }

    const results = inputs.map((input: string) => {
      const decision = classifyIntent(input);
      return {
        input: input.substring(0, 100),
        intent: decision.intent,
        confidence: decision.confidence,
        reason: decision.reason,
        pipelineMode: decision.pipelineMode || null,
      };
    });

    const summary = {
      total: results.length,
      direct: results.filter((r) => r.intent === "direct").length,
      pipeline: results.filter((r) => r.intent === "pipeline").length,
      hybrid: results.filter((r) => r.intent === "hybrid").length,
      avgConfidence: Math.round(results.reduce((s, r) => s + r.confidence, 0) / results.length * 100) / 100,
    };

    return NextResponse.json({ results, summary });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
