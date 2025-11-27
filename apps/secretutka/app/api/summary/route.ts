import { NextRequest, NextResponse } from 'next/server';
import { executeAction } from '../../../src/core/executor.js';
import type { ShowSummaryAction } from '../../../src/core/types.js';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const month = searchParams.get('month');
    const clientName = searchParams.get('client');
    const groupBy = searchParams.get('groupBy') as 'client' | 'project' | undefined;

    const action: ShowSummaryAction = {
      type: 'show_summary',
      target: {},
      payload: {},
    };

    if (month) {
      action.target!.month = month;
    }

    if (clientName) {
      action.target!.clientName = clientName;
    }

    if (groupBy) {
      action.payload!.groupBy = groupBy;
    }

    const result = await executeAction(action);

    return NextResponse.json({
      success: result.success,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate summary',
      },
      { status: 500 }
    );
  }
}
