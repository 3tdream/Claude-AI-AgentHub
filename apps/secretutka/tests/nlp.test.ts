/**
 * Tests for NLP agent
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isConfigured } from '../src/nlp/index.js';

// Create a mock create function that we can control
const mockCreate = vi.fn();

// Mock the entire Anthropic SDK module
vi.mock('@anthropic-ai/sdk', () => {
  return {
    default: class MockAnthropic {
      messages = {
        create: mockCreate,
      };
    },
  };
});

describe('NLP Agent', () => {
  const originalEnv = process.env.ANTHROPIC_API_KEY;

  beforeEach(() => {
    // Set a mock API key for tests
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    if (originalEnv) {
      process.env.ANTHROPIC_API_KEY = originalEnv;
    } else {
      delete process.env.ANTHROPIC_API_KEY;
    }
  });

  describe('isConfigured', () => {
    it('should return true when API key is set', () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      expect(isConfigured()).toBe(true);
    });

    it('should return false when API key is not set', () => {
      delete process.env.ANTHROPIC_API_KEY;
      expect(isConfigured()).toBe(false);
    });
  });

  describe('handleUserText', () => {
    it('should parse create_entry action from natural language', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                type: 'create_entry',
                payload: {
                  date: '2025-01-18',
                  startTime: '09:00',
                  endTime: '17:00',
                  clientName: 'Acme Corp',
                  hourlyRate: 75,
                  currency: 'USD',
                },
              },
            ]),
          },
        ],
      });

      // Dynamically import after mock is set up
      const { handleUserText } = await import('../src/nlp/index.js');

      const actions = await handleUserText(
        "Add today's work from 9am to 5pm for Acme Corp at $75/hour"
      );

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('create_entry');
      expect(actions[0].payload.clientName).toBe('Acme Corp');
      expect(actions[0].payload.hourlyRate).toBe(75);
    });

    it('should parse update_entry action', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                type: 'update_entry',
                target: { lastForClient: 'Acme' },
                payload: { hourlyRate: 100 },
              },
            ]),
          },
        ],
      });

      const { handleUserText } = await import('../src/nlp/index.js');

      const actions = await handleUserText(
        'Update my last entry for Acme and set rate to $100'
      );

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('update_entry');
      expect(actions[0].target.lastForClient).toBe('Acme');
      expect(actions[0].payload.hourlyRate).toBe(100);
    });

    it('should parse mark_paid action', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                type: 'mark_paid',
                target: { month: '2025-01', clientName: 'Tech Inc' },
              },
            ]),
          },
        ],
      });

      const { handleUserText } = await import('../src/nlp/index.js');

      const actions = await handleUserText(
        'Mark all January entries for Tech Inc as paid'
      );

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('mark_paid');
      expect(actions[0].target.month).toBe('2025-01');
      expect(actions[0].target.clientName).toBe('Tech Inc');
    });

    it('should parse show_summary action', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                type: 'show_summary',
                target: { month: '2025-01' },
              },
            ]),
          },
        ],
      });

      const { handleUserText } = await import('../src/nlp/index.js');

      const actions = await handleUserText('Show me summary for January');

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('show_summary');
      expect(actions[0].target.month).toBe('2025-01');
    });

    it('should handle multiple actions in one request', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([
              {
                type: 'create_entry',
                payload: {
                  date: '2025-01-18',
                  startTime: '09:00',
                  endTime: '12:00',
                  clientName: 'Client A',
                  hourlyRate: 75,
                  currency: 'USD',
                },
              },
              {
                type: 'create_entry',
                payload: {
                  date: '2025-01-18',
                  startTime: '13:00',
                  endTime: '17:00',
                  clientName: 'Client B',
                  hourlyRate: 100,
                  currency: 'EUR',
                },
              },
            ]),
          },
        ],
      });

      const { handleUserText } = await import('../src/nlp/index.js');

      const actions = await handleUserText(
        'Add morning session 9-12 for Client A at $75 and afternoon 1-5 for Client B at €100'
      );

      expect(actions).toHaveLength(2);
      expect(actions[0].payload.clientName).toBe('Client A');
      expect(actions[1].payload.clientName).toBe('Client B');
    });

    it('should strip markdown code blocks from response', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: '```json\n' + JSON.stringify([{ type: 'list_entries', target: { month: '2025-01' } }]) + '\n```',
          },
        ],
      });

      const { handleUserText } = await import('../src/nlp/index.js');

      const actions = await handleUserText('List entries for January');

      expect(actions).toHaveLength(1);
      expect(actions[0].type).toBe('list_entries');
    });

    it('should throw error when API key is missing', async () => {
      delete process.env.ANTHROPIC_API_KEY;

      const { handleUserText } = await import('../src/nlp/index.js');

      await expect(handleUserText('test')).rejects.toThrow(
        'ANTHROPIC_API_KEY environment variable is required'
      );
    });

    it('should throw error when response is not an array', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify({ type: 'create_entry' }), // Not an array
          },
        ],
      });

      const { handleUserText } = await import('../src/nlp/index.js');

      await expect(handleUserText('test')).rejects.toThrow(
        'Response must be an array of actions'
      );
    });

    it('should throw error when action is missing type', async () => {
      mockCreate.mockResolvedValue({
        content: [
          {
            type: 'text',
            text: JSON.stringify([{ payload: { test: 'data' } }]), // Missing type
          },
        ],
      });

      const { handleUserText } = await import('../src/nlp/index.js');

      await expect(handleUserText('test')).rejects.toThrow(
        'Each action must have a type field'
      );
    });
  });
});
