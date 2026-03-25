/**
 * Cross-Session Learning Bridge
 *
 * Syncs knowledge between:
 * - Claude Code CLI memory (C:\Users\Ro050\.claude\projects\...\memory\)
 * - Mission Control KB (data/knowledge-base/)
 *
 * Direction:
 * - KB → Memory: export KB summaries as memory files for CLI sessions
 * - Memory → KB: import memory observations into KB entries
 * - Bidirectional sync on demand
 */

import { promises as fs } from "fs";
import path from "path";
import { readKBFile, addEntry, getAllCategories } from "@/lib/kb-storage";
import type { KBCategory, KBEntry } from "@/types";

const MEMORY_DIR = path.join("C:", "Users", "Ro050", ".claude", "projects", "C--Users-Ro050-Desktop-ai-projects", "memory");
const KB_DIR = path.join(process.cwd(), "data", "knowledge-base");

// ── Types ────────────────────────────────────────────

interface MemoryFile {
  filename: string;
  name: string;
  description: string;
  type: string;
  content: string;
}

export interface SyncReport {
  direction: "kb-to-memory" | "memory-to-kb" | "bidirectional";
  kbToMemory: { exported: number; skipped: number; files: string[] };
  memoryToKb: { imported: number; skipped: number; entries: string[] };
  syncedAt: string;
}

// ── Memory File Parser ───────────────────────────────

async function readMemoryFiles(): Promise<MemoryFile[]> {
  const files: MemoryFile[] = [];
  try {
    const entries = await fs.readdir(MEMORY_DIR);
    for (const filename of entries) {
      if (!filename.endsWith(".md") || filename === "MEMORY.md") continue;
      try {
        const raw = await fs.readFile(path.join(MEMORY_DIR, filename), "utf-8");
        const frontmatterMatch = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (!frontmatterMatch) continue;

        const frontmatter = frontmatterMatch[1];
        const content = frontmatterMatch[2].trim();
        const name = frontmatter.match(/name:\s*(.+)/)?.[1]?.trim() || filename;
        const description = frontmatter.match(/description:\s*(.+)/)?.[1]?.trim() || "";
        const type = frontmatter.match(/type:\s*(.+)/)?.[1]?.trim() || "unknown";

        files.push({ filename, name, description, type, content });
      } catch { /* skip unreadable */ }
    }
  } catch { /* dir missing */ }
  return files;
}

// ── KB → Memory Export ───────────────────────────────

export async function exportKBToMemory(): Promise<SyncReport["kbToMemory"]> {
  const exported: string[] = [];
  let skipped = 0;

  const categories = await getAllCategories();

  for (const category of categories) {
    const file = await readKBFile(category);
    if (!file || file.entries.length === 0) continue;

    // Generate a summary memory file per category
    const filename = `kb_${category.replace(/-/g, "_")}.md`;
    const filePath = path.join(MEMORY_DIR, filename);

    // Check if already exists and is recent
    try {
      const stat = await fs.stat(filePath);
      const ageHours = (Date.now() - stat.mtimeMs) / (60 * 60 * 1000);
      if (ageHours < 12) {
        skipped++;
        continue; // Skip if exported less than 12h ago
      }
    } catch { /* file doesn't exist yet — create it */ }

    // Build summary
    const topEntries = file.entries
      .sort((a, b) => {
        const sev = { critical: 0, high: 1, medium: 2, low: 3 };
        return (sev[a.severity] ?? 3) - (sev[b.severity] ?? 3);
      })
      .slice(0, 10);

    const content = `---
name: KB ${category} summary
description: Top ${topEntries.length} ${category} entries from Mission Control KB (auto-synced)
type: reference
---

## ${file.description}

${topEntries.length} entries (of ${file.entries.length} total), sorted by severity:

${topEntries.map((e, i) => `${i + 1}. **[${e.severity}]** ${e.title}\n   ${e.content.slice(0, 150)}${e.content.length > 150 ? "..." : ""}`).join("\n\n")}

Last synced: ${new Date().toISOString().slice(0, 10)}
Source: data/knowledge-base/${category}.json
`;

    await fs.writeFile(filePath, content, "utf-8");
    exported.push(filename);
  }

  return { exported: exported.length, skipped, files: exported };
}

// ── Memory → KB Import ───────────────────────────────

export async function importMemoryToKB(): Promise<SyncReport["memoryToKb"]> {
  const imported: string[] = [];
  let skipped = 0;

  const memoryFiles = await readMemoryFiles();

  // Map memory types to KB categories
  const typeToCategory: Record<string, KBCategory> = {
    feedback: "failure-patterns",
    project: "tech-decisions",
    reference: "architecture-patterns",
    user: "success-patterns", // User preferences → success patterns
  };

  for (const mem of memoryFiles) {
    // Skip KB-exported files (they start with "kb_")
    if (mem.filename.startsWith("kb_")) {
      skipped++;
      continue;
    }

    const category = typeToCategory[mem.type];
    if (!category) {
      skipped++;
      continue;
    }

    // Check if already imported (search by memory filename in tags)
    const file = await readKBFile(category);
    if (file?.entries.some((e) => e.tags.includes(`memory:${mem.filename}`))) {
      skipped++;
      continue;
    }

    // Import as KB entry
    try {
      const entry = await addEntry(category, {
        title: mem.name,
        content: mem.content.slice(0, 500),
        source: "claude-memory",
        severity: mem.type === "feedback" ? "high" : "medium",
        tags: ["imported-from-memory", `memory:${mem.filename}`, mem.type],
      });
      imported.push(entry.id);
    } catch { /* skip write errors */ }
  }

  return { imported: imported.length, skipped, entries: imported };
}

// ── Bidirectional Sync ───────────────────────────────

export async function syncBidirectional(): Promise<SyncReport> {
  const [kbToMemory, memoryToKb] = await Promise.all([
    exportKBToMemory(),
    importMemoryToKB(),
  ]);

  return {
    direction: "bidirectional",
    kbToMemory,
    memoryToKb,
    syncedAt: new Date().toISOString(),
  };
}
