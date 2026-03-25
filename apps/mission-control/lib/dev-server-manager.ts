/**
 * Dev Server Manager
 *
 * Spawns/stops dev servers for projects.
 * Tracks PIDs, monitors health, streams logs.
 */

import { spawn, type ChildProcess } from "child_process";
import { setProjectPid } from "@/lib/project-discovery";

interface ServerInstance {
  projectId: string;
  port: number;
  process: ChildProcess;
  pid: number;
  logs: string[];
  startedAt: string;
  status: "starting" | "running" | "stopped" | "crashed";
}

const MAX_LOGS = 200;
const servers = new Map<string, ServerInstance>();

export function getServerInstance(projectId: string): ServerInstance | undefined {
  return servers.get(projectId);
}

export function getAllServers(): ServerInstance[] {
  return [...servers.values()];
}

export async function startDevServer(
  projectId: string,
  projectPath: string,
  port: number,
  devCommand: string = "npm run dev",
): Promise<{ pid: number; port: number }> {
  // Already running?
  const existing = servers.get(projectId);
  if (existing && existing.status === "running") {
    return { pid: existing.pid, port: existing.port };
  }

  // pnpm monorepo fix: ALWAYS use local node_modules/.bin/{binary} directly
  // npm/pnpm create broken junction symlinks on Windows — direct binary is the only reliable method
  const path = require("path");
  const fs = require("fs");
  const localBinDir = path.join(projectPath, "node_modules", ".bin");

  // Detect the framework binary from package.json dependencies
  const pkgPath = path.join(projectPath, "package.json");
  let detectedBinary: string | null = null;
  let detectedArgs: string[] = [];

  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

    if (allDeps["next"]) {
      detectedBinary = "next";
      // Check if package.json scripts.dev has --turbopack
      const devScript = pkg.scripts?.dev || "";
      detectedArgs = devScript.includes("turbopack") ? ["dev", "--turbopack"] : ["dev"];
    } else if (allDeps["vite"]) {
      detectedBinary = "vite";
      detectedArgs = [];
    } else if (allDeps["tsx"]) {
      detectedBinary = "tsx";
      // For CLI tools, use the main/bin entry
      const mainEntry = pkg.main || pkg.bin?.[Object.keys(pkg.bin || {})[0]] || "src/index.ts";
      detectedArgs = [mainEntry];
    }
  } catch { /* fallback below */ }

  let finalCommand: string;

  if (detectedBinary) {
    const localBin = path.join(localBinDir, detectedBinary);
    if (fs.existsSync(localBin)) {
      // Use direct binary path — proven reliable on Windows pnpm monorepo
      const portFlag = detectedBinary === "vite" ? `--port ${port}` : `-p ${port}`;
      // tsx (CLI) doesn't need a port flag
      const portArg = detectedBinary === "tsx" ? "" : ` ${portFlag}`;
      finalCommand = `"${localBin}" ${detectedArgs.join(" ")}${portArg}`;
    } else {
      // Binary not installed — fallback to devCommand
      finalCommand = `${devCommand} -p ${port}`;
    }
  } else {
    // Unknown framework — use provided devCommand with port
    const hasPort = /-p\s+\d+|--port\s+\d+/.test(devCommand);
    finalCommand = hasPort
      ? devCommand.replace(/-p\s+\d+|--port\s+\d+/, `-p ${port}`)
      : `${devCommand} -p ${port}`;
  }

  const child = spawn(finalCommand, [], {
    cwd: projectPath,
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
    env: { ...process.env, PORT: String(port) },
  });

  const instance: ServerInstance = {
    projectId,
    port,
    process: child,
    pid: child.pid || 0,
    logs: [],
    startedAt: new Date().toISOString(),
    status: "starting",
  };

  // Capture stdout
  child.stdout?.on("data", (data: Buffer) => {
    const line = data.toString().trim();
    if (line) {
      instance.logs.push(`[out] ${line}`);
      if (instance.logs.length > MAX_LOGS) instance.logs.shift();
      // Detect when server is ready
      if (line.includes("Ready") || line.includes("ready") || line.includes("localhost:")) {
        instance.status = "running";
      }
    }
  });

  // Capture stderr
  child.stderr?.on("data", (data: Buffer) => {
    const line = data.toString().trim();
    if (line) {
      instance.logs.push(`[err] ${line}`);
      if (instance.logs.length > MAX_LOGS) instance.logs.shift();
    }
  });

  // Handle exit
  child.on("exit", (code) => {
    instance.status = code === 0 ? "stopped" : "crashed";
    instance.logs.push(`[sys] Process exited with code ${code}`);
    setProjectPid(projectId, undefined).catch(() => {});
  });

  child.on("error", (err) => {
    instance.status = "crashed";
    instance.logs.push(`[sys] Error: ${err.message}`);
    setProjectPid(projectId, undefined).catch(() => {});
  });

  servers.set(projectId, instance);
  await setProjectPid(projectId, child.pid || 0);

  // Wait briefly for startup
  await new Promise((r) => setTimeout(r, 2000));
  if (instance.status === "starting") instance.status = "running";

  return { pid: child.pid || 0, port };
}

export async function stopDevServer(projectId: string): Promise<boolean> {
  const instance = servers.get(projectId);
  if (!instance) return false;

  try {
    instance.process.kill("SIGTERM");
    instance.status = "stopped";
    servers.delete(projectId);
    await setProjectPid(projectId, undefined);
    return true;
  } catch {
    return false;
  }
}

export function getServerLogs(projectId: string, limit: number = 50): string[] {
  const instance = servers.get(projectId);
  if (!instance) return [];
  return instance.logs.slice(-limit);
}

export function getServerStatus(projectId: string): ServerInstance["status"] | "not_started" {
  return servers.get(projectId)?.status || "not_started";
}
