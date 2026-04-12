import fs from 'fs/promises';
import path from 'path';
import type { NotificationEntry } from '@/types/workflow';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'notifications.json');
const MAX_ENTRIES = 200;

async function ensureDataDir(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

interface NotificationsFile {
  notifications: NotificationEntry[];
}

async function readFile(): Promise<NotificationsFile> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as NotificationsFile;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return { notifications: [] };
    }
    throw err;
  }
}

async function writeFile(data: NotificationsFile): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getNotifications(): Promise<NotificationEntry[]> {
  const data = await readFile();
  return data.notifications;
}

export async function saveNotification(entry: NotificationEntry): Promise<void> {
  await ensureDataDir();
  const data = await readFile();
  data.notifications = [entry, ...data.notifications].slice(0, MAX_ENTRIES);
  await writeFile(data);
}

export async function markAllRead(): Promise<number> {
  await ensureDataDir();
  const data = await readFile();
  let count = 0;
  data.notifications = data.notifications.map((n) => {
    if (!n.read) { count++; return { ...n, read: true }; }
    return n;
  });
  await writeFile(data);
  return count;
}

export async function markOneRead(id: string, read: boolean): Promise<boolean> {
  await ensureDataDir();
  const data = await readFile();
  let found = false;
  data.notifications = data.notifications.map((n) => {
    if (n.id === id) { found = true; return { ...n, read }; }
    return n;
  });
  if (found) await writeFile(data);
  return found;
}
