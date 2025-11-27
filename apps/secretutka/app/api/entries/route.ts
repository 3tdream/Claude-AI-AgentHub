import { NextResponse } from 'next/server';
import { getAllEntries } from '../../../src/storage/index.js';

export async function GET() {
  try {
    const result = await getAllEntries();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entries: result.data || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch entries',
      },
      { status: 500 }
    );
  }
}
