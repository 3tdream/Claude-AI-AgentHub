import { NextResponse } from "next/server";
import { evolveAllAgents } from "@/lib/agent-evolution";
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
 * GET /api/agents/evolve — propose prompt improvements for all agents
 * Returns proposals only — does NOT auto-apply.
 */
export async function GET() {
  const kbEntries = await loadKBEntries();
  const evolutions = await evolveAllAgents(kbEntries);

  const needsAttention = evolutions.filter((e) => e.additions.length > 0);

  return NextResponse.json({
    data: evolutions,
    summary: {
      total: evolutions.length,
      needsAttention: needsAttention.length,
      totalAdditions: evolutions.reduce((s, e) => s + e.additions.length, 0),
    },
  });
}
