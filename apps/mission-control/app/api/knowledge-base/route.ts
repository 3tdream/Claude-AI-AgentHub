import { NextRequest, NextResponse } from "next/server";
import { validateAll, readKBFile, addEntry, searchKB } from "@/lib/kb-storage";
import { readProjectKBFile, addProjectEntry, searchAllProjects } from "@/lib/kb-multi-project";
import type { KBCategory } from "@/types";

const VALID_CATEGORIES: KBCategory[] = [
  "failure-patterns",
  "success-patterns",
  "security-playbook",
  "architecture-patterns",
  "tech-decisions",
];

/**
 * GET /api/knowledge-base
 *
 * Params:
 *   projectId — scope to project (omit for global/default)
 *   category — filter by category
 *   q — search query
 *   scope — "project" | "global" | "all" (default: follows projectId)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category") as KBCategory | null;
  const query = searchParams.get("q");
  const projectId = searchParams.get("projectId");
  const scope = searchParams.get("scope") || (projectId ? "project" : "global");

  // Search mode
  if (query) {
    if (scope === "all") {
      // Cross-project search
      const results = await searchAllProjects(query, category ? [category] : undefined);
      return NextResponse.json({
        data: results.map((r) => ({ ...r.entry, _projectId: r.projectId })),
        total: results.length,
        scope: "all",
      });
    }

    if (projectId && scope === "project") {
      // Project-scoped search — search project KB + global KB
      const [projectResults, globalResults] = await Promise.all([
        searchProjectKB(projectId, query, category ? [category] : undefined),
        searchKB(query, category ? [category] : undefined),
      ]);
      // Merge: project first, then global (deduplicated by ID)
      const seenIds = new Set(projectResults.map((e) => e.id));
      const merged = [
        ...projectResults.map((e) => ({ ...e, _layer: "project" as const })),
        ...globalResults.filter((e) => !seenIds.has(e.id)).map((e) => ({ ...e, _layer: "global" as const })),
      ];
      return NextResponse.json({ data: merged, total: merged.length, scope: "project+global", projectId });
    }

    // Global search (default)
    const cats = category ? [category] : undefined;
    const results = await searchKB(query, cats);
    return NextResponse.json({ data: results, total: results.length, scope: "global" });
  }

  // Single category
  if (category) {
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category: ${category}` }, { status: 400 });
    }

    if (projectId && scope === "project") {
      // Try project-specific first, fallback to global
      const projectFile = await readProjectKBFile(projectId, category);
      const globalFile = await readKBFile(category);
      return NextResponse.json({
        data: {
          project: projectFile,
          global: globalFile,
        },
        projectId,
        scope: "project+global",
      });
    }

    const file = await readKBFile(category);
    if (!file) {
      return NextResponse.json({ error: `Category not found: ${category}` }, { status: 404 });
    }
    return NextResponse.json({ data: file, scope: "global" });
  }

  // Full index with validation
  const index = await validateAll();
  return NextResponse.json({ data: index, scope: "global" });
}

/**
 * POST /api/knowledge-base — add new entry
 * Body: { category, title, content, source, ..., projectId? }
 * If projectId provided → writes to project KB. Otherwise → global KB.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, title, content, source, agentId, severity, tags, pipelineRunId, projectId } = body;

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Invalid or missing category" }, { status: 400 });
    }
    if (!title || !content || !source) {
      return NextResponse.json({ error: "title, content, source are required" }, { status: 400 });
    }

    const entryData = {
      title,
      content,
      source,
      agentId: agentId || undefined,
      severity: severity || "medium",
      tags: tags || [],
      pipelineRunId: pipelineRunId || undefined,
    };

    if (projectId) {
      const entry = await addProjectEntry(projectId, category, entryData);
      return NextResponse.json({ data: entry, projectId, layer: "project" }, { status: 201 });
    }

    const entry = await addEntry(category, entryData);
    return NextResponse.json({ data: entry, layer: "global" }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

// Helper: search within a specific project's KB
async function searchProjectKB(projectId: string, query: string, categories?: KBCategory[]) {
  const results = await searchAllProjects(query, categories);
  return results.filter((r) => r.projectId === projectId).map((r) => r.entry);
}
