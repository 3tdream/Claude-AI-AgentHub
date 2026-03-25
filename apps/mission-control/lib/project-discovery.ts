/**
 * Project Discovery Service
 *
 * Scans apps/ directory for projects. Two-level detection:
 * 1. mission-control.json manifest → full info (port, stack, kb_scope)
 * 2. package.json fallback → auto-detect name, stack, framework
 *
 * Also manages port allocation and active project state.
 */

import { promises as fs } from "fs";
import path from "path";

const APPS_DIR = path.resolve(process.cwd(), "..");
const DATA_DIR = path.join(process.cwd(), "data");
const ACTIVE_FILE = path.join(DATA_DIR, "active-projects.json");
const BASE_PORT = 3010;
const MC_PORT = 3077;

// ── Types ────────────────────────────────────────────

export interface ProjectManifest {
  id: string;
  name: string;
  port?: number;
  stack?: string[];
  entrypoint?: string;
  kb_scope?: string[];
  devCommand?: string;
  status?: "active" | "inactive";
}

export interface DiscoveredProject {
  id: string;
  name: string;
  path: string;
  port: number;
  stack: string[];
  framework: string;
  hasManifest: boolean;
  hasPackageJson: boolean;
  entrypoint: string;
  devCommand: string;
  kbScope: string[];
  fileCount: number;
  status: "active" | "inactive";
  /** Dev server running? */
  running: boolean;
  pid?: number;
}

interface ActiveProjectsData {
  projects: Record<string, {
    active: boolean;
    port: number;
    pid?: number;
    startedAt?: string;
  }>;
  lastUpdated: string;
}

// ── Framework Detection ──────────────────────────────

interface PkgJson {
  name?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Extract port number from dev script if hardcoded (e.g., "next dev -p 4024") */
function detectScriptPort(pkg: PkgJson): number | null {
  const devScript = pkg.scripts?.dev || "";
  const match = devScript.match(/-p\s+(\d+)|--port\s+(\d+)/);
  if (match) return parseInt(match[1] || match[2]);
  return null;
}

function detectFramework(pkg: PkgJson): { framework: string; stack: string[]; devCommand: string } {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const stack: string[] = [];
  let framework = "unknown";
  let devCommand = "npm run dev";

  if (deps["next"]) {
    framework = "nextjs";
    stack.push("nextjs");
    // Prefer dev:web if exists (for dual CLI+web projects like secretutka)
    if (pkg.scripts?.["dev:web"]) {
      devCommand = "npm run dev:web";
    }
  }
  else if (deps["vite"]) { framework = "vite"; stack.push("vite"); devCommand = "npm run dev"; }
  else if (deps["express"]) { framework = "express"; stack.push("express"); devCommand = "npm start"; }
  else if (deps["flask"]) { framework = "flask"; stack.push("flask"); devCommand = "python app.py"; }
  else if (pkg.scripts?.dev) { framework = "node"; }

  if (deps["react"]) stack.push("react");
  if (deps["tailwindcss"] || deps["@tailwindcss/vite"]) stack.push("tailwind");
  if (deps["prisma"] || deps["@prisma/client"]) stack.push("prisma");
  if (deps["mongoose"] || deps["mongodb"]) stack.push("mongodb");
  if (deps["pg"]) stack.push("postgres");
  if (deps["three"] || deps["@react-three/fiber"]) stack.push("threejs");
  if (deps["openai"]) stack.push("openai");
  if (deps["@anthropic-ai/sdk"]) stack.push("anthropic");

  return { framework, stack, devCommand };
}

function detectEntrypoint(framework: string): string {
  switch (framework) {
    case "nextjs": return "app/page.tsx";
    case "vite": return "src/App.tsx";
    case "express": return "src/index.ts";
    default: return "index.ts";
  }
}

// ── File Counter ─────────────────────────────────────

async function countFiles(dir: string, max: number = 500): Promise<number> {
  let count = 0;
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (count >= max) break;
      if (entry.name.startsWith(".") || entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist") continue;
      if (entry.isFile()) count++;
      else if (entry.isDirectory()) count += await countFiles(path.join(dir, entry.name), max - count);
    }
  } catch { /* permission error */ }
  return count;
}

// ── Active Projects State ────────────────────────────

async function loadActiveState(): Promise<ActiveProjectsData> {
  try {
    const raw = await fs.readFile(ACTIVE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    // Migrate from old array format to new object format
    if (Array.isArray(parsed)) {
      const migrated: ActiveProjectsData = { projects: {}, lastUpdated: new Date().toISOString() };
      for (const id of parsed) {
        migrated.projects[id] = { active: true, port: 0 };
      }
      await saveActiveState(migrated);
      return migrated;
    }
    if (!parsed.projects) return { projects: {}, lastUpdated: new Date().toISOString() };
    return parsed;
  } catch {
    return { projects: {}, lastUpdated: new Date().toISOString() };
  }
}

async function saveActiveState(data: ActiveProjectsData) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  data.lastUpdated = new Date().toISOString();
  await fs.writeFile(ACTIVE_FILE, JSON.stringify(data, null, 2), "utf-8");
}

