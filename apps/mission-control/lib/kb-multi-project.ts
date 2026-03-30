/**
 * Multi-Project Knowledge Base
 *
 * Two-layer KB:
 * - Global: data/knowledge-base/*.json — shared across all projects
 * - Project: projects/{projectId}/knowledge-base/*.json — project-specific
 *
 * Pipeline receives merged (project + global) entries.
 * "Promote to Global" copies project entry into real global KB files.
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { KBCategory, KBEntry, KBFile, KBIndex, KBEntryWithLayer } from "@/types";
import { addEntry as addGlobalEntry, readKBFile as readGlobalKBFile } from "@/lib/kb-storage";

const PROJECT_ROOT = process.cwd();
const PROJECTS_DIR = path.join(PROJECT_ROOT, "projects");
const STALE_THRESHOLD_DAYS = 7;

// ── Helpers ──────────────────────────────────────────

function projectKBDir(projectId: string): string {
  return path.join(PROJECTS_DIR, projectId, "knowledge-base");
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

function computeHash(entries: KBEntry[]): string {
  return crypto.createHash("sha256").update(JSON.stringify(entries)).digest("hex");
}

function isStale(lastUpdated: string): boolean {
  return Date.now() - new Date(lastUpdated).getTime() > STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function generateId(): string {
  return `kb-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

// ── Project Discovery ────────────────────────────────

export async function listProjects(): Promise<string[]> {
  const projects: string[] = [];
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith("_")) {
        // Check if this project has a knowledge-base dir
        try {
          await fs.access(path.join(PROJECTS_DIR, entry.name, "knowledge-base"));
          projects.push(entry.name);
        } catch { /* no KB dir — skip */ }
      }
    }
  } catch { /* projects dir doesn't exist */ }
  return projects;
}

// ── Read ─────────────────────────────────────────────

export async function readProjectKBFile(projectId: string, category: KBCategory): Promise<KBFile | null> {
  try {
    const raw = await fs.readFile(path.join(projectKBDir(projectId), `${category}.json`), "utf-8");
    return JSON.parse(raw) as KBFile;
  } catch {
    return null;
  }
}

export async function getProjectCategories(projectId: string): Promise<KBCategory[]> {
  try {
    const dir = projectKBDir(projectId);
    const files = await fs.readdir(dir);
    return files
      .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
      .map((f) => f.replace(".json", "") as KBCategory);
  } catch {
    return [];
  }
}

/** Get all entries from a project, across all categories */
export async function readAllProjectEntries(projectId: string): Promise<KBEntry[]> {
  const cats = await getProjectCategories(projectId);
  const entries: KBEntry[] = [];
  for (const cat of cats) {
    const file = await readProjectKBFile(projectId, cat);
    if (file) entries.push(...file.entries);
  }
  return entries;
}

/** Get merged project + global entries for a category */
export async function readMergedKB(projectId: string, category: KBCategory): Promise<KBEntryWithLayer[]> {
  const results: KBEntryWithLayer[] = [];

  // Project entries first (higher priority)
  const projectFile = await readProjectKBFile(projectId, category);
  if (projectFile) {
    results.push(...projectFile.entries.map((e) => ({ ...e, _layer: "project" as const })));
  }

  // Global entries
  const globalFile = await readGlobalKBFile(category);
  if (globalFile) {
    const projectIds = new Set(results.map((e) => e.id));
    for (const entry of globalFile.entries) {
      if (!projectIds.has(entry.id)) {
        results.push({ ...entry, _layer: "global" as const });
      }
    }
  }

  return results;
}

/** Get all merged entries across all categories */
export async function readAllMergedEntries(projectId: string): Promise<KBEntryWithLayer[]> {
  const categories: KBCategory[] = ["failure-patterns", "success-patterns", "security-playbook", "architecture-patterns", "tech-decisions"];
  const results: KBEntryWithLayer[] = [];
  for (const cat of categories) {
    results.push(...await readMergedKB(projectId, cat));
  }
  return results;
}

// ── Write ────────────────────────────────────────────

export async function addProjectEntry(
  projectId: string,
  category: KBCategory,
  entry: Omit<KBEntry, "id" | "createdAt" | "updatedAt" | "version">,
): Promise<KBEntry> {
  const dir = projectKBDir(projectId);
  await ensureDir(dir);
  const filePath = path.join(dir, `${category}.json`);

  const now = new Date().toISOString();
  const newEntry: KBEntry = { ...entry, id: generateId(), projectId, createdAt: now, updatedAt: now, version: 1 };

  let file: KBFile;
  try {
    file = JSON.parse(await fs.readFile(filePath, "utf-8"));
    file.entries.push(newEntry);
  } catch {
    file = { category, description: `${category} for ${projectId}`, entries: [newEntry], contentHash: "", lastUpdated: now, schemaVersion: 1 };
  }

  file.contentHash = computeHash(file.entries);
  file.lastUpdated = now;
  await fs.writeFile(filePath, JSON.stringify(file, null, 2), "utf-8");
  return newEntry;
}

