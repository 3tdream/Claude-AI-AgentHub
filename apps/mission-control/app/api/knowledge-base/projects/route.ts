import { NextRequest, NextResponse } from "next/server";
import { listProjects, searchAllProjects, validateAllProjects, promoteToGlobal } from "@/lib/kb-multi-project";
import type { KBCategory } from "@/types";

/** GET /api/knowledge-base/projects — list projects, cross-project search, or validate all */
export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get("action");
  const query = req.nextUrl.searchParams.get("q");

  if (query) {
    const results = await searchAllProjects(query);
    return NextResponse.json({
      data: results,
      total: results.length,
      projects: [...new Set(results.map((r) => r.projectId))],
    });
  }

  if (action === "validate") {
    const validation = await validateAllProjects();
    return NextResponse.json({ data: validation });
  }

  // Default: list projects
  const projects = await listProjects();
  return NextResponse.json({ data: projects });
}

/** POST /api/knowledge-base/projects — promote entry to global */
export async function POST(req: NextRequest) {
  try {
    const { projectId, entryId, category } = await req.json();
    if (!projectId || !entryId || !category) {
      return NextResponse.json({ error: "projectId, entryId, category required" }, { status: 400 });
    }
    const entry = await promoteToGlobal(projectId, entryId, category as KBCategory);
    if (!entry) return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    return NextResponse.json({ data: entry }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
