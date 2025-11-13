import { NextRequest } from 'next/server'
import { getLLM } from '@/lib/ai/llm'
import { getAgentPrompt, type AgentType } from '@/lib/ai/agents'
import { executeTool } from '@/lib/ai/tools'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatRequest {
  messages: ChatMessage[]
  agent?: AgentType
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, agent = 'product' } = body

    // Get agent system prompt
    const systemPrompt = getAgentPrompt(agent)

    // Prepend system message
    const fullMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages,
    ]

    // Get LLM instance
    const llm = getLLM()

    // Create streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of llm.streamChat(fullMessages)) {
            if (!chunk.done) {
              const data = `data: ${JSON.stringify({ content: chunk.content })}\n\n`
              controller.enqueue(encoder.encode(data))
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
