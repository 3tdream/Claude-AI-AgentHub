import { NextRequest, NextResponse } from 'next/server';
import { handleUserTextWithGemini } from '../../../src/nlp/gemini-agent.js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body as { text: string };

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Text input is required' },
        { status: 400 }
      );
    }

    // Using Gemini 2.5 Flash for faster and cheaper processing
    const actions = await handleUserTextWithGemini(text);

    return NextResponse.json({
      success: true,
      text,
      actions,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process voice input',
      },
      { status: 500 }
    );
  }
}
