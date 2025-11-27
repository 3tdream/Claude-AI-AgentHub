/**
 * Tests for storage layer
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getAllEntries,
  addEntry,
  updateEntryById,
  deleteEntryById,
  findEntriesByFilter,
  getEntryById,
  clearAllEntries,
  calculateDuration,
  isValidTimeFormat,
  isValidDateFormat,
  validateWorkEntryInput,
  calculateEarnings,
  type WorkEntryInput,
} from '../src/storage/index.js';

describe('Storage Utils', () => {
  describe('calculateDuration', () => {
    it('should calculate duration for same-day work session', () => {
      expect(calculateDuration('09:00', '17:00')).toBe(8);
      expect(calculateDuration('09:30', '17:45')).toBe(8.25);
    });

    it('should handle overnight sessions', () => {
      expect(calculateDuration('23:00', '02:00')).toBe(3);
      expect(calculateDuration('22:30', '01:30')).toBe(3);
    });

    it('should handle 24-hour sessions', () => {
      expect(calculateDuration('00:00', '00:00')).toBe(0);
    });
  });

  describe('isValidTimeFormat', () => {
    it('should validate correct time formats', () => {
      expect(isValidTimeFormat('09:00')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
      expect(isValidTimeFormat('00:00')).toBe(true);
    });

    it('should reject invalid time formats', () => {
      expect(isValidTimeFormat('25:00')).toBe(false);
      expect(isValidTimeFormat('12:60')).toBe(false);
      expect(isValidTimeFormat('9:00')).toBe(false); // No leading zero
      expect(isValidTimeFormat('09:0')).toBe(false); // No leading zero
    });
  });

  describe('isValidDateFormat', () => {
    it('should validate correct date formats', () => {
      expect(isValidDateFormat('2025-01-18')).toBe(true);
      expect(isValidDateFormat('2024-12-31')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      expect(isValidDateFormat('2025-13-01')).toBe(false); // Invalid month
      expect(isValidDateFormat('2025-01-32')).toBe(false); // Invalid day
      expect(isValidDateFormat('25-01-18')).toBe(false); // Wrong format
      expect(isValidDateFormat('not-a-date')).toBe(false);
    });
  });

  describe('validateWorkEntryInput', () => {
    const validInput: WorkEntryInput = {
      date: '2025-01-18',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Acme Corp',
      hourlyRate: 75,
      currency: 'USD',
    };

    it('should return null for valid input', () => {
      expect(validateWorkEntryInput(validInput)).toBeNull();
    });

    it('should reject invalid date', () => {
      const invalid = { ...validInput, date: 'invalid' };
      expect(validateWorkEntryInput(invalid)).toContain('Invalid date format');
    });

    it('should reject invalid start time', () => {
      const invalid = { ...validInput, startTime: '25:00' };
      expect(validateWorkEntryInput(invalid)).toContain('Invalid start time');
    });

    it('should reject invalid end time', () => {
      const invalid = { ...validInput, endTime: 'invalid' };
      expect(validateWorkEntryInput(invalid)).toContain('Invalid end time');
    });

    it('should reject empty client name', () => {
      const invalid = { ...validInput, clientName: '' };
      expect(validateWorkEntryInput(invalid)).toContain('Client name is required');
    });

    it('should reject zero or negative rate', () => {
      const invalid = { ...validInput, hourlyRate: 0 };
      expect(validateWorkEntryInput(invalid)).toContain('greater than 0');
    });
  });

  describe('calculateEarnings', () => {
    it('should calculate earnings correctly', () => {
      const entry = {
        durationHours: 8,
        hourlyRate: 75,
      } as any;
      expect(calculateEarnings(entry)).toBe(600);
    });

    it('should handle decimal hours', () => {
      const entry = {
        durationHours: 8.5,
        hourlyRate: 75,
      } as any;
      expect(calculateEarnings(entry)).toBe(637.5);
    });
  });
});

describe('Storage Operations', () => {
  beforeEach(async () => {
    // Clear all entries before each test
    await clearAllEntries();
  });

  describe('getAllEntries', () => {
    it('should return empty array when no entries exist', async () => {
      const result = await getAllEntries();
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should return all entries', async () => {
      // Add two entries
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
        startTime: '10:00',
        endTime: '18:00',
        clientName: 'Client B',
        hourlyRate: 100,
        currency: 'EUR',
      });

      const result = await getAllEntries();
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('addEntry', () => {
    it('should add valid entry', async () => {
      const input: WorkEntryInput = {
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
        project: 'Website Redesign',
        notes: 'Initial consultation',
      };

      const result = await addEntry(input);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBeDefined();
      expect(result.data?.clientName).toBe('Acme Corp');
      expect(result.data?.durationHours).toBe(8);
      expect(result.data?.paymentStatus).toBe('pending');
      expect(result.data?.createdAt).toBeDefined();
      expect(result.data?.updatedAt).toBeDefined();
    });

    it('should reject invalid input', async () => {
      const invalid: WorkEntryInput = {
        date: 'invalid-date',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      };

      const result = await addEntry(invalid);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid date format');
    });

    it('should calculate duration automatically', async () => {
      const input: WorkEntryInput = {
        date: '2025-01-18',
        startTime: '09:30',
        endTime: '17:45',
        clientName: 'Test Client',
        hourlyRate: 50,
        currency: 'USD',
      };

      const result = await addEntry(input);
      expect(result.success).toBe(true);
      expect(result.data?.durationHours).toBe(8.25);
    });
  });

  describe('updateEntryById', () => {
    it('should update existing entry', async () => {
      // Add entry
      const addResult = await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      const entryId = addResult.data!.id;

      // Update entry
      const updateResult = await updateEntryById(entryId, {
        hourlyRate: 100,
        paymentStatus: 'paid',
        notes: 'Payment received',
      });

      expect(updateResult.success).toBe(true);
      expect(updateResult.data?.hourlyRate).toBe(100);
      expect(updateResult.data?.paymentStatus).toBe('paid');
      expect(updateResult.data?.notes).toBe('Payment received');
      expect(updateResult.data?.clientName).toBe('Acme Corp'); // Unchanged
    });

    it('should return error for non-existent entry', async () => {
      const result = await updateEntryById('non-existent-id', {
        hourlyRate: 100,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('deleteEntryById', () => {
    it('should delete existing entry', async () => {
      // Add entry
      const addResult = await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      const entryId = addResult.data!.id;

      // Delete entry
      const deleteResult = await deleteEntryById(entryId);
      expect(deleteResult.success).toBe(true);

      // Verify deletion
      const allEntries = await getAllEntries();
      expect(allEntries.data).toHaveLength(0);
    });

    it('should return error for non-existent entry', async () => {
      const result = await deleteEntryById('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('findEntriesByFilter', () => {
    beforeEach(async () => {
      // Add test data
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
        project: 'Mobile App',
        paymentStatus: 'pending',
      });

      await addEntry({
        date: '2025-01-20',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
        project: 'API Development',
        paymentStatus: 'paid',
      });
    });

    it('should filter by client name', async () => {
      const result = await findEntriesByFilter({ clientName: 'Acme' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should filter by date', async () => {
      const result = await findEntriesByFilter({ date: '2025-01-19' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].clientName).toBe('Tech Inc');
    });

    it('should filter by date range', async () => {
      const result = await findEntriesByFilter({
        dateFrom: '2025-01-18',
        dateTo: '2025-01-19',
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should filter by payment status', async () => {
      const result = await findEntriesByFilter({ paymentStatus: 'paid' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });

    it('should filter by project', async () => {
      const result = await findEntriesByFilter({ project: 'Website' });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
    });

    it('should filter by hourly rate range', async () => {
      const result = await findEntriesByFilter({
        minRate: 80,
        maxRate: 150,
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].clientName).toBe('Tech Inc');
    });

    it('should combine multiple filters', async () => {
      const result = await findEntriesByFilter({
        clientName: 'Acme',
        paymentStatus: 'paid',
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
    });
  });

  describe('getEntryById', () => {
    it('should retrieve entry by ID', async () => {
      const addResult = await addEntry({
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Acme Corp',
        hourlyRate: 75,
        currency: 'USD',
      });

      const entryId = addResult.data!.id;
      const getResult = await getEntryById(entryId);

      expect(getResult.success).toBe(true);
      expect(getResult.data?.id).toBe(entryId);
      expect(getResult.data?.clientName).toBe('Acme Corp');
    });

    it('should return error for non-existent ID', async () => {
      const result = await getEntryById('non-existent-id');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('clearAllEntries', () => {
    it('should clear all entries', async () => {
      // Add entries
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
        startTime: '10:00',
        endTime: '18:00',
        clientName: 'Client B',
        hourlyRate: 100,
        currency: 'EUR',
      });

      // Clear
      const clearResult = await clearAllEntries();
      expect(clearResult.success).toBe(true);

      // Verify
      const allEntries = await getAllEntries();
      expect(allEntries.data).toHaveLength(0);
    });
  });
});
