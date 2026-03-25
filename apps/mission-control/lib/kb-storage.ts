import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import type { KBCategory, KBEntry, KBFile, KBIndex } from "@/types";

const KB_DIR = path.join(process.cwd(), "data", "knowledge-base");
const INDEX_FILE = path.join(KB_DIR, "_index.json");
const STALE_THRESHOLD_DAYS = 7;

// ── Helpers ──────────────────────────────────────────────

async function ensureKBDir() {
  await fs.mkdir(KB_DIR, { recursive: true });
}

function computeHash(entries: KBEntry[]): string {
  const raw = JSON.stringify(entries);
  return crypto.createHash("sha256").update(raw).digest("hex");
}

function categoryPath(category: KBCategory): string {
  return path.join(KB_DIR, `${category}.json`);
}

function isStale(lastUpdated: string): boolean {
  const diff = Date.now() - new Date(lastUpdated).getTime();
  return diff > STALE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
}

function generateId(): string {
  return `kb-${Date.now().toString(36)}-${crypto.randomBytes(4).toString("hex")}`;
}

// ── Read ─────────────────────────────────────────────────

export async function readKBFile(category: KBCategory): Promise<KBFile | null> {
  try {
    const raw = await fs.readFile(categoryPath(category), "utf-8");
    return JSON.parse(raw) as KBFile;
  } catch {
    return null;
  }
}

export async function getAllCategories(): Promise<KBCategory[]> {
  await ensureKBDir();
  const files = await fs.readdir(KB_DIR);
  return files
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .map((f) => f.replace(".json", "") as KBCategory);
}

// ── Validate ─────────────────────────────────────────────

export async function validateKBFile(category: KBCategory): Promise<{ valid: boolean; expected: string; actual: string }> {
  const file = await readKBFile(category);
  if (!file) return { valid: false, expected: "n/a", actual: "file_missing" };
  const actual = computeHash(file.entries);
  return { valid: actual === file.contentHash, expected: file.contentHash, actual };
}

export async function validateAll(): Promise<KBIndex> {
  const categories = await getAllCategories();
  let totalEntries = 0;
  let integrityOk = true;

  const results = await Promise.all(
    categories.map(async (category) => {
      const file = await readKBFile(category);
      if (!file) {
        integrityOk = false;
        return {
          category,
          description: "",
          entryCount: 0,
          contentHash: "",
          lastUpdated: "",
          stale: true,
        };
      }
      const hashCheck = computeHash(file.entries);
      const hashOk = hashCheck === file.contentHash;
      if (!hashOk) integrityOk = false;
      totalEntries += file.entries.length;
      return {
        category,
        description: file.description,
        entryCount: file.entries.length,
        contentHash: file.contentHash,
        lastUpdated: file.lastUpdated,
        stale: isStale(file.lastUpdated),
      };
    }),
  );

  const index: KBIndex = {
    categories: results,
    totalEntries,
    lastValidated: new Date().toISOString(),
    integrityOk,
  };

  // Persist index
  await ensureKBDir();
  await fs.writeFile(INDEX_FILE, JSON.stringify(index, null, 2), "utf-8");
  return index;
}

// ── Write ────────────────────────────────────────────────

export async function writeKBFile(category: KBCategory, description: string, entries: KBEntry[]): Promise<KBFile> {
  await ensureKBDir();
  const file: KBFile = {
    category,
    description,
    entries,
    contentHash: computeHash(entries),
    lastUpdated: new Date().toISOString(),
    schemaVersion: 1,
  };
  await fs.writeFile(categoryPath(category), JSON.stringify(file, null, 2), "utf-8");
  return file;
}

export async function addEntry(
  category: KBCategory,
  entry: Omit<KBEntry, "id" | "createdAt" | "updatedAt" | "version">,
): Promise<KBEntry> {
  const file = await readKBFile(category);
  const now = new Date().toISOString();
  const newEntry: KBEntry = {
    ...entry,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    version: 1,
  };

  if (file) {
    file.entries.push(newEntry);
    file.contentHash = computeHash(file.entries);
    file.lastUpdated = now;
    await fs.writeFile(categoryPath(category), JSON.stringify(file, null, 2), "utf-8");
  } else {
    await writeKBFile(category, `${category} knowledge base`, [newEntry]);
  }

  return newEntry;
}

export async function updateEntry(
  category: KBCategory,
  entryId: string,
  updates: Partial<Pick<KBEntry, "title" | "content" | "severity" | "tags">>,
): Promise<KBEntry | null> {
  const file = await readKBFile(category);
  if (!file) return null;

  const idx = file.entries.findIndex((e) => e.id === entryId);
  if (idx === -1) return null;

  const entry = file.entries[idx];
  const updated: KBEntry = {
    ...entry,
    ...updates,
    updatedAt: new Date().toISOString(),
    version: entry.version + 1,
  };
  file.entries[idx] = updated;
  file.contentHash = computeHash(file.entries);
  file.lastUpdated = updated.updatedAt;

  await fs.writeFile(categoryPath(category), JSON.stringify(file, null, 2), "utf-8");
  return updated;
}

export async function deleteEntry(category: KBCategory, entryId: string): Promise<boolean> {
  const file = await readKBFile(category);
  if (!file) return false;

  const before = file.entries.length;
  file.entries = file.entries.filter((e) => e.id !== entryId);
  if (file.entries.length === before) return false;

  file.contentHash = computeHash(file.entries);
  file.lastUpdated = new Date().toISOString();
  await fs.writeFile(categoryPath(category), JSON.stringify(file, null, 2), "utf-8");
  return true;
}

// ── Search ───────────────────────────────────────────────

export async function searchKB(query: string, categories?: KBCategory[]): Promise<KBEntry[]> {
  const cats = categories ?? await getAllCategories();
  const q = query.toLowerCase();
  const results: KBEntry[] = [];

  for (const cat of cats) {
    const file = await readKBFile(cat);
    if (!file) continue;
    for (const entry of file.entries) {
      if (
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        results.push(entry);
      }
    }
  }

  return results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
