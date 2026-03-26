import { NextRequest, NextResponse } from "next/server";
import { routeSkills } from "@/lib/skill-router";
import { readKBFile } from "@/lib/kb-storage";
import type { KBEntry } from "@/types";

async function loadKBEntries(): Promise<KBEntry[]> {
  const entries: KBEntry[] = [];
  for (const cat of ["failure-patterns", "security-playbook", "success-patterns"] as const) {
    const file = await readKBFile(cat);
    if (file) entries.push(...file.entries);
  }
  return entries;
}

/**
 * POST /api/skills/route
 * Body: { input: string, projectContext?: string }
 * Returns: SkillPlan with ordered execution plan
 */
export async function POST(req: NextRequest) {
  try {
    const { input, projectContext } = await req.json();
    if (!input?.trim()) {
      return NextResponse.json({ error: "input required" }, { status: 400 });
    }

    const kbEntries = await loadKBEntries();
    const plan = routeSkills(input, kbEntries, projectContext);

    return NextResponse.json({ data: plan });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
