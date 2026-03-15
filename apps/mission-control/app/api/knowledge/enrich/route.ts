import { NextResponse } from "next/server";
import { enrichKnowledgeBase } from "@/lib/knowledge-manager";
import { addLog } from "@/lib/logs-storage";
import type { PipelineExecution } from "@/types";

export async function POST(request: Request) {
  try {
    const execution: PipelineExecution = await request.json();

    if (!execution.id || !execution.stepResults) {
      return NextResponse.json(
        { error: "Invalid pipeline execution data" },
        { status: 400 },
      );
    }

    const result = await enrichKnowledgeBase(execution);

    // Log the enrichment
    await addLog({
      type: "system",
      content: `Knowledge base enriched from pipeline "${execution.workflowName}": ${result.lessonsExtracted} lessons extracted (${result.failurePatternsAdded} failures, ${result.techDecisionsAdded} decisions, ${result.architecturePatternsAdded} patterns, ${result.securityVulnsAdded} security)`,
    });

    return NextResponse.json({ success: true, result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Enrichment failed" },
      { status: 500 },
    );
  }
}
