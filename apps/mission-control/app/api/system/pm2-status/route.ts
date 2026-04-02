import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { stdout } = await execAsync("npx pm2 jlist", { timeout: 5000 });
    const processes = JSON.parse(stdout);

    const mc = processes.find((p: any) => p.name === "mission-control");
    if (!mc) {
      return NextResponse.json({
        managed: false,
        status: "not-managed",
        pid: null,
        cpu: 0,
        memoryMB: 0,
        uptimeHuman: "—",
        restarts: 0,
      });
    }

    const uptimeMs = Date.now() - mc.pm2_env.pm_uptime;
    const hours = Math.floor(uptimeMs / 3600000);
    const mins = Math.floor((uptimeMs % 3600000) / 60000);

    return NextResponse.json({
      managed: true,
      status: mc.pm2_env.status,
      pid: mc.pid,
      cpu: mc.monit?.cpu || 0,
      memoryMB: Math.round((mc.monit?.memory || 0) / 1024 / 1024),
      uptimeHuman: `${hours}h ${mins}m`,
      restarts: mc.pm2_env.restart_time || 0,
    });
  } catch {
    return NextResponse.json({
      managed: false,
      status: "unknown",
      pid: null,
      cpu: 0,
      memoryMB: 0,
      uptimeHuman: "—",
      restarts: 0,
    });
  }
}
