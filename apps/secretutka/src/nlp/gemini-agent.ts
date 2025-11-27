/**
 * Gemini 2.5 Flash Agent
 * Converts user text to structured actions using Google Gemini AI
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AgentAction } from '../core/types.js';

// Initialize Gemini client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * System prompt that teaches Gemini about the action format
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

User: "Delete my last entry"
Response: [{"type":"delete_entry","target":{"last":true}}]

User: "Delete all entries for Acme Corp from last week"
Response: [{"type":"delete_entry","target":{"clientName":"Acme Corp","dateFrom":"2025-11-14","dateTo":"2025-11-21"}}]

User: "Show me total hours by client" or "Hours per client"
Response: [{"type":"show_summary","payload":{"groupBy":"client"}}]

User: "Show total pending" or "How much is pending?" or "Unpaid work"
Response: [{"type":"show_summary","target":{"paymentStatus":"pending"}}]

User: "Show me hours for Acme Corp"
Response: [{"type":"show_summary","target":{"clientName":"Acme Corp"}}]

IMPORTANT:
- Always return a JSON array of actions, even for a single action
- Use 24-hour format for times (HH:MM with leading zeros)
- Use YYYY-MM-DD for dates
- Infer missing information from context when reasonable
- Default currency to USD if not specified
- Default paymentStatus to "pending" if not specified
- Return ONLY the JSON array, no explanations or markdown`;

/**
 * Convert user text to structured actions using Gemini
 */
export async function handleUserTextWithGemini(
  input: string,
  context?: {
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }
): Promise<AgentAction[]> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 2048,
    },
  });

  try {
    // Build conversation history for context
    const history = context?.conversationHistory?.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    })) || [];

    // Create chat session with system instruction
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'You are a work session tracking assistant. Here are your instructions:\n\n' + SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'I understand. I will convert user requests into structured JSON actions for work session tracking. I will return only JSON arrays with no additional text.' }],
        },
        ...history,
      ],
    });

    const result = await chat.sendMessage(input);
    const responseText = result.response.text().trim();

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
    if (error instanceof Error) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Check if Gemini API key is configured
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Get Gemini configuration instructions
 */
export function getGeminiConfigInstructions(): string {
  return `
To use the Gemini agent, you need to set up your Google AI API key:

1. Get your API key from: https://aistudio.google.com/apikey
2. Set the environment variable:

   On macOS/Linux:
   export GEMINI_API_KEY="your-api-key-here"

   On Windows (PowerShell):
   $env:GEMINI_API_KEY="your-api-key-here"

   Or create a .env file:
   GEMINI_API_KEY=your-api-key-here

3. Run the command again

For more information, visit: https://ai.google.dev/docs
  `.trim();
}
