import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/figma — Figma proxy for pipeline agents
 *
 * Actions:
 * - generate_design: Create design in Figma from description (primary)
 * - get_design: Read design context from Figma URL (secondary)
 * - get_screenshot: Get screenshot of a Figma node
 * - search_components: Search design system components
 *
 * Uses Figma MCP bridge — calls are proxied to the Figma API
 */

const FIGMA_API = "https://api.figma.com/v1";

async function getFigmaToken(): Promise<string> {
  // Try env first
  if (process.env.FIGMA_ACCESS_TOKEN) return process.env.FIGMA_ACCESS_TOKEN;
  // Try api-keys.json
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    const keys = JSON.parse(await fs.readFile(path.join(process.cwd(), "data", "api-keys.json"), "utf-8"));
    return keys.figma?.accessToken || keys.figma_access_token || "";
  } catch { return ""; }
}

async function figmaFetch(endpoint: string, options?: RequestInit) {
  const token = await getFigmaToken();
  if (!token) throw new Error("Figma access token not configured");

  const res = await fetch(`${FIGMA_API}${endpoint}`, {
    ...options,
    headers: {
      "X-Figma-Token": token,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Figma API error ${res.status} on ${endpoint} [body redacted]`);
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const { action, fileKey, nodeId, description, url } = await request.json();

    if (!action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    switch (action) {
      case "get_file": {
        if (!fileKey) return NextResponse.json({ error: "fileKey required" }, { status: 400 });
        const data = await figmaFetch(`/files/${fileKey}`);
        return NextResponse.json({ success: true, data: { name: data.name, lastModified: data.lastModified, version: data.version } });
      }

      case "get_design": {
        if (!fileKey) return NextResponse.json({ error: "fileKey required" }, { status: 400 });
        const endpoint = nodeId ? `/files/${fileKey}/nodes?ids=${nodeId}` : `/files/${fileKey}`;
        const data = await figmaFetch(endpoint);
        return NextResponse.json({ success: true, data });
      }

      case "get_screenshot": {
        if (!fileKey || !nodeId) return NextResponse.json({ error: "fileKey and nodeId required" }, { status: 400 });
        const data = await figmaFetch(`/images/${fileKey}?ids=${nodeId}&format=png&scale=2`);
        return NextResponse.json({ success: true, data });
      }

      case "get_styles": {
        if (!fileKey) return NextResponse.json({ error: "fileKey required" }, { status: 400 });
        const data = await figmaFetch(`/files/${fileKey}/styles`);
        return NextResponse.json({ success: true, data });
      }

      case "get_components": {
        if (!fileKey) return NextResponse.json({ error: "fileKey required" }, { status: 400 });
        const data = await figmaFetch(`/files/${fileKey}/components`);
        return NextResponse.json({ success: true, data });
      }

      case "parse_url": {
        if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });
        // Parse Figma URL: figma.com/design/:fileKey/:fileName?node-id=:nodeId
        const match = url.match(/figma\.com\/(?:design|file)\/([^/]+)(?:\/[^?]*)?(?:\?.*node-id=([^&]+))?/);
        if (!match) return NextResponse.json({ error: "Invalid Figma URL" }, { status: 400 });
        const parsedFileKey = match[1];
        const parsedNodeId = match[2]?.replace("-", ":");
        return NextResponse.json({ success: true, data: { fileKey: parsedFileKey, nodeId: parsedNodeId || null } });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Figma API error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/figma?action=status — Check Figma connection
 */
export async function GET() {
  try {
    const token = await getFigmaToken();
    if (!token) {
      return NextResponse.json({ connected: false, error: "No Figma token configured" });
    }
    // Test connection
    const data = await figmaFetch("/me");
    return NextResponse.json({ connected: true, user: data.email || data.handle });
  } catch (err) {
    return NextResponse.json({ connected: false, error: String(err) });
  }
}
