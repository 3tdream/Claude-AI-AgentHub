import { NextResponse } from "next/server";
import { generateSkillProposals } from "@/lib/skill-generator";
import { readKBFile } from "@/lib/kb-storage";
import type { KBEntry } from "@/types";

async function loadKBEntries(): Promise<KBEntry[]> {
  const entries: KBEntry[] = [];
  for (const cat of ["failure-patterns", "success-patterns", "security-playbook", "architecture-patterns", "tech-decisions"] as const) {
    const file = await readKBFile(cat);
    if (file) entries.push(...file.entries);
  }
  return entries;
}

/**
 * GET /api/skills/proposals — propose new skills based on KB patterns
 * Returns proposals only — does NOT auto-create.
 */
export async function GET() {
  const kbEntries = await loadKBEntries();
  const proposals = generateSkillProposals(kbEntries);

  return NextResponse.json({
    data: proposals,
    summary: {
      total: proposals.length,
      prevention: proposals.filter((p) => p.category === "prevention").length,
      detection: proposals.filter((p) => p.category === "detection").length,
      calibration: proposals.filter((p) => p.category === "calibration").length,
      builder: proposals.filter((p) => p.category === "builder").length,
      avgConfidence: proposals.length > 0
        ? Math.round(proposals.reduce((s, p) => s + p.confidence, 0) / proposals.length * 100) / 100
        : 0,
    },
  });
}
