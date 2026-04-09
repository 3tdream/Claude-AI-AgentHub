/**
 * GET  /api/pipeline/runs  — list runs with filter/pagination
 * POST /api/pipeline/runs  — persist a PipelineExecution (called by executor)
 * Auth: x-internal-secret header (FAIL-048)
 */
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveRun, listRuns, validateRunId } from '@/lib/pipeline-run-storage';
import { PipelineExecution } from '@/types/workflow';

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

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10);
  const rawOffset = parseInt(searchParams.get('offset') ?? '0', 10);
  const sort = searchParams.get('sort') ?? 'startedAt_desc';

  const validStatuses = ['failed', 'escalated', 'completed', 'cancelled'];
  const validSorts = ['startedAt_desc', 'startedAt_asc'];

  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'invalid_params', detail: 'invalid status filter' }, { status: 400 });
  }
  if (!validSorts.includes(sort)) {
    return NextResponse.json({ error: 'invalid_params', detail: 'invalid sort value' }, { status: 400 });
  }

  const limit = Math.min(isNaN(rawLimit) ? 20 : rawLimit, 100);
  const offset = isNaN(rawOffset) ? 0 : rawOffset;

  try {
    const { runs, total } = await listRuns({ status, limit, offset, sort });
    return NextResponse.json({ runs, total, limit, offset });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'read_error', detail: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  let body: PipelineExecution;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_body', detail: 'invalid JSON' }, { status: 400 });
  }

  if (!body.id || !validateRunId(body.id)) {
    return NextResponse.json({ error: 'invalid_run_id' }, { status: 400 });
  }
  if (!body.workflowId || !body.status || !body.mode || !body.startedAt) {
    return NextResponse.json({ error: 'invalid_body', detail: 'missing required field' }, { status: 400 });
  }

  try {
    await saveRun(body);
    return NextResponse.json({
      ok: true,
      runId: body.id,
      path: `data/pipeline-runs/${body.id}.json`,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: 'write_error', detail: String(e) }, { status: 500 });
  }
}
