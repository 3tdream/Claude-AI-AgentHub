import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

let cachedPkg: { name: string; version: string } | null = null;

async function getPackageInfo() {
  if (cachedPkg) return cachedPkg;
  try {
    const raw = await fs.readFile(path.join(process.cwd(), "package.json"), "utf-8");
    const pkg = JSON.parse(raw);
    cachedPkg = { name: pkg.name || "mission-control", version: pkg.version || "0.0.0" };
  } catch {
    cachedPkg = { name: "mission-control", version: "0.0.0" };
  }
  return cachedPkg;
}

function getGitHash(): string {
  if (process.env.GIT_HASH) return process.env.GIT_HASH;
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "dev";
  }
}

function getBuildTime(): string {
  return process.env.BUILD_TIME || new Date().toISOString();
}

/**
 * GET /api/system/version
 */
export async function GET() {
  const pkg = await getPackageInfo();

  return NextResponse.json({
    ok: true,
    app: pkg.name,
    version: pkg.version,
    gitHash: getGitHash(),
    buildTime: getBuildTime(),
    nodeVersion: process.version,
  });
}
