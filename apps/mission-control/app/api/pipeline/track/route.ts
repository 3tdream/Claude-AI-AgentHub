/**
 * POST /api/pipeline/track
 * Auto-create a Jira issue for every pipeline/direct run.
 * Body: { input: string, mode: "direct" | "pipeline", projectId?: string }
 * Returns: { jiraKey, jiraUrl } or { jiraKey: null } if Jira not configured.
 */
import { NextRequest, NextResponse } from "next/server";
import { hasJiraConfig, getJiraConfig } from "@/lib/jira/config";
import { createIssue } from "@/lib/jira/client";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { input, mode, projectId } = body as {
    input: string;
    mode: "direct" | "pipeline";
    projectId?: string;
  };

  if (!input) {
    return NextResponse.json({ error: "input required" }, { status: 400 });
  }

  // If Jira not configured, return null — run proceeds without tracking
  const configured = await hasJiraConfig();
  if (!configured) {
    return NextResponse.json({ jiraKey: null, jiraUrl: null });
  }

  try {
    const config = await getJiraConfig();
    const projectKey = config.defaultProjectKey;
    if (!projectKey) {
      return NextResponse.json({ jiraKey: null, jiraUrl: null, reason: "no defaultProjectKey" });
    }

    // Truncate summary to 255 chars (Jira limit)
    const summary = input.length > 250 ? input.slice(0, 247) + "..." : input;
    const labels = [
      mode === "direct" ? "mc-direct" : "mc-pipeline",
      ...(projectId ? [`project-${projectId}`] : []),
    ];

    const issue = await createIssue({
      fields: {
        project: { key: projectKey },
        summary,
        issuetype: { name: "Task" },
        labels,
      },
    });

    const jiraKey = issue.key;
    const jiraUrl = `${config.baseUrl}/browse/${jiraKey}`;

    return NextResponse.json({ jiraKey, jiraUrl });
  } catch (err) {
    console.error("[pipeline/track] Jira create failed:", err);
    // Non-fatal — run continues without Jira tracking
    return NextResponse.json({ jiraKey: null, jiraUrl: null, error: String(err) });
  }
}
