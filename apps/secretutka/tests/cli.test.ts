/**
 * Integration tests for CLI commands
 * These tests verify the CLI commands work end-to-end
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { clearAllEntries, getAllEntries } from '../src/storage/index.js';

// Helper to run CLI commands
function runCLI(args: string): string {
  try {
    return execSync(`tsx src/cli/index.ts ${args}`, {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'], // stdin, stdout, stderr
    });
  } catch (error: any) {
    // Combine stdout and stderr for error cases
    const stdout = error.stdout || '';
    const stderr = error.stderr || '';
    return stdout + stderr;
  }
}

describe('CLI Integration Tests', () => {
  beforeEach(async () => {
    // Clear all entries before each test
    await clearAllEntries();
  });

  describe('add command', () => {
    it('should add a new work entry', async () => {
      const output = runCLI('add 2025-01-18 09:00 17:00 "Acme Corp" 75 "Website Redesign"');

      expect(output).toContain('✅ Work session added successfully');
      expect(output).toContain('Date:        2025-01-18');
      expect(output).toContain('Client:      Acme Corp');
      expect(output).toContain('Duration:    8 hours');

      // Verify entry was stored
      const result = await getAllEntries();
      expect(result.data).toHaveLength(1);
      expect(result.data![0].clientName).toBe('Acme Corp');
    });

    it('should handle optional parameters', async () => {
      const output = runCLI(
        'add 2025-01-18 09:00 17:00 "Test Client" 100 -c EUR -n "Some notes" -s paid'
      );

      expect(output).toContain('✅ Work session added successfully');
      expect(output).toMatch(/€\d+/); // Check for Euro symbol
      expect(output).toContain('Notes:       Some notes');
      expect(output).toContain('paid');
    });

    it('should reject invalid date format', async () => {
      const output = runCLI('add 01-18-2025 09:00 17:00 "Client" 75');

      expect(output).toContain('❌ Error');
      expect(output).toContain('Invalid date format');
    });

    it('should reject invalid time format', async () => {
      const output = runCLI('add 2025-01-18 9:00 17:00 "Client" 75');

      expect(output).toContain('❌ Error');
      expect(output).toContain('Invalid');
    });
  });

  describe('list command', () => {
    beforeEach(async () => {
      // Add test data
      await clearAllEntries();
      runCLI('add 2025-01-18 09:00 17:00 "Client A" 75 "Project A"');
      runCLI('add 2025-01-19 10:00 18:00 "Client B" 100 "Project B"');
      runCLI('add 2025-02-15 09:00 17:00 "Client C" 50');
    });

    it('should list entries for a specific month', () => {
      const output = runCLI('list month 2025-01');

      expect(output).toContain('Found 2 entries');
      expect(output).toContain('Client A');
      expect(output).toContain('Client B');
      expect(output).not.toContain('Client C'); // Different month
      expect(output).toContain('Total Hours');
      expect(output).toContain('Total Earnings');
    });

    it('should show "no entries" message when month is empty', () => {
      const output = runCLI('list month 2025-03');

      expect(output).toContain('No entries found');
    });

    it('should filter by client name', () => {
      const output = runCLI('list month 2025-01 --client "Client A"');

      expect(output).toContain('Found 1 entries');
      expect(output).toContain('Client A');
      expect(output).not.toContain('Client B');
    });

    it('should reject invalid month format', () => {
      const output = runCLI('list month 2025');

      expect(output).toContain('❌ Error');
      expect(output).toContain('YYYY-MM format');
    });
  });

  describe('delete command', () => {
    it('should delete entry with confirmation flag', async () => {
      // Add entry
      runCLI('add 2025-01-18 09:00 17:00 "Test Client" 75');

      // Get entry ID
      const entries = await getAllEntries();
      const entryId = entries.data![0].id;

      // Delete with -y flag (skip confirmation)
      const output = runCLI(`delete ${entryId} -y`);

      expect(output).toContain('✅ Entry deleted successfully');

      // Verify deletion
      const afterDelete = await getAllEntries();
      expect(afterDelete.data).toHaveLength(0);
    });

    it('should show error for non-existent entry', () => {
      const output = runCLI('delete non-existent-id -y');

      expect(output).toContain('❌ Error');
      expect(output).toContain('not found');
    });
  });

  describe('summary command', () => {
    beforeEach(async () => {
      // Add test data
      await clearAllEntries();
      runCLI('add 2025-01-18 09:00 17:00 "Acme Corp" 75 "Website" -s paid');
      runCLI('add 2025-01-19 10:00 18:00 "Acme Corp" 75 "Mobile App" -s pending');
      runCLI('add 2025-01-20 09:00 17:00 "Tech Inc" 100 "API" -s paid');
    });

    it('should show monthly summary with statistics', () => {
      const output = runCLI('summary month 2025-01');

      expect(output).toContain('📊 Summary for 2025-01');
      expect(output).toContain('Overall Statistics');
      expect(output).toContain('Total Sessions:  3');
      expect(output).toContain('Total Hours');
      expect(output).toContain('Total Earnings');
      expect(output).toContain('Avg Rate');
      expect(output).toContain('Payment Status');
      expect(output).toContain('Breakdown by Client');
    });

    it('should group by client by default', () => {
      const output = runCLI('summary month 2025-01');

      expect(output).toContain('Acme Corp');
      expect(output).toContain('Tech Inc');
      expect(output).toContain('Sessions: 2'); // Acme Corp has 2 sessions
    });

    it('should group by project when specified', () => {
      const output = runCLI('summary month 2025-01 --group-by project');

      expect(output).toContain('Breakdown by Project');
      expect(output).toContain('Website');
      expect(output).toContain('Mobile App');
      expect(output).toContain('API');
    });

    it('should show payment status breakdown', () => {
      const output = runCLI('summary month 2025-01');

      expect(output).toContain('Payment Status');
      expect(output).toContain('paid');
      expect(output).toContain('pending');
    });
  });
});
