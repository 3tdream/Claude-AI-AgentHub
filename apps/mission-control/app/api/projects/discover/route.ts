import { NextRequest, NextResponse } from "next/server";
import { discoverProjects, activateProject, deactivateProject } from "@/lib/project-discovery";

/** GET /api/projects/discover — scan apps/ for projects */
export async function GET() {
  try {
    const projects = await discoverProjects();
    return NextResponse.json({
      data: projects,
      total: projects.length,
      active: projects.filter((p) => p.status === "active").length,
    });
  } catch (e) {
    console.error("[projects/discover] Error:", e);
    return NextResponse.json({ error: String(e), data: [], total: 0, active: 0 }, { status: 500 });
  }
}

/** PATCH /api/projects/discover — activate/deactivate project */
export async function PATCH(req: NextRequest) {
  try {
    const { projectId, active, port } = await req.json();
    if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

    if (active) {
      await activateProject(projectId, port);
    } else {
      await deactivateProject(projectId);
    }
    return NextResponse.json({ success: true, projectId, active });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
