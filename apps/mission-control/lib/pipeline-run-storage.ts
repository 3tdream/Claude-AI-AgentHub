/**
 * lib/pipeline-run-storage.ts — File-based CRUD for data/pipeline-runs/*.json
 * ADR-013: Pipeline Checkpoint Restart (PAT-002 pattern)
 */
import fs from 'fs/promises';
import path from 'path';
import { PipelineExecution, PipelineRunSummary } from '@/types/workflow';

const DATA_DIR = path.join(process.cwd(), 'data', 'pipeline-runs');
const COUNTER_FILE = path.join(process.cwd(), 'data', 'pipeline-runs', '_counter.json');
const MAX_RUNS = 100;
const RUN_ID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const validateRunId = (id: string): boolean => RUN_ID_REGEX.test(id);
export const ensureRunsDir = (): Promise<void> =>
  fs.mkdir(DATA_DIR, { recursive: true }).then(() => undefined);
const runPath = (id: string) => path.join(DATA_DIR, `${id}.json`);

/** Get next sequential MC-NNN id and persist counter */
async function nextShortId(): Promise<string> {
  await ensureRunsDir();
  let counter = 0;
  try {
    const data = JSON.parse(await fs.readFile(COUNTER_FILE, 'utf-8'));
    counter = data.counter || 0;
  } catch { /* first run */ }
  counter++;
  await fs.writeFile(COUNTER_FILE, JSON.stringify({ counter }), 'utf-8');
  return `MC-${String(counter).padStart(3, '0')}`;
}

/** Find a run by shortId (MC-001) or full UUID */
export async function findRunByShortId(shortId: string): Promise<PipelineExecution | null> {
  await ensureRunsDir();
  const files = (await fs.readdir(DATA_DIR)).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  for (const file of files) {
    try {
      const run = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf-8')) as PipelineExecution;
      if (run.shortId === shortId || run.id === shortId) return run;
    } catch { /* skip */ }
  }
  return null;
}

export async function saveRun(execution: PipelineExecution): Promise<void> {
  await ensureRunsDir();
  // Assign persistent shortId if missing
  if (!execution.shortId) {
    execution.shortId = await nextShortId();
  }
  const fp = runPath(execution.id);
  const tmp = `${fp}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(execution, null, 2), 'utf-8');
  try {
    await fs.rename(tmp, fp);
  } catch (err) {
    await fs.unlink(tmp).catch(() => {});
    throw err;
  }
  await evictOldestRuns(MAX_RUNS);
}

export async function loadRun(runId: string): Promise<PipelineExecution | null> {
  if (!validateRunId(runId)) return null;
  try {
    return JSON.parse(await fs.readFile(runPath(runId), 'utf-8')) as PipelineExecution;
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw e;
  }
}

export async function deleteRun(runId: string): Promise<boolean> {
  if (!validateRunId(runId)) return false;
  try {
    await fs.unlink(runPath(runId));
    return true;
  } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return false;
    throw e;
  }
}

export async function listRuns(opts: {
  status?: string; limit?: number; offset?: number; sort?: string;
}): Promise<{ runs: PipelineRunSummary[]; total: number }> {
  await ensureRunsDir();
  const { status, limit = 20, offset = 0, sort = 'startedAt_desc' } = opts;
  const files = (await fs.readdir(DATA_DIR)).filter(f => f.endsWith('.json'));
  const summaries: PipelineRunSummary[] = [];
  for (const file of files) {
    try {
      const run = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf-8')) as PipelineExecution;
      if (status && run.status !== status) continue;
      const stepResultValues = Object.values(run.stepResults ?? {});
      const failedStep = stepResultValues.find(s => s.status === 'failed' || (s.status as string) === 'escalated');
      summaries.push({
        id: run.id, workflowId: run.workflowId, workflowName: run.workflowName, status: run.status,
        startedAt: run.startedAt, completedAt: run.completedAt ?? null,
        stepCount: stepResultValues.length, failedStep: failedStep?.stepId ?? null,
        input: (run.input ?? '').slice(0, 200),
      });
    } catch { /* skip corrupt */ }
  }
  const asc = sort === 'startedAt_asc';
  summaries.sort((a, b) => (asc ? 1 : -1) * a.startedAt.localeCompare(b.startedAt));
  return { runs: summaries.slice(offset, offset + limit), total: summaries.length };
}

export async function evictOldestRuns(max: number): Promise<void> {
  const files = (await fs.readdir(DATA_DIR)).filter(f => f.endsWith('.json'));
  if (files.length <= max) return;
  const entries: { file: string; startedAt: string }[] = [];
  for (const file of files) {
    try {
      const run = JSON.parse(await fs.readFile(path.join(DATA_DIR, file), 'utf-8')) as PipelineExecution;
      entries.push({ file, startedAt: run.startedAt ?? '' });
    } catch { entries.push({ file, startedAt: '' }); }
  }
  entries.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  for (const { file } of entries.slice(0, entries.length - max)) {
    await fs.unlink(path.join(DATA_DIR, file)).catch(() => {});
  }
}
