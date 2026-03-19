import fs from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const ACTIVE_FILE = path.join(DATA_DIR, "active-projects.json");

export async function readActiveProjects(): Promise<string[]> {
  try {
    const raw = await fs.readFile(ACTIVE_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function writeActiveProjects(ids: string[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ACTIVE_FILE, JSON.stringify(ids, null, 2));
}
