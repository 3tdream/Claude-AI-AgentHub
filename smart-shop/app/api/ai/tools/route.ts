import { NextRequest, NextResponse } from 'next/server'
import { executeTool } from '@/lib/ai/tools'

export async function POST(request: NextRequest) {
  try {
    const { toolName, args } = await request.json()

    if (!toolName) {
      return NextResponse.json({ error: 'Tool name is required' }, { status: 400 })
    }

    const result = await executeTool(toolName, args || {})

    return NextResponse.json({ result })
  } catch (error) {
    console.error('Tool execution error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Tool execution failed' },
      { status: 500 }
    )
  }
}
