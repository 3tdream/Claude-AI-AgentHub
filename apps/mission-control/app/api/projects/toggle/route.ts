import { NextRequest, NextResponse } from "next/server";
import { readActiveProjects, writeActiveProjects } from "@/lib/active-projects-storage";

export async function GET() {
  const active = await readActiveProjects();
  return NextResponse.json({ active });
}

export async function PATCH(req: NextRequest) {
  try {
    const { projectId, active } = await req.json();

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "projectId required" }, { status: 400 });
    }

    const current = await readActiveProjects();

    let updated: string[];
    if (active) {
      updated = current.includes(projectId) ? current : [...current, projectId];
    } else {
      updated = current.filter((id) => id !== projectId);
    }

    await writeActiveProjects(updated);

    return NextResponse.json({ success: true, active: updated });
  } catch {
    return NextResponse.json({ error: "Failed to toggle" }, { status: 500 });
  }
}