export async function updateProjectEntry(
  projectId: string,
  category: KBCategory,
  entryId: string,
  updates: Partial<Pick<KBEntry, "title" | "content" | "severity" | "tags" | "confidence">>,
): Promise<KBEntry | null> {
  const dir = projectKBDir(projectId);
  const filePath = path.join(dir, `${category}.json`);

  let file: KBFile;
  try {
    file = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    return null;
  }

  const idx = file.entries.findIndex((e) => e.id === entryId);
  if (idx === -1) return null;

  file.entries[idx] = {
    ...file.entries[idx],
    ...updates,
    updatedAt: new Date().toISOString(),
    version: file.entries[idx].version + 1,
  };

  file.contentHash = computeHash(file.entries);
  file.lastUpdated = new Date().toISOString();
  await fs.writeFile(filePath, JSON.stringify(file, null, 2), "utf-8");
  return file.entries[idx];
}

export async function deleteProjectEntry(
  projectId: string,
  category: KBCategory,
  entryId: string,
): Promise<boolean> {
  const dir = projectKBDir(projectId);
  const filePath = path.join(dir, `${category}.json`);

  let file: KBFile;
  try {
    file = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    return false;
  }

  const before = file.entries.length;
  file.entries = file.entries.filter((e) => e.id !== entryId);
  if (file.entries.length === before) return false;

  file.contentHash = computeHash(file.entries);
  file.lastUpdated = new Date().toISOString();
  await fs.writeFile(filePath, JSON.stringify(file, null, 2), "utf-8");
  return true;
}

// ── Cross-Project Search ─────────────────────────────

export async function searchAllProjects(
  query: string,
  categories?: KBCategory[],
): Promise<{ projectId: string; entry: KBEntry }[]> {
  const projects = await listProjects();
  const q = query.toLowerCase();
  const results: { projectId: string; entry: KBEntry }[] = [];

  for (const projectId of projects) {
    const cats = categories || await getProjectCategories(projectId);
    for (const cat of cats) {
      const file = await readProjectKBFile(projectId, cat);
      if (!file) continue;
      for (const entry of file.entries) {
        if (
          entry.title.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q) ||
          entry.tags.some((t) => t.toLowerCase().includes(q))
        ) {
          results.push({ projectId, entry });
        }
      }
    }
  }

  return results.sort((a, b) => new Date(b.entry.updatedAt).getTime() - new Date(a.entry.updatedAt).getTime());
}

// ── Promote to Global ────────────────────────────────

export async function promoteToGlobal(projectId: string, entryId: string, category: KBCategory): Promise<KBEntry | null> {
  const file = await readProjectKBFile(projectId, category);
  if (!file) return null;

  const entry = file.entries.find((e) => e.id === entryId);
  if (!entry) return null;

  // Write directly to global KB using kb-storage.ts addEntry
  return addGlobalEntry(category, {
    title: entry.title,
    content: entry.content,
    source: entry.source,
    agentId: entry.agentId,
    severity: entry.severity,
    tags: [...entry.tags, `promoted-from:${projectId}`],
    pipelineRunId: entry.pipelineRunId,
    confidence: entry.confidence,
    promotedFrom: { projectId, originalId: entryId, promotedAt: new Date().toISOString() },
  });
}

// ── Validate All Projects ────────────────────────────

export async function validateAllProjects(): Promise<{
  projects: { projectId: string; index: KBIndex }[];
  totalEntries: number;
  integrityOk: boolean;
}> {
  const projects = await listProjects();
  const results: { projectId: string; index: KBIndex }[] = [];
  let totalEntries = 0;
  let allOk = true;

  for (const projectId of projects) {
    const cats = await getProjectCategories(projectId);
    let projectOk = true;
    const categories = await Promise.all(
      cats.map(async (cat) => {
        const file = await readProjectKBFile(projectId, cat);
        if (!file) return { category: cat, description: "", entryCount: 0, contentHash: "", lastUpdated: "", stale: true };
        const hashOk = computeHash(file.entries) === file.contentHash;
        if (!hashOk) { projectOk = false; allOk = false; }
        totalEntries += file.entries.length;
        return {
          category: cat,
          description: file.description,
          entryCount: file.entries.length,
          contentHash: file.contentHash,
          lastUpdated: file.lastUpdated,
          stale: isStale(file.lastUpdated),
        };
      }),
    );

    results.push({
      projectId,
      index: {
        categories,
        totalEntries: categories.reduce((s, c) => s + c.entryCount, 0),
        lastValidated: new Date().toISOString(),
        integrityOk: projectOk,
      },
    });
  }

  return { projects: results, totalEntries, integrityOk: allOk };
}
