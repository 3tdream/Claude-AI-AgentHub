/**
 * Phase 7 Tests: Reports & analytics
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { executeAction } from '../src/core/executor.js';
import { addEntry, clearAllEntries } from '../src/storage/index.js';
import type { ShowSummaryAction } from '../src/core/types.js';

describe('Phase 7: Reports & Analytics', () => {
  beforeEach(async () => {
    await clearAllEntries();

    // Create test data with multiple entries across different clients and dates
    await addEntry({
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Acme Corp',
      hourlyRate: 100,
      currency: 'USD',
      project: 'Website Redesign',
      paymentStatus: 'paid',
    });

    await addEntry({
      date: '2025-01-16',
      startTime: '10:00',
      endTime: '14:00',
      clientName: 'Tech Inc',
      hourlyRate: 150,
      currency: 'USD',
      project: 'Mobile App',
      paymentStatus: 'pending',
    });

    await addEntry({
      date: '2025-01-17',
      startTime: '09:00',
      endTime: '13:00',
      clientName: 'Acme Corp',
      hourlyRate: 100,
      currency: 'USD',
      project: 'API Development',
      paymentStatus: 'paid',
    });

    await addEntry({
      date: '2025-02-01',
      startTime: '10:00',
      endTime: '18:00',
      clientName: 'StartupXYZ',
      hourlyRate: 120,
      currency: 'USD',
      project: 'Consulting',
      paymentStatus: 'overdue',
    });
  });

  afterEach(async () => {
    await clearAllEntries();
  });

  describe('Basic Summary', () => {
    it('should generate summary for all entries', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data.totalSessions).toBe(4);
      expect(result.data.totalHours).toBeGreaterThan(0);
      expect(result.data.totalEarnings).toBeGreaterThan(0);
      expect(result.data.avgRate).toBeGreaterThan(0);
    });

    it('should include payment status breakdown', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.statusBreakdown).toBeDefined();
      expect(result.data.statusBreakdown.paid).toBe(2);
      expect(result.data.statusBreakdown.pending).toBe(1);
      expect(result.data.statusBreakdown.overdue).toBe(1);
    });

    it('should return all entries in summary data', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.entries).toBeDefined();
      expect(result.data.entries.length).toBe(4);
    });
  });

  describe('Date Range Summary', () => {
    it('should generate summary for specific month', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(3); // 3 entries in January
      expect(result.data.entries.length).toBe(3);
    });

    it('should generate summary for month with no entries', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2024-12' }, // No entries in this month
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(0);
      expect(result.data.totalHours).toBe(0);
      expect(result.data.totalEarnings).toBe(0);
      expect(result.message).toContain('No entries found');
    });
  });

  describe('Grouped Reports', () => {
    it('should group summary by client', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        payload: { groupBy: 'client' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.grouped).toBeDefined();

      // Check Acme Corp group (2 entries)
      expect(result.data.grouped['Acme Corp']).toBeDefined();
      expect(result.data.grouped['Acme Corp'].count).toBe(2);
      expect(result.data.grouped['Acme Corp'].hours).toBeGreaterThan(0);
      expect(result.data.grouped['Acme Corp'].earnings).toBeGreaterThan(0);

      // Check Tech Inc group (1 entry)
      expect(result.data.grouped['Tech Inc']).toBeDefined();
      expect(result.data.grouped['Tech Inc'].count).toBe(1);

      // Check StartupXYZ group (1 entry)
      expect(result.data.grouped['StartupXYZ']).toBeDefined();
      expect(result.data.grouped['StartupXYZ'].count).toBe(1);
    });

    it('should group summary by project', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        payload: { groupBy: 'project' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.grouped).toBeDefined();

      // Check individual projects
      expect(result.data.grouped['Website Redesign']).toBeDefined();
      expect(result.data.grouped['Website Redesign'].count).toBe(1);

      expect(result.data.grouped['Mobile App']).toBeDefined();
      expect(result.data.grouped['Mobile App'].count).toBe(1);

      expect(result.data.grouped['API Development']).toBeDefined();
      expect(result.data.grouped['API Development'].count).toBe(1);

      expect(result.data.grouped['Consulting']).toBeDefined();
      expect(result.data.grouped['Consulting'].count).toBe(1);
    });

    it('should default to grouping by client when groupBy not specified', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.grouped).toBeDefined();

      // Should be grouped by client by default
      expect(result.data.grouped['Acme Corp']).toBeDefined();
      expect(result.data.grouped['Tech Inc']).toBeDefined();
    });
  });

  describe('Filtered Summary', () => {
    it('should generate summary for specific client', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { clientName: 'Acme Corp' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(2); // Only Acme Corp entries
      expect(result.data.entries.every((e: any) => e.clientName === 'Acme Corp')).toBe(true);
    });

    it('should generate summary for specific project', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { project: 'Mobile App' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(1); // Only Mobile App entry
      expect(result.data.entries[0].project).toBe('Mobile App');
    });

    it('should generate summary for specific payment status', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { paymentStatus: 'paid' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(2); // 2 paid entries
      expect(result.data.entries.every((e: any) => e.paymentStatus === 'paid')).toBe(true);
    });

    it('should combine multiple filters (month + client)', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: {
          month: '2025-01',
          clientName: 'Acme Corp',
        },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(2); // 2 Acme Corp entries in January
      expect(result.data.entries.every((e: any) =>
        e.clientName === 'Acme Corp' && e.date.startsWith('2025-01')
      )).toBe(true);
    });
  });

  describe('Summary Calculations', () => {
    it('should calculate correct total hours', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      // Entry 1: 8h, Entry 2: 4h, Entry 3: 4h = 16h total
      expect(result.data.totalHours).toBe(16);
    });

    it('should calculate correct total earnings', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      // Entry 1: 8h * $100 = $800
      // Entry 2: 4h * $150 = $600
      // Entry 3: 4h * $100 = $400
      // Total = $1800
      expect(result.data.totalEarnings).toBe(1800);
    });

    it('should calculate average hourly rate', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      // Average of $100, $150, $100 = $116.67
      expect(result.data.avgRate).toBeCloseTo(116.67, 1);
    });

    it('should calculate group earnings correctly', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { month: '2025-01' },
        payload: { groupBy: 'client' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);

      // Acme Corp: 8h * $100 + 4h * $100 = $1200
      expect(result.data.grouped['Acme Corp'].earnings).toBe(1200);

      // Tech Inc: 4h * $150 = $600
      expect(result.data.grouped['Tech Inc'].earnings).toBe(600);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty database gracefully', async () => {
      await clearAllEntries();

      const action: ShowSummaryAction = {
        type: 'show_summary',
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(0);
      expect(result.data.totalHours).toBe(0);
      expect(result.data.totalEarnings).toBe(0);
      expect(result.message).toContain('No entries found');
    });

    it('should handle summary with no matching filters', async () => {
      const action: ShowSummaryAction = {
        type: 'show_summary',
        target: { clientName: 'NonExistentClient' },
      };

      const result = await executeAction(action);

      expect(result.success).toBe(true);
      expect(result.data.totalSessions).toBe(0);
      expect(result.message).toContain('No entries found');
    });
  });
});
