import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { readActiveProjects } from "@/lib/active-projects-storage";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

export async function GET() {
  // Read filesystem and active projects independently — one failing shouldn't drop the other
  const [fsProjects, activeProjects] = await Promise.all([
    fs.readdir(PROJECTS_DIR, { withFileTypes: true })
      .then((entries) => entries.filter((e) => e.isDirectory() && e.name !== "_default").map((e) => e.name))
      .catch(() => [] as string[]),
    readActiveProjects(),
  ]);

  // Merge: dedupe, active projects first, then filesystem-only
  const merged = [...new Set([...activeProjects, ...fsProjects])];

  return NextResponse.json({ projects: merged, active: activeProjects });
}
