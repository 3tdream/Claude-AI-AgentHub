import { NextRequest, NextResponse } from "next/server";
import { startDevServer, stopDevServer, getServerLogs, getServerStatus, getAllServers } from "@/lib/dev-server-manager";

/** GET /api/projects/server?projectId=X — get server status/logs */
export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");

  if (projectId) {
    const status = getServerStatus(projectId);
    const logs = getServerLogs(projectId, 50);
    return NextResponse.json({ projectId, status, logs });
  }

  // List all running servers
  const servers = getAllServers().map((s) => ({
    projectId: s.projectId,
    port: s.port,
    pid: s.pid,
    status: s.status,
    startedAt: s.startedAt,
    logCount: s.logs.length,
  }));
  return NextResponse.json({ data: servers });
}

/** POST /api/projects/server — start dev server */
export async function POST(req: NextRequest) {
  try {
    const { projectId, projectPath, port, devCommand } = await req.json();
    if (!projectId || !projectPath || !port) {
      return NextResponse.json({ error: "projectId, projectPath, port required" }, { status: 400 });
    }
    const result = await startDevServer(projectId, projectPath, port, devCommand);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** DELETE /api/projects/server — stop dev server */
export async function DELETE(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId required" }, { status: 400 });

  const stopped = await stopDevServer(projectId);
  return NextResponse.json({ success: stopped, projectId });
}
