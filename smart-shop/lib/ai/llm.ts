import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

export type LLMProvider = 'openai' | 'anthropic'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMStreamChunk {
  content: string
  done: boolean
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model?: string
}

export class LLMAdapter {
  private provider: LLMProvider
  private openai?: OpenAI
  private anthropic?: Anthropic
  private model: string

  constructor(config: LLMConfig) {
    this.provider = config.provider

    if (config.provider === 'openai') {
      this.openai = new OpenAI({ apiKey: config.apiKey })
      this.model = config.model || 'gpt-4-turbo-preview'
    } else if (config.provider === 'anthropic') {
      this.anthropic = new Anthropic({ apiKey: config.apiKey })
      this.model = config.model || 'claude-3-5-sonnet-20241022'
    } else {
      throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  async *streamChat(messages: LLMMessage[], tools?: any[]): AsyncGenerator<LLMStreamChunk> {
    if (this.provider === 'openai' && this.openai) {
      yield* this.streamOpenAI(messages, tools)
    } else if (this.provider === 'anthropic' && this.anthropic) {
      yield* this.streamAnthropic(messages, tools)
    }
  }

  private async *streamOpenAI(
    messages: LLMMessage[],
    tools?: any[]
  ): AsyncGenerator<LLMStreamChunk> {
    if (!this.openai) throw new Error('OpenAI not initialized')

    const params: OpenAI.Chat.ChatCompletionCreateParams = {
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      stream: true,
    }

    if (tools && tools.length > 0) {
      params.tools = tools
    }

    const stream = await this.openai.chat.completions.create(params)

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta
      if (delta?.content) {
        yield {
          content: delta.content,
          done: false,
        }
      }
    }

    yield { content: '', done: true }
  }

  private async *streamAnthropic(
    messages: LLMMessage[],
    _tools?: any[]
  ): AsyncGenerator<LLMStreamChunk> {
    if (!this.anthropic) throw new Error('Anthropic not initialized')

    // Extract system message
    const systemMessage = messages.find((m) => m.role === 'system')?.content || ''
    const conversationMessages = messages.filter((m) => m.role !== 'system')

    const stream = await this.anthropic.messages.create({
      model: this.model,
      max_tokens: 4096,
      system: systemMessage,
      messages: conversationMessages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
      stream: true,
    })

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        yield {
          content: event.delta.text,
          done: false,
        }
      }
    }

    yield { content: '', done: true }
  }

  async chat(messages: LLMMessage[]): Promise<string> {
    const chunks: string[] = []
    for await (const chunk of this.streamChat(messages)) {
      if (!chunk.done) {
        chunks.push(chunk.content)
      }
    }
    return chunks.join('')
  }
}

// Singleton instance
let llmInstance: LLMAdapter | null = null

export function getLLM(): LLMAdapter {
  if (!llmInstance) {
    const provider = (process.env.AI_PROVIDER || 'openai') as LLMProvider
    const apiKey =
      provider === 'openai'
        ? process.env.OPENAI_API_KEY || ''
        : process.env.ANTHROPIC_API_KEY || ''

    if (!apiKey) {
      throw new Error(`Missing API key for provider: ${provider}`)
    }

    const model =
      provider === 'openai'
        ? process.env.OPENAI_MODEL
        : process.env.ANTHROPIC_MODEL

    llmInstance = new LLMAdapter({ provider, apiKey, model })
  }

  return llmInstance
}
