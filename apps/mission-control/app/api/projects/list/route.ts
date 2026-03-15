import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const PROJECTS_DIR = path.join(process.cwd(), "projects");

export async function GET() {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects = entries
      .filter((e) => e.isDirectory() && e.name !== "_default")
      .map((e) => e.name);

    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ projects: [] });
  }
}
