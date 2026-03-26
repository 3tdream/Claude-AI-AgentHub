import { NextRequest, NextResponse } from "next/server";
import { loadProjectContext } from "@/lib/project-context-loader";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const ctx = await loadProjectContext(projectId);
  if (!ctx) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  return NextResponse.json({ data: ctx });
}
