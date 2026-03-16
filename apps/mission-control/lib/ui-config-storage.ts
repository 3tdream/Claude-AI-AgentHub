import fs from "fs/promises";
import path from "path";

export interface UiConfig {
  lastUpdated: string | null; // ISO 8601 | null
}

const DATA_CONFIG_PATH = path.join(process.cwd(), "data/config/ui.json");

async function ensureDataDir(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

export async function getUiConfig(): Promise<UiConfig> {
  try {
    await ensureDataDir(DATA_CONFIG_PATH);
    const raw = await fs.readFile(DATA_CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as UiConfig;
    return { lastUpdated: parsed.lastUpdated ?? null };
  } catch {
    // File missing, corrupted, or disk error — graceful degradation
    return { lastUpdated: null };
  }
}

export async function setUiConfig(data: Partial<UiConfig>): Promise<void> {
  await ensureDataDir(DATA_CONFIG_PATH);
  const current = await getUiConfig();
  const merged: UiConfig = { ...current, ...data };
  const json = JSON.stringify(merged, null, 2);

  // Atomic write: write to tmp file, then rename
  const tmpPath = DATA_CONFIG_PATH + ".tmp";
  await fs.writeFile(tmpPath, json, "utf-8");
  await fs.rename(tmpPath, DATA_CONFIG_PATH);
}
