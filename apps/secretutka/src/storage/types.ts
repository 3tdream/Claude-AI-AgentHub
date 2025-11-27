/**
 * Storage types for work entry tracking
 */

export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'ILS' | 'CAD' | 'AUD';

/**
 * Core work entry structure
 */
export interface WorkEntry {
  id: string;
  date: string; // ISO 8601 format: YYYY-MM-DD
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  durationHours: number; // Calculated or manual
  clientName: string;
  hourlyRate: number;
  currency: Currency;
  project?: string;
  ticketId?: string; // Ticket/task ID for tracking
  notes?: string;
  paymentStatus?: PaymentStatus;
  createdAt: string; // ISO 8601 timestamp
  updatedAt: string; // ISO 8601 timestamp
}

/**
 * Input for creating new work entry (omits generated fields)
 */
export interface WorkEntryInput {
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  hourlyRate: number;
  currency: Currency;
  project?: string;
  ticketId?: string; // Ticket/task ID for tracking
  notes?: string;
  paymentStatus?: PaymentStatus;
  durationHours?: number; // Optional - will be calculated if not provided
}

/**
 * Partial update for existing entry
 */
export type WorkEntryUpdate = Partial<Omit<WorkEntry, 'id' | 'createdAt'>>;

/**
 * Filter criteria for querying entries
 */
export interface WorkEntryFilter {
  id?: string;
  clientName?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  paymentStatus?: PaymentStatus;
  project?: string;
  minRate?: number;
  maxRate?: number;
}

/**
 * Root structure of worklog.json
 */
export interface WorklogData {
  entries: WorkEntry[];
}

/**
 * Storage operation result
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