// ── Port Allocation ──────────────────────────────────

const portCache = new Map<string, number>();

function allocatePort(projectId: string, activeState: ActiveProjectsData, allProjects: string[]): number {
  // Check if port already assigned in state
  const existing = activeState.projects[projectId];
  if (existing?.port && existing.port > 0) return existing.port;

  // Check cache
  if (portCache.has(projectId)) return portCache.get(projectId)!;

  // Collect used ports
  const usedPorts = new Set([MC_PORT]);
  for (const p of Object.values(activeState.projects)) {
    if (p.port && p.port > 0) usedPorts.add(p.port);
  }
  for (const p of portCache.values()) usedPorts.add(p);

  // Find next available
  let port = BASE_PORT;
  while (usedPorts.has(port)) port++;
  portCache.set(projectId, port);
  return port;
}

// ── Discovery ────────────────────────────────────────

export async function discoverProjects(): Promise<DiscoveredProject[]> {
  const projects: DiscoveredProject[] = [];
  const activeState = await loadActiveState();

  let entries: string[];
  try {
    const dirEntries = await fs.readdir(APPS_DIR, { withFileTypes: true });
    entries = dirEntries.filter((e) => e.isDirectory() && !e.name.startsWith(".")).map((e) => e.name);
  } catch {
    return [];
  }

  for (const dirName of entries) {
    const projectPath = path.join(APPS_DIR, dirName);

    // Skip mission-control itself
    if (dirName === "mission-control") continue;

    // Try manifest first
    let manifest: ProjectManifest | null = null;
    try {
      const raw = await fs.readFile(path.join(projectPath, "mission-control.json"), "utf-8");
      manifest = JSON.parse(raw);
    } catch { /* no manifest */ }

    // Try package.json
    let pkg: PkgJson | null = null;
    try {
      const raw = await fs.readFile(path.join(projectPath, "package.json"), "utf-8");
      pkg = JSON.parse(raw);
    } catch { /* no package.json */ }

    // Skip if neither exists
    if (!manifest && !pkg) continue;

    const id = manifest?.id || dirName;
    const { framework, stack, devCommand } = pkg ? detectFramework(pkg) : { framework: "unknown", stack: [] as string[], devCommand: "npm run dev" };
    const scriptPort = pkg ? detectScriptPort(pkg) : null;
    const port = manifest?.port || scriptPort || allocatePort(id, activeState, entries);
    const active = activeState.projects[id]?.active || false;
    const pid = activeState.projects[id]?.pid;

    // Quick file count — only top 2 levels to avoid slow scans
    let fileCount = 0;
    try {
      const topFiles = await fs.readdir(projectPath);
      fileCount = topFiles.filter((f) => !f.startsWith(".") && f !== "node_modules" && f !== ".next").length;
    } catch { /* skip */ }

    projects.push({
      id,
      name: manifest?.name || pkg?.name || dirName,
      path: projectPath,
      port,
      stack: manifest?.stack || stack,
      framework,
      hasManifest: !!manifest,
      hasPackageJson: !!pkg,
      entrypoint: manifest?.entrypoint || detectEntrypoint(framework),
      devCommand: manifest?.devCommand || (pkg?.scripts?.dev ? "npm run dev" : devCommand),
      kbScope: manifest?.kb_scope || ["global", id],
      fileCount,
      status: active ? "active" : "inactive",
      running: !!pid,
      pid: pid || undefined,
    });
  }

  return projects.sort((a, b) => {
    if (a.status !== b.status) return a.status === "active" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

// ── Activate/Deactivate ──────────────────────────────

export async function activateProject(projectId: string, port?: number): Promise<void> {
  const state = await loadActiveState();
  const existing = state.projects[projectId] || {};
  state.projects[projectId] = {
    ...existing,
    active: true,
    port: port || existing.port || allocatePort(projectId, state, Object.keys(state.projects)),
  };
  await saveActiveState(state);
}

export async function deactivateProject(projectId: string): Promise<void> {
  const state = await loadActiveState();
  if (state.projects[projectId]) {
    state.projects[projectId].active = false;
    state.projects[projectId].pid = undefined;
  }
  await saveActiveState(state);
}

export async function setProjectPid(projectId: string, pid: number | undefined): Promise<void> {
  const state = await loadActiveState();
  if (state.projects[projectId]) {
    state.projects[projectId].pid = pid;
    if (pid) state.projects[projectId].startedAt = new Date().toISOString();
  }
  await saveActiveState(state);
}

export async function getActiveProjects(): Promise<string[]> {
  const state = await loadActiveState();
  return Object.entries(state.projects)
    .filter(([, v]) => v.active)
    .map(([k]) => k);
}
