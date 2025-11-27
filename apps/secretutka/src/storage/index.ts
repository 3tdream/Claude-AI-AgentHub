/**
 * Hybrid storage for work entries
 * Uses Vercel KV on Vercel, file-based storage locally
 */

import fs from 'fs/promises';
import path from 'path';
import { kv } from '@vercel/kv';

import type {
  WorkEntry,
  WorkEntryInput,
  WorkEntryUpdate,
  WorkEntryFilter,
  WorklogData,
  StorageResult,
} from './types.js';
import {
  createWorkEntry,
  validateWorkEntryInput,
} from './utils.js';

// Check if we're running on Vercel with KV configured
const isVercelKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

// Path to worklog.json for local development
const WORKLOG_PATH = path.join(process.cwd(), "data", "worklog.json");

// KV key for storing worklog
const KV_WORKLOG_KEY = 'secretutka:worklog';

/**
 * Ensure data directory and worklog file exist (local only)
 */
async function ensureWorklogFile(): Promise<void> {
  try {
    await fs.access(WORKLOG_PATH);
  } catch {
    // File doesn't exist, create it
    const dataDir = path.dirname(WORKLOG_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      WORKLOG_PATH,
      JSON.stringify({ entries: [] }, null, 2),
      'utf-8'
    );
  }
}

/**
 * Read worklog data
 */
async function readWorklog(): Promise<WorklogData> {
  if (isVercelKV) {
    const data = await kv.get<WorklogData>(KV_WORKLOG_KEY);
    return data || { entries: [] };
  }

  await ensureWorklogFile();
  const data = await fs.readFile(WORKLOG_PATH, 'utf-8');
  return JSON.parse(data);
}

/**
 * Write worklog data
 */
async function writeWorklog(data: WorklogData): Promise<void> {
  if (isVercelKV) {
    await kv.set(KV_WORKLOG_KEY, data);
    return;
  }

  await fs.writeFile(WORKLOG_PATH, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Get all work entries
 */
export async function getAllEntries(): Promise<StorageResult<WorkEntry[]>> {
  try {
    const worklog = await readWorklog();
    return {
      success: true,
      data: worklog.entries,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to read entries: ${(error as Error).message}`,
    };
  }
}

/**
 * Add new work entry
 */
export async function addEntry(
  input: WorkEntryInput
): Promise<StorageResult<WorkEntry>> {
  try {
    // Validate input
    const validationError = validateWorkEntryInput(input);
    if (validationError) {
      return {
        success: false,
        error: validationError,
      };
    }

    // Create entry
    const entry = createWorkEntry(input);

    // Read, update, write
    const worklog = await readWorklog();
    worklog.entries.push(entry);
    await writeWorklog(worklog);

    return {
      success: true,
      data: entry,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to add entry: ${(error as Error).message}`,
    };
  }
}

/**
 * Update work entry by ID
 */
export async function updateEntryById(
  id: string,
  changes: WorkEntryUpdate
): Promise<StorageResult<WorkEntry>> {
  try {
    const worklog = await readWorklog();
    const index = worklog.entries.findIndex((e) => e.id === id);

    if (index === -1) {
      return {
        success: false,
        error: `Entry with id ${id} not found`,
      };
    }

    // Apply updates
    const updatedEntry: WorkEntry = {
      ...worklog.entries[index],
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    worklog.entries[index] = updatedEntry;
    await writeWorklog(worklog);

    return {
      success: true,
      data: updatedEntry,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to update entry: ${(error as Error).message}`,
    };
  }
}

/**
 * Delete work entry by ID
 */
export async function deleteEntryById(
  id: string
): Promise<StorageResult<boolean>> {
  try {
    const worklog = await readWorklog();
    const initialLength = worklog.entries.length;
    worklog.entries = worklog.entries.filter((e) => e.id !== id);

    if (worklog.entries.length === initialLength) {
      return {
        success: false,
        error: `Entry with id ${id} not found`,
      };
    }

    await writeWorklog(worklog);

    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to delete entry: ${(error as Error).message}`,
    };
  }
}

/**
 * Find entries by filter criteria
 */
export async function findEntriesByFilter(
  filter: WorkEntryFilter
): Promise<StorageResult<WorkEntry[]>> {
  try {
    const worklog = await readWorklog();
    let filtered = worklog.entries;

    // Apply filters
    if (filter.id) {
      filtered = filtered.filter((e) => e.id === filter.id);
    }

    if (filter.clientName) {
      const searchTerm = filter.clientName.toLowerCase();
      filtered = filtered.filter((e) =>
        e.clientName.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.date) {
      filtered = filtered.filter((e) => e.date === filter.date);
    }

    if (filter.dateFrom) {
      filtered = filtered.filter((e) => e.date >= filter.dateFrom!);
    }

    if (filter.dateTo) {
      filtered = filtered.filter((e) => e.date <= filter.dateTo!);
    }

    if (filter.paymentStatus) {
      filtered = filtered.filter((e) => e.paymentStatus === filter.paymentStatus);
    }

    if (filter.project) {
      const searchTerm = filter.project.toLowerCase();
      filtered = filtered.filter(
        (e) => e.project?.toLowerCase().includes(searchTerm)
      );
    }

    if (filter.minRate !== undefined) {
      filtered = filtered.filter((e) => e.hourlyRate >= filter.minRate!);
    }

    if (filter.maxRate !== undefined) {
      filtered = filtered.filter((e) => e.hourlyRate <= filter.maxRate!);
    }

    return {
      success: true,
      data: filtered,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to filter entries: ${(error as Error).message}`,
    };
  }
}

/**
 * Get entry by ID
 */
export async function getEntryById(
  id: string
): Promise<StorageResult<WorkEntry>> {
  const result = await findEntriesByFilter({ id });

  if (!result.success || !result.data || result.data.length === 0) {
    return {
      success: false,
      error: `Entry with id ${id} not found`,
    };
  }

  return {
    success: true,
    data: result.data[0],
  };
}

/**
 * Clear all entries (useful for testing)
 */
export async function clearAllEntries(): Promise<StorageResult<boolean>> {
  try {
    await writeWorklog({ entries: [] });
    return {
      success: true,
      data: true,
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to clear entries: ${(error as Error).message}`,
    };
  }
}

// Export types
export * from './types.js';
export * from './utils.js';
