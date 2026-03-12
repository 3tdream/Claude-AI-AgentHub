import { NextResponse } from "next/server";
import { getProjects } from "@/lib/jira/client";

export async function GET() {
  try {
    const projects = await getProjects();
    return NextResponse.json({ data: projects });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch projects";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
