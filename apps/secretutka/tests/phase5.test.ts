/**
 * Phase 5 Tests: Dry-run mode and confirmation flows
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { executeAction } from '../src/core/executor.js';
import { addEntry, clearAllEntries, getAllEntries } from '../src/storage/index.js';
import type { CreateEntryAction, UpdateEntryAction, DeleteEntryAction, MarkPaidAction } from '../src/core/types.js';

describe('Phase 5: Dry-run Mode and Confirmation', () => {
  beforeEach(async () => {
    // Clean up before each test
    await clearAllEntries();
  });

  afterEach(async () => {
    // Clean up after each test
    await clearAllEntries();
  });

  it('should return preview for create_entry in dry-run mode without creating entry', async () => {
    const action: CreateEntryAction = {
      type: 'create_entry',
      payload: {
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Test Client',
        hourlyRate: 100,
        currency: 'USD',
        project: 'Test Project',
      },
      dryRun: true,
    };

    const result = await executeAction(action);

    // Should succeed
    expect(result.success).toBe(true);

    // Should have preview
    expect(result.preview).toBeDefined();
    expect(result.preview?.action).toContain('Create new work session');
    expect(result.preview?.affectedEntries).toHaveLength(1);
    expect(result.preview?.affectedEntries?.[0].clientName).toBe('Test Client');
    expect(result.preview?.isDestructive).toBe(false);

    // Should have affected count
    expect(result.affectedCount).toBe(1);

    // Should NOT have actually created the entry
    const allEntries = await getAllEntries();
    expect(allEntries.data).toHaveLength(0);
  });

  it('should return preview for update_entry in dry-run mode without updating', async () => {
    // Create test entries
    const entry1 = await addEntry({
      date: '2025-01-18',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Acme Corp',
      hourlyRate: 75,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    const entry2 = await addEntry({
      date: '2025-01-19',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Acme Corp',
      hourlyRate: 75,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    const action: UpdateEntryAction = {
      type: 'update_entry',
      target: { clientName: 'Acme' },
      payload: { hourlyRate: 100 },
      dryRun: true,
    };

    const result = await executeAction(action);

    // Should succeed
    expect(result.success).toBe(true);

    // Should have preview
    expect(result.preview).toBeDefined();
    expect(result.preview?.action).toContain('Update 2 entry/entries');
    expect(result.preview?.affectedEntries).toHaveLength(2);
    expect(result.affectedCount).toBe(2);

    // Should NOT have actually updated entries
    const entry1After = await getAllEntries();
    const acmeEntries = entry1After.data?.filter((e) => e.clientName === 'Acme Corp') || [];
    expect(acmeEntries[0].hourlyRate).toBe(75); // Still original rate
    expect(acmeEntries[1].hourlyRate).toBe(75); // Still original rate
  });

  it('should return preview for delete_entry in dry-run mode without deleting', async () => {
    // Create test entries
    await addEntry({
      date: '2025-01-18',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Test Client',
      hourlyRate: 100,
      currency: 'USD',
    });

    await addEntry({
      date: '2025-01-19',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Test Client',
      hourlyRate: 100,
      currency: 'USD',
    });

    const action: DeleteEntryAction = {
      type: 'delete_entry',
      target: { clientName: 'Test Client' },
      dryRun: true,
    };

    const result = await executeAction(action);

    // Should succeed
    expect(result.success).toBe(true);

    // Should have preview
    expect(result.preview).toBeDefined();
    expect(result.preview?.action).toContain('Delete 2 entry/entries');
    expect(result.preview?.isDestructive).toBe(true); // Delete is destructive
    expect(result.preview?.affectedEntries).toHaveLength(2);
    expect(result.affectedCount).toBe(2);

    // Should NOT have actually deleted entries
    const allEntries = await getAllEntries();
    expect(allEntries.data).toHaveLength(2);
  });

  it('should return preview for mark_paid action in dry-run mode without updating status', async () => {
    // Create test entries
    await addEntry({
      date: '2025-01-18',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Acme Corp',
      hourlyRate: 75,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    await addEntry({
      date: '2025-01-19',
      startTime: '09:00',
      endTime: '17:00',
      clientName: 'Acme Corp',
      hourlyRate: 75,
      currency: 'USD',
      paymentStatus: 'pending',
    });

    const action: MarkPaidAction = {
      type: 'mark_paid',
      target: { clientName: 'Acme' },
      dryRun: true,
    };

    const result = await executeAction(action);

    // Should succeed
    expect(result.success).toBe(true);

    // Should have preview
    expect(result.preview).toBeDefined();
    expect(result.affectedCount).toBe(2);

    // Should NOT have actually updated payment status
    const allEntries = await getAllEntries();
    const acmeEntries = allEntries.data?.filter((e) => e.clientName === 'Acme Corp') || [];
    expect(acmeEntries[0].paymentStatus).toBe('pending'); // Still pending
    expect(acmeEntries[1].paymentStatus).toBe('pending'); // Still pending
  });

  it('should execute action normally when dry-run is false or not set', async () => {
    // Test that normal execution still works
    const action: CreateEntryAction = {
      type: 'create_entry',
      payload: {
        date: '2025-01-18',
        startTime: '09:00',
        endTime: '17:00',
        clientName: 'Real Client',
        hourlyRate: 100,
        currency: 'USD',
      },
      dryRun: false, // Explicitly false
    };

    const result = await executeAction(action);

    // Should succeed
    expect(result.success).toBe(true);

    // Should have data (the created entry)
    expect(result.data).toBeDefined();
    expect(result.data?.clientName).toBe('Real Client');

    // Should have actually created the entry
    const allEntries = await getAllEntries();
    expect(allEntries.data).toHaveLength(1);
    expect(allEntries.data?.[0].clientName).toBe('Real Client');
  });
});
