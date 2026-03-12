import { NextResponse } from "next/server";
import { getJiraConfig, hasJiraConfig } from "@/lib/jira/config";

export async function GET() {
  try {
    const configured = await hasJiraConfig();
    if (!configured) {
      return NextResponse.json(
        { success: false, error: "Jira is not configured" },
        { status: 400 },
      );
    }

    const config = await getJiraConfig();
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");

    const res = await fetch(`${config.baseUrl}/rest/api/3/myself`, {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const status = res.status;
      if (status === 401) {
        return NextResponse.json({ success: false, error: "Invalid credentials (401 Unauthorized)" });
      }
      if (status === 403) {
        return NextResponse.json({ success: false, error: "Access denied (403 Forbidden)" });
      }
      return NextResponse.json({ success: false, error: `Jira API error: ${status}` });
    }

    const user = await res.json();
    return NextResponse.json({
      success: true,
      user: {
        displayName: user.displayName,
        emailAddress: user.emailAddress,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Connection failed";
    return NextResponse.json({ success: false, error: message });
  }
}
