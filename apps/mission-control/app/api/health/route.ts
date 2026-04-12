import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, boolean> = {};

  // Data directory writable
  try {
    const testFile = path.join(process.cwd(), 'data', '.health-check');
    await fs.writeFile(testFile, Date.now().toString());
    await fs.unlink(testFile);
    checks.dataDir = true;
  } catch {
    checks.dataDir = false;
  }

  // API keys configured
  checks.anthropicKey = !!process.env.ANTHROPIC_API_KEY;
  checks.openaiKey = !!process.env.OPENAI_API_KEY;

  const healthy = checks.dataDir;

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      checks,
    },
    { status: healthy ? 200 : 503 },
  );
}
