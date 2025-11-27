/**
 * Tests for action executor
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  executeAction,
  executeActions,
  type AgentAction,
  type CreateEntryAction,
  type UpdateEntryAction,
  type DeleteEntryAction,
  type ShowSummaryAction,
  type ListEntriesAction,
} from '../src/core/index.js';
import { clearAllEntries, addEntry } from '../src/storage/index.js';

describe('Action Executor', () => {
  beforeEach(async () => {
    await clearAllEntries();
  });

  describe('create_entry action', () => {
    it('should create a new entry', async () => {
      const action: CreateEntryAction = {
        type: 'create_entry',
        payload: {
          date: '2025-01-18',
          startTime: '09:00',
          endTime: '17:00',
          clientName: 'Test Client',
          hourlyRate: 75,
          currency: 'USD',
        },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.clientName).toBe('Test Client');
      expect(result.message).toContain('Created work session');
    });

    it('should reject invalid entry data', async () => {
      const action: CreateEntryAction = {
        type: 'create_entry',
        payload: {
          date: 'invalid-date',
          startTime: '09:00',
          endTime: '17:00',
          clientName: 'Test Client',
          hourlyRate: 75,
          currency: 'USD',
        },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date format');
    });
  });

  describe('update_entry action', () => {
    it('should update entry by ID', async () => {
      // Create entry first
      const createResult = await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Test Client',
        hourlyRate: 75,
        currency: 'USD',
      });

      const entryId = createResult.data!.id;

      // Update it
      const action: UpdateEntryAction = {
        type: 'update_entry',
        target: { id: entryId },
        payload: { hourlyRate: 100, paymentStatus: 'paid' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data[0].hourlyRate).toBe(100);
      expect(result.data[0].paymentStatus).toBe('paid');
    });

    it('should update entries by client name', async () => {
      // Create two entries for same client
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      await addEntry({
        date: '2025-01-19',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      const action: UpdateEntryAction = {
        type: 'update_entry',
        target: { clientName: 'Acme' },
        payload: { paymentStatus: 'paid' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].paymentStatus).toBe('paid');
      expect(result.data[1].paymentStatus).toBe('paid');
    });

    it('should return error when no entries match target', async () => {
      const action: UpdateEntryAction = {
        type: 'update_entry',
        target: { clientName: 'NonExistent' },
        payload: { hourlyRate: 100 },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(false);
      expect(result.error).toContain('No entries found');
    });
  });

  describe('delete_entry action', () => {
    it('should delete entry by ID', async () => {
      const createResult = await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Test Client',
        hourlyRate: 75,
        currency: 'USD',
      });

      const entryId = createResult.data!.id;

      const action: DeleteEntryAction = {
        type: 'delete_entry',
        target: { id: entryId },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toBe(1); // One entry deleted
      expect(result.message).toContain('Deleted 1');
    });

    it('should delete multiple entries by date range', async () => {
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Client A',
        hourlyRate: 75,
        currency: 'USD',
      });

      await addEntry({
        date: '2025-01-19',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Client B',
        hourlyRate: 75,
        currency: 'USD',
      });

      const action: DeleteEntryAction = {
        type: 'delete_entry',
        target: { dateFrom: '2025-01-18', dateTo: '2025-01-19' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toBe(2);
    });
  });

  describe('mark_paid action', () => {
    it('should mark entries as paid', async () => {
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Test Client',
        hourlyRate: 75,
        currency: 'USD',
        paymentStatus: 'pending',
      });

      const action: AgentAction = {
        type: 'mark_paid',
        target: { clientName: 'Test Client' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data[0].paymentStatus).toBe('paid');
    });
  });

  describe('show_summary action', () => {
    beforeEach(async () => {
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
        project: 'Website',
        paymentStatus: 'paid',
      });

      await addEntry({
        date: '2025-01-19',
        startTime: '10:00',
        endTime: '18:00',
        clientName: 'Tech Inc',
        hourlyRate: 100,
        currency: 'EUR',
        project: 'API',
        paymentStatus: 'pending',
      });
    });

    it('should show summary for month', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(2);
      expect(result.data.totalHours).toBe(16);
      expect(result.data.totalEarnings).toBeGreaterThan(0);
      expect(result.data.grouped).toBeDefined();
      expect(result.data.statusBreakdown).toBeDefined();
    });

    it('should group summary by client', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
        payload: { groupBy: 'client' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.grouped['Acme Corp']).toBeDefined();
      expect(result.data.grouped['Tech Inc']).toBeDefined();
    });

    it('should group summary by project', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
        payload: { groupBy: 'project' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.grouped['Website']).toBeDefined();
      expect(result.data.grouped['API']).toBeDefined();
    });
  });

  describe('list_entries action', () => {
    beforeEach(async () => {
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Client A',
        hourlyRate: 75,
        currency: 'USD',
      });

      await addEntry({
        date: '2025-01-19',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Client B',
        hourlyRate: 100,
        currency: 'EUR',
      });
    });

    it('should list all entries for month', async () => {
      const action: ListEntriesAction = {
        type: 'list_entries',
        target: { month: '2025-01' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.message).toContain('Found 2');
    });

    it('should filter entries by client', async () => {
      const action: ListEntriesAction = {
        type: 'list_entries',
        target: { clientName: 'Client A' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].clientName).toBe('Client A');
    });
  });

  describe('get_entry action', () => {
    it('should get entry by ID', async () => {
      const createResult = await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Test Client',
        hourlyRate: 75,
        currency: 'USD',
      });

      const entryId = createResult.data!.id;

      const action: AgentAction = {
        type: 'get_entry',
        target: { id: entryId },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.id).toBe(entryId);
      expect(result.data.clientName).toBe('Test Client');
    });

    it('should return error when multiple entries match', async () => {
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      await addEntry({
        date: '2025-01-19',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      const action: AgentAction = {
        type: 'get_entry',
        target: { clientName: 'Acme' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Multiple entries found');
    });
  });

  describe('executeActions (batch)', () => {
    it('should execute multiple actions in sequence', async () => {
      const actions: AgentAction[] = [
        {
          type: 'create_entry',
          payload: {
            date: '2025-01-18',
            startTime: '09:00',
            endTime: '17:00',
            clientName: 'Client A',
            hourlyRate: 75,
            currency: 'USD',
          },
        },
        {
          type: 'create_entry',
          payload: {
            date: '2025-01-19',
            startTime: '09:00',
            endTime: '17:00',
            clientName: 'Client B',
            hourlyRate: 100,
            currency: 'EUR',
          },
        },
        {
          type: 'list_entries',
          target: { month: '2025-01' },
        },
      ];

      const results = await executeActions(actions);

      expect(results).toHaveLength(3);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[2].success).toBe(true);
      expect(results[2].data).toHaveLength(2);
    });
  });

  describe('target resolution', () => {
    it('should resolve "last" entry', async () => {
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Client A',
        hourlyRate: 75,
        currency: 'USD',
      });

      await addEntry({
        date: '2025-01-19',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Client B',
        hourlyRate: 100,
        currency: 'EUR',
      });

      const action: UpdateEntryAction = {
        type: 'update_entry',
        target: { last: true },
        payload: { notes: 'This is the last entry' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].clientName).toBe('Client B'); // Most recent
    });

    it('should resolve "lastForClient"', async () => {
      await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      await addEntry({
        date: '2025-01-19',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      await addEntry({
        date: '2025-01-20',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Tech Inc',
        hourlyRate: 100,
        currency: 'EUR',
      });

      const action: UpdateEntryAction = {
        type: 'update_entry',
        target: { lastForClient: 'Acme' },
        payload: { paymentStatus: 'paid' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].date).toBe('2025-01-19'); // Latest Acme entry
    });
  });
});
