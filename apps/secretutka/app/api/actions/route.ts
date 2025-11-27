import { NextRequest, NextResponse } from 'next/server';
import { executeAction } from '../../../src/core/executor.js';
import type { AgentAction } from '../../../src/core/types.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body as { action: AgentAction };

    if (!action || !action.type) {
      return NextResponse.json(
        { success: false, error: 'Invalid action format' },
        { status: 400 }
      );
    }

    const result = await executeAction(action);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result.data,
      preview: result.preview,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to execute action',
      },
      { status: 500 }
    );
  }
}
