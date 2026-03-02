import { promises as fs } from "fs";
import path from "path";
import type { LogEntry, CreateLogParams } from "@/types";

const DATA_DIR = path.join(process.cwd(), "data");
const LOGS_FILE = path.join(DATA_DIR, "logs.json");
const MAX_ENTRIES = 2000;

async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {
    // dir already exists
  }
}

async function readLogs(): Promise<LogEntry[]> {
  try {
    const raw = await fs.readFile(LOGS_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLogs(logs: LogEntry[]) {
  await ensureDataDir();
  await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), "utf-8");
}

export interface GetLogsFilters {
  type?: string;
  agentId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export async function getLogs(filters: GetLogsFilters = {}): Promise<{ entries: LogEntry[]; total: number }> {
  let logs = await readLogs();

  if (filters.type) {
    logs = logs.filter((l) => l.type === filters.type);
  }
  if (filters.agentId) {
    logs = logs.filter((l) => l.agentId === filters.agentId);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.content.toLowerCase().includes(q) ||
        l.agentName?.toLowerCase().includes(q),
    );
  }

  // Sort newest first
  logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = logs.length;
  const offset = filters.offset || 0;
  const limit = filters.limit || 50;

  return {
    entries: logs.slice(offset, offset + limit),
    total,
  };
}

export async function addLog(params: CreateLogParams): Promise<LogEntry> {
  const logs = await readLogs();

  const entry: LogEntry = {
    id: crypto.randomUUID(),
    type: params.type,
    agentId: params.agentId,
    agentName: params.agentName,
    content: params.content,
    metadata: params.metadata,
    createdAt: new Date().toISOString(),
  };

  logs.unshift(entry);

  // Cap at MAX_ENTRIES
  if (logs.length > MAX_ENTRIES) {
    logs.length = MAX_ENTRIES;
  }

  await writeLogs(logs);
  return entry;
}
