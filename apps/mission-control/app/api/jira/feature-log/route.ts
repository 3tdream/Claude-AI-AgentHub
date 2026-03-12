import { NextResponse } from "next/server";
import { getJiraConfig, hasJiraConfig } from "@/lib/jira/config";
import { createIssue } from "@/lib/jira/client";
import { addLog } from "@/lib/logs-storage";

export interface FeatureCompletionPayload {
  feature_name: string;
  files_changed: string[];
  routes_affected: string[];
  stores_affected: string[];
  dual_chat_touched: boolean;
  offline_fallback_touched: boolean;
  summary: string;
}

function buildDescription(payload: FeatureCompletionPayload): string {
  const sections: string[] = [];

  sections.push(payload.summary);
  sections.push("");

  if (payload.files_changed.length > 0) {
    sections.push("*Files changed:*");
    payload.files_changed.forEach((f) => sections.push(`- ${f}`));
    sections.push("");
  }

  if (payload.routes_affected.length > 0) {
    sections.push("*Routes affected:*");
    payload.routes_affected.forEach((r) => sections.push(`- ${r}`));
    sections.push("");
  }

  if (payload.stores_affected.length > 0) {
    sections.push("*Stores affected:*");
    payload.stores_affected.forEach((s) => sections.push(`- ${s}`));
    sections.push("");
  }

  const flags: string[] = [];
  if (payload.dual_chat_touched) flags.push("Dual Chat Source");
  if (payload.offline_fallback_touched) flags.push("Offline Fallback");
  if (flags.length > 0) {
    sections.push(`*Critical paths touched:* ${flags.join(", ")}`);
  }

  return sections.join("\n");
}

function toADF(text: string) {
  return {
    type: "doc",
    version: 1,
    content: text.split("\n\n").filter(Boolean).map((block) => {
      // Check if it's a list block
      const lines = block.split("\n");
      const isList = lines.every((l) => l.startsWith("- ") || l.startsWith("*") || l === "");

      if (isList && lines.some((l) => l.startsWith("- "))) {
        const heading = lines.find((l) => l.startsWith("*") && l.endsWith("*"));
        const items = lines.filter((l) => l.startsWith("- "));
        const content = [];

        if (heading) {
          content.push({
            type: "paragraph",
            content: [{
              type: "text",
              text: heading.replace(/\*/g, ""),
              marks: [{ type: "strong" }],
            }],
          });
        }

        content.push({
          type: "bulletList",
          content: items.map((item) => ({
            type: "listItem",
            content: [{
              type: "paragraph",
              content: [{ type: "text", text: item.slice(2) }],
            }],
          })),
        });

        return content;
      }

      // Plain paragraph (handle bold markers)
      const parts = block.replace(/\n/g, " ").split(/(\*[^*]+\*)/);
      return {
        type: "paragraph",
        content: parts.filter(Boolean).map((part) => {
          if (part.startsWith("*") && part.endsWith("*")) {
            return { type: "text", text: part.replace(/\*/g, ""), marks: [{ type: "strong" }] };
          }
          return { type: "text", text: part };
        }),
      };
    }).flat(),
  };
}

export async function POST(request: Request) {
  try {
    const configured = await hasJiraConfig();
    if (!configured) {
      return NextResponse.json(
        { error: "Jira is not configured. Go to /jira/settings first." },
        { status: 400 },
      );
    }

    const config = await getJiraConfig();
    if (!config.defaultProjectKey) {
      return NextResponse.json(
        { error: "No default project key set. Add one in /jira/settings." },
        { status: 400 },
      );
    }

    const payload: FeatureCompletionPayload = await request.json();

    if (!payload.feature_name || !payload.summary) {
      return NextResponse.json(
        { error: "feature_name and summary are required" },
        { status: 400 },
      );
    }

    const description = buildDescription(payload);

    const issue = await createIssue({
      fields: {
        project: { key: config.defaultProjectKey },
        summary: `[AI-Built] ${payload.feature_name}`,
        description: toADF(description),
        issuetype: { name: "Task" },
        labels: ["ai-generated", "auto-logged"],
      },
    });

    // Log to data/logs.json
    await addLog({
      type: "decision",
      agentName: "PM Agent",
      content: `Feature "${payload.feature_name}" logged to Jira: ${issue.key}`,
      metadata: {
        jiraKey: issue.key,
        filesChanged: payload.files_changed.length,
        routesAffected: payload.routes_affected,
      },
    });

    return NextResponse.json({
      success: true,
      issue: {
        key: issue.key,
        url: `${config.baseUrl}/browse/${issue.key}`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create feature log";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
