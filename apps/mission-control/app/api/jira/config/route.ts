import { NextResponse } from "next/server";
import { getJiraConfig, saveJiraConfig, hasJiraConfig } from "@/lib/jira/config";

export async function GET() {
  try {
    const configured = await hasJiraConfig();
    if (!configured) {
      return NextResponse.json({ configured: false });
    }

    const config = await getJiraConfig();
    return NextResponse.json({
      configured: true,
      baseUrl: config.baseUrl,
      email: config.email,
      defaultProjectKey: config.defaultProjectKey ?? "",
    });
  } catch {
    return NextResponse.json({ configured: false });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { baseUrl, email, apiToken, defaultProjectKey } = body;

    if (!baseUrl || !email || !apiToken) {
      return NextResponse.json(
        { error: "baseUrl, email, and apiToken are required" },
        { status: 400 },
      );
    }

    // Normalize baseUrl: remove trailing slash
    const normalizedUrl = baseUrl.replace(/\/+$/, "");

    await saveJiraConfig({
      baseUrl: normalizedUrl,
      email,
      apiToken,
      defaultProjectKey: defaultProjectKey || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save config";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
