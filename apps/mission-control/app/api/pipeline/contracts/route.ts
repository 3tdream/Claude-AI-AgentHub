import { NextRequest, NextResponse } from "next/server";
import { STAGE_CONTRACTS, validateStageOutput, enrichContractWithKB } from "@/lib/stage-contracts";
import { readKBFile } from "@/lib/kb-storage";
import type { KBEntry } from "@/types";

/** Load KB entries for dynamic enrichment (server-side) */
async function loadKBEntries(): Promise<KBEntry[]> {
  const entries: KBEntry[] = [];
  const fp = await readKBFile("failure-patterns");
  const sp = await readKBFile("security-playbook");
  if (fp) entries.push(...fp.entries);
  if (sp) entries.push(...sp.entries);
  return entries;
}

/** GET /api/pipeline/contracts — list all contracts or get specific one */
export async function GET(req: NextRequest) {
  const stageId = req.nextUrl.searchParams.get("stageId");
  const withKB = req.nextUrl.searchParams.get("enrich") !== "false";

  const kbEntries = withKB ? await loadKBEntries() : [];

  if (stageId) {
    const contract = STAGE_CONTRACTS[stageId];
    if (!contract) {
      return NextResponse.json({ error: `No contract for stage: ${stageId}` }, { status: 404 });
    }
    const enriched = kbEntries.length > 0 ? enrichContractWithKB(contract, kbEntries) : contract;
    const kbConstraints = enriched.constraints.length - contract.constraints.length;
    return NextResponse.json({
      data: enriched,
      _meta: { kbEntriesLoaded: kbEntries.length, dynamicConstraints: kbConstraints },
    });
  }

  // List all contracts summary (enriched)
  const summary = Object.values(STAGE_CONTRACTS).map((c) => {
    const enriched = kbEntries.length > 0 ? enrichContractWithKB(c, kbEntries) : c;
    const dynamicConstraints = enriched.constraints.length - c.constraints.length;
    return {
      stageId: c.stageId,
      stageName: c.stageName,
      agentId: c.agentId,
      inputCount: c.inputs.length,
      outputCount: c.outputs.length,
      constraintCount: enriched.constraints.length,
      riskCount: enriched.risks.length,
      staticConstraints: c.constraints.filter((x) => x.severity === "blocking").length,
      dynamicConstraints,
      blockingConstraints: enriched.constraints.filter((x) => x.severity === "blocking").length,
    };
  });

  return NextResponse.json({
    data: summary,
    total: summary.length,
    _meta: { kbEntriesLoaded: kbEntries.length },
  });
}

/** POST /api/pipeline/contracts — validate output against contract (with KB) */
export async function POST(req: NextRequest) {
  try {
    const { stageId, output } = await req.json();
    if (!stageId || !output) {
      return NextResponse.json({ error: "stageId and output are required" }, { status: 400 });
    }
    const kbEntries = await loadKBEntries();
    const result = validateStageOutput(stageId, output, kbEntries);
    return NextResponse.json({
      data: result,
      _meta: { kbEntriesUsed: kbEntries.length },
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
