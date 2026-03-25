import { NextRequest, NextResponse } from "next/server";
import { validateAll, readKBFile, addEntry, searchKB } from "@/lib/kb-storage";
import type { KBCategory } from "@/types";

const VALID_CATEGORIES: KBCategory[] = [
  "failure-patterns",
  "success-patterns",
  "security-playbook",
  "architecture-patterns",
  "tech-decisions",
];

/** GET /api/knowledge-base — index, category, or search */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") as KBCategory | null;
  const query = searchParams.get("q");

  // Search mode
  if (query) {
    const cats = category ? [category] : undefined;
    const results = await searchKB(query, cats);
    return NextResponse.json({ data: results, total: results.length });
  }

  // Single category
  if (category) {
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }
    const file = await readKBFile(category);
    if (!file) {
      return NextResponse.json({ error: `Category not found: ${category}` }, { status: 404 });
    }
    return NextResponse.json({ data: file });
  }

  // Full index with validation
  const index = await validateAll();
  return NextResponse.json({ data: index });
}

/** POST /api/knowledge-base — add new entry */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, title, content, source, agentId, severity, tags, pipelineRunId } = body;

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid or missing category" }, { status: 400 });
    }
    if (!title || !content || !source) {
      return NextResponse.json({ error: "title, content, source are required" }, { status: 400 });
    }

    const entry = await addEntry(category, {
      title,
      content,
      source,
      agentId: agentId || undefined,
      severity: severity || "medium",
      tags: tags || [],
      pipelineRunId: pipelineRunId || undefined,
    });

    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
