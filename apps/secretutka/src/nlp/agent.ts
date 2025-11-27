/**
 * Natural Language Processing Agent
 * Converts user text to structured actions using Claude AI
 * Supports multiple API keys with automatic rotation and fallback
 */

import Anthropic from '@anthropic-ai/sdk';
import type { AgentAction } from '../core/types.js';
import { loadApiKeys, type ApiKeyManager } from './key-manager.js';

// Initialize API key manager
let keyManager: ApiKeyManager | null = null;

function getKeyManager(): ApiKeyManager {
  if (!keyManager) {
    keyManager = loadApiKeys();
  }
  return keyManager;
}

/**
 * Make an API call with automatic key rotation on failures
 */
async function makeAnthropicCall<T>(
  callFn: (client: Anthropic) => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  const manager = getKeyManager();
  let lastError: any;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const currentKey = manager.getNextKey();
    const client = new Anthropic({ apiKey: currentKey });

    try {
      const result = await callFn(client);
      manager.reportSuccess(currentKey);
      return result;
    } catch (error) {
      lastError = error;
      manager.reportError(currentKey, error);

      // Don't retry on certain errors
      const isRetryable =
        (error as any)?.status === 429 || // Rate limit
        (error as any)?.status === 500 || // Server error
        (error as any)?.status === 503;   // Service unavailable

      if (!isRetryable && attempt === 0) {
        // Non-retryable error, throw immediately
        throw error;
      }

      // Log retry attempt
      if (attempt < maxRetries - 1) {
        console.log(`⚠ API call failed (attempt ${attempt + 1}/${maxRetries}), rotating to next key...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
      }
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * System prompt that teaches Claude about the action format
 */
const SYSTEM_PROMPT = `You are a personal work session tracking assistant. Your job is to convert user requests into structured JSON actions.

Available action types:
1. create_entry - Add a new work session
2. update_entry - Update existing entries
3. delete_entry - Delete entries
4. mark_paid/mark_pending/mark_overdue - Change payment status
5. show_summary - Generate reports
6. list_entries - List work sessions
7. get_entry - Get a specific entry

Action structure:
{
  "type": "action_type",
  "target": {
    "id": "entry-id",           // Direct ID
    "date": "YYYY-MM-DD",        // Specific date
    "dateFrom": "YYYY-MM-DD",    // Date range start
    "dateTo": "YYYY-MM-DD",      // Date range end
    "month": "YYYY-MM",          // Month (converts to date range)
    "clientName": "client",      // Client name (partial match)
    "project": "project",        // Project name
    "paymentStatus": "pending|paid|overdue",
    "last": true,                // Target most recent entry
    "lastForClient": "client"    // Most recent for client
  },
  "payload": {
    // For create_entry:
    "date": "YYYY-MM-DD",
    "startTime": "HH:MM",
    "endTime": "HH:MM",
    "clientName": "Client Name",
    "hourlyRate": 75,
    "currency": "USD",
    "project": "Project Name",
    "notes": "Optional notes",
    "paymentStatus": "pending"

    // For update_entry:
    // Any fields to update

    // For show_summary:
    "groupBy": "client" | "project"
  }
}

Current date reference: Use ${new Date().toISOString().split('T')[0]} as "today"

Examples:
User: "Add today's work from 9am to 5pm for Acme Corp at $75/hour"
Response: [{"type":"create_entry","payload":{"date":"${new Date().toISOString().split('T')[0]}","startTime":"09:00","endTime":"17:00","clientName":"Acme Corp","hourlyRate":75,"currency":"USD"}}]

User: "Mark all January entries for Tech Inc as paid"
Response: [{"type":"mark_paid","target":{"month":"2025-01","clientName":"Tech Inc"}}]

User: "Show me summary for last month"
Response: [{"type":"show_summary","target":{"month":"2025-01"}}]

User: "Update my last entry for Acme and set rate to $100"
Response: [{"type":"update_entry","target":{"lastForClient":"Acme"},"payload":{"hourlyRate":100}}]

IMPORTANT:
- Always return a JSON array of actions, even for a single action
- Use 24-hour format for times (HH:MM with leading zeros)
- Use YYYY-MM-DD for dates
- Infer missing information from context when reasonable
- Default currency to USD if not specified
- Default paymentStatus to "pending" if not specified
- Return ONLY the JSON array, no explanations or markdown`;

/**
 * Convert user text to structured actions using Claude
 */
export async function handleUserText(
  input: string,
  context?: {
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): Promise<AgentAction[]> {
  try {
    const response = await makeAnthropicCall(client =>
      client.messages.create({
        model: 'claude-3-opus-20240229', // Note: Will be deprecated Jan 2026, upgrade API key for newer models
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [
          // Include conversation history if provided
          ...(context?.conversationHistory || []),
          {
            role: 'user',
            content: input,
          },
        ],
      })
    );

    // Extract text content
    const textContent = response.content.find((block) => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    const responseText = textContent.text.trim();

    // Parse JSON response
    // Remove markdown code blocks if present
    const jsonText = responseText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim();

    const actions = JSON.parse(jsonText);

    // Validate it's an array
    if (!Array.isArray(actions)) {
      throw new Error('Response must be an array of actions');
    }

    // Validate each action has a type
    for (const action of actions) {
      if (!action.type) {
        throw new Error('Each action must have a type field');
      }
    }

    return actions;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      throw new Error(`Claude API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if API key is configured
 */
export function isConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/**
 * Get configuration instructions
 */
export function getConfigInstructions(): string {
  return `
To use the natural language agent, you need to set up your Anthropic API key:

1. Get your API key from: https://console.anthropic.com/
2. Set the environment variable:

   On macOS/Linux:
   export ANTHROPIC_API_KEY="your-api-key-here"

   On Windows (PowerShell):
   $env:ANTHROPIC_API_KEY="your-api-key-here"

   Or create a .env file:
   ANTHROPIC_API_KEY=your-api-key-here

3. Run the command again

For more information, visit: https://docs.anthropic.com/
  `.trim();
}
