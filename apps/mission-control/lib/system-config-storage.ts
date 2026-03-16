import { promises as fs } from "fs";
import path from "path";

export interface UIConfig {
  lastUpdated: string | null;
}

const CONFIG_DIR = path.join(process.cwd(), "data", "config");
const CONFIG_FILE = path.join(CONFIG_DIR, "ui.json");
const CONFIG_TMP = path.join(CONFIG_DIR, "ui.json.tmp");

async function ensureDataDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Reads UI config from data/config/ui.json.
 * - Returns { lastUpdated: null } if file does not exist (ENOENT).
 * - Throws on any other FS or parse error (caller handles).
 */
export async function readUIConfig(): Promise<UIConfig> {
  await ensureDataDir(CONFIG_DIR);

  let raw: string;
  try {
    raw = await fs.readFile(CONFIG_FILE, "utf-8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return { lastUpdated: null };
    }
    throw err;
  }

  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const lastUpdated =
    typeof parsed.lastUpdated === "string" ? parsed.lastUpdated : null;

  return { lastUpdated };
}

/**
 * Atomically writes UI config to data/config/ui.json.
 * Uses tmp-file + rename to prevent corruption on concurrent writes.
 * Throws on error (caller should use fire-and-forget with .catch()).
 */
export async function writeUIConfig(config: UIConfig): Promise<void> {
  await ensureDataDir(CONFIG_DIR);
  const content = JSON.stringify(config, null, 2);
  await fs.writeFile(CONFIG_TMP, content, "utf-8");
  await fs.rename(CONFIG_TMP, CONFIG_FILE);
}
