import { promises as fs } from "fs";
import path from "path";

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  defaultProjectKey?: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const CONFIG_FILE = path.join(DATA_DIR, "jira-config.json");

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // dir already exists
  }
}

/** Read config from file, fall back to env vars */
export async function getJiraConfig(): Promise<JiraConfig> {
  // Try file-based config first
  try {
    const raw = await fs.readFile(CONFIG_FILE, "utf-8");
    const config = JSON.parse(raw) as JiraConfig;
    if (config.baseUrl && config.email && config.apiToken) {
      return config;
    }
  } catch {
    // file doesn't exist or is invalid — fall through
  }

  // Fall back to env vars
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (!baseUrl || !email || !apiToken) {
    throw new Error("Jira is not configured");
  }

  return { baseUrl, email, apiToken };
}

/** Check if Jira is configured (file or env) without throwing */
export async function hasJiraConfig(): Promise<boolean> {
  try {
    await getJiraConfig();
    return true;
  } catch {
    return false;
  }
}

/** Save Jira config to data/jira-config.json */
export async function saveJiraConfig(config: JiraConfig): Promise<void> {
  await ensureDataDir();
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}
