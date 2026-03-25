/**
 * Multi-Project Knowledge Base
 *
 * Extends KB storage to support multiple projects:
 * - Each project has its own KB directory: data/knowledge-base/{projectId}/
 * - Global KB at data/knowledge-base/global/ — shared across all projects
 * - Cross-project search: find patterns from any project
 * - KB sync: promote project-specific patterns to global
 *
 * Backwards compatible: existing data/knowledge-base/*.json → treated as "mission-control" project.
 */

import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { KBCategory, KBEntry, KBFile, KBIndex } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const KB_ROOT = path.join(DATA_DIR, "knowledge-base");
const GLOBAL_PROJECT = "_global";
const DEFAULT_PROJECT = "mission-control";
const STALE_THRESHOLD_DAYS = 7;

// ── Helpers ──────────────────────────────────────────

function projectKBDir(projectId: string): string {
  if (projectId === DEFAULT_PROJECT) return KB_ROOT; // Backwards compatible
  return path.join(KB_ROOT, projectId);
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
  const projects = [DEFAULT_PROJECT]; // Always include default
  try {
    const entries = await fs.readdir(KB_ROOT, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith("_")) {
        projects.push(entry.name);
      }
    }
  } catch { /* KB_ROOT doesn't exist yet */ }
  return [...new Set(projects)];
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
  const newEntry: KBEntry = { ...entry, id: generateId(), createdAt: now, updatedAt: now, version: 1 };

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

// ── Global KB (shared patterns) ──────────────────────

export async function promoteToGlobal(projectId: string, entryId: string, category: KBCategory): Promise<KBEntry | null> {
  const file = await readProjectKBFile(projectId, category);
  if (!file) return null;

  const entry = file.entries.find((e) => e.id === entryId);
  if (!entry) return null;

  // Add to global with reference to source project
  return addProjectEntry(GLOBAL_PROJECT, category, {
    title: `[${projectId}] ${entry.title}`,
    content: entry.content,
    source: `${projectId}/${entry.source}`,
    agentId: entry.agentId,
    severity: entry.severity,
    tags: [...entry.tags, `from:${projectId}`, "promoted-to-global"],
    pipelineRunId: entry.pipelineRunId,
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
  let integrityOk = true;

  for (const projectId of projects) {
    const cats = await getProjectCategories(projectId);
    const categories = await Promise.all(
      cats.map(async (cat) => {
        const file = await readProjectKBFile(projectId, cat);
        if (!file) return { category: cat, description: "", entryCount: 0, contentHash: "", lastUpdated: "", stale: true };
        const hashOk = computeHash(file.entries) === file.contentHash;
        if (!hashOk) integrityOk = false;
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
        integrityOk,
      },
    });
  }

  return { projects: results, totalEntries, integrityOk };
}
