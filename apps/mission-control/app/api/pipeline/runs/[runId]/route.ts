/**
 * GET    /api/pipeline/runs/[runId] — read single persisted run
 * DELETE /api/pipeline/runs/[runId] — delete run file
 * Auth: x-internal-secret header (FAIL-048)
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { loadRun, deleteRun, validateRunId } from '@/lib/pipeline-run-storage';

function checkAuth(req: NextRequest): boolean {
  const secret = process.env.INTERNAL_API_SECRET ?? '';
  const header = req.headers.get('x-internal-secret') ?? '';
  if (!secret || !header) return false;
  try {
    const a = Buffer.from(secret, 'utf-8');
    const b = Buffer.from(header, 'utf-8');
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch { return false; }
}

type Params = { params: Promise<{ runId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { runId } = await params;

  if (!validateRunId(runId)) {
    return NextResponse.json({ error: 'invalid_run_id' }, { status: 400 });
  }

  try {
    const run = await loadRun(runId);
    if (!run) return NextResponse.json({ error: 'run_not_found' }, { status: 404 });
    return NextResponse.json({ run });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'read_error', detail: String(e) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { runId } = await params;

  if (!validateRunId(runId)) {
    return NextResponse.json({ error: 'invalid_run_id' }, { status: 400 });
  }

  try {
    const deleted = await deleteRun(runId);
    if (!deleted) return NextResponse.json({ error: 'run_not_found' }, { status: 404 });
    return NextResponse.json({ ok: true, runId });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'delete_error', detail: String(e) }, { status: 500 });
  }
}
