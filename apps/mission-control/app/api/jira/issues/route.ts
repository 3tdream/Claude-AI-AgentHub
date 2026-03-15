import { NextRequest, NextResponse } from "next/server";
import { searchIssues, createIssue } from "@/lib/jira/client";
import type { CreateIssuePayload } from "@/lib/jira/types";
import { JQL_PROJECT_KEY_PATTERN } from "@/lib/config";

/** Escape user input for JQL string values */
function escapeJql(value: string): string {
  return value.replace(/[\\"]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const project = searchParams.get("project");
    const status = searchParams.get("status");
    const assignee = searchParams.get("assignee");
    const search = searchParams.get("search");
    const maxResults = Math.min(Number(searchParams.get("maxResults") || "50"), 100);

    if (!project) {
      return NextResponse.json(
        { error: "project query param is required" },
        { status: 400 },
      );
    }

    if (!JQL_PROJECT_KEY_PATTERN.test(project)) {
      return NextResponse.json(
        { error: "Invalid project key format" },
        { status: 400 },
      );
    }

    const jqlParts = [`project = "${escapeJql(project)}"`];
    if (status) jqlParts.push(`status = "${escapeJql(status)}"`);
    if (assignee) jqlParts.push(`assignee = "${escapeJql(assignee)}"`);
    if (search) jqlParts.push(`summary ~ "${escapeJql(search)}"`);
    const jql = jqlParts.join(" AND ") + " ORDER BY updated DESC";

    const result = await searchIssues(jql, maxResults);
    return NextResponse.json({ data: result });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to search issues";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateIssuePayload;

    if (!body.fields?.project?.key || !body.fields?.summary) {
      return NextResponse.json(
        { error: "project.key and summary are required" },
        { status: 400 },
      );
    }

    const issue = await createIssue(body);
    return NextResponse.json({ data: issue }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create issue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
