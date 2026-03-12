/**
 * Loads agent system prompts from local .md files
 * Path: agents/agents team/.claude/agents/{agentId}.md
 * Falls back to agent-prompts-cache.ts if file not found
 */

import { promises as fs } from "fs";
import path from "path";
import { getAgentPrompt } from "@/lib/agent-prompts-cache";

const AGENTS_DIR = path.join(
  process.cwd(),
  "agents",
  "agents team",
  ".claude",
  "agents",
);

// In-memory cache to avoid re-reading files every call
const promptCache = new Map<string, { content: string; loadedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Load the system prompt for an agent by ID.
 * Reads from .md file, strips YAML frontmatter, returns markdown body.
 */
export async function loadAgentPrompt(agentId: string): Promise<string> {
  // Check cache
  const cached = promptCache.get(agentId);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL) {
    return cached.content;
  }

  const filePath = path.join(AGENTS_DIR, `${agentId}.md`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const content = stripFrontmatter(raw);

    if (content.trim()) {
      promptCache.set(agentId, { content, loadedAt: Date.now() });
      return content;
    }
  } catch {
    // File not found — fall through to cache
  }

  // Fallback: hardcoded prompt cache
  return getAgentPrompt(agentId);
}

/**
 * Strip YAML frontmatter (--- ... ---) from markdown content.
 */
function stripFrontmatter(content: string): string {
  const match = content.match(/^---\n[\s\S]*?\n---\n?([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

/**
 * Get metadata (name, model) from agent's YAML frontmatter
 */
export async function getAgentMeta(
  agentId: string,
): Promise<{ name: string; model: string } | null> {
  const filePath = path.join(AGENTS_DIR, `${agentId}.md`);

  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/);
    if (!fmMatch) return null;

    const fm = fmMatch[1];
    const name = fm.match(/name:\s*(.+)/)?.[1]?.trim() || agentId;
    const model = fm.match(/model:\s*(.+)/)?.[1]?.trim() || "sonnet";

    return { name, model };
  } catch {
    return null;
  }
}

/**
 * List all available agent IDs (from .md files)
 */
export async function listAgentIds(): Promise<string[]> {
  try {
    const files = await fs.readdir(AGENTS_DIR);
    return files
      .filter((f) => f.endsWith(".md"))
      .map((f) => f.replace(".md", ""));
  } catch {
    return [];
  }
}
