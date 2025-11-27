/**
 * Utility functions for storage operations
 */

import type { WorkEntry, WorkEntryInput } from './types.js';

/**
 * Generate unique ID for work entry
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Calculate duration in hours from start and end time
 * @param startTime HH:MM format
 * @param endTime HH:MM format
 * @returns duration in hours (can be decimal)
 */
export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;

  // Handle overnight sessions (e.g., 23:00 to 02:00)
  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const durationMinutes = endMinutes - startMinutes;
  return Math.round((durationMinutes / 60) * 100) / 100; // Round to 2 decimals
}

/**
 * Validate time format (HH:MM) - requires leading zeros
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(date: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;

  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}

/**
 * Create full WorkEntry from input
 */
export function createWorkEntry(input: WorkEntryInput): WorkEntry {
  const now = new Date().toISOString();
  const duration =
    input.durationHours ?? calculateDuration(input.startTime, input.endTime);

  return {
    id: generateId(),
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    durationHours: duration,
    clientName: input.clientName,
    hourlyRate: input.hourlyRate,
    currency: input.currency,
    project: input.project,
    notes: input.notes,
    paymentStatus: input.paymentStatus ?? 'pending',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Validate work entry input
 */
export function validateWorkEntryInput(input: WorkEntryInput): string | null {
  if (!isValidDateFormat(input.date)) {
    return `Invalid date format: ${input.date}. Expected YYYY-MM-DD`;
  }

  if (!isValidTimeFormat(input.startTime)) {
    return `Invalid start time format: ${input.startTime}. Expected HH:MM`;
  }

  if (!isValidTimeFormat(input.endTime)) {
    return `Invalid end time format: ${input.endTime}. Expected HH:MM`;
  }

  if (!input.clientName || input.clientName.trim().length === 0) {
    return 'Client name is required';
  }

  if (input.hourlyRate <= 0) {
    return 'Hourly rate must be greater than 0';
  }

  return null;
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Calculate total earnings for an entry
 */
export function calculateEarnings(entry: WorkEntry): number {
  return Math.round(entry.durationHours * entry.hourlyRate * 100) / 100;
}
