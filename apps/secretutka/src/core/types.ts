/**
 * Agent action types and execution layer
 */

import type { WorkEntryInput, WorkEntryUpdate, PaymentStatus } from '../storage/types.js';

/**
 * Action types that the agent can perform
 */
export type ActionType =
  | 'create_entry'
  | 'update_entry'
  | 'delete_entry'
  | 'mark_paid'
  | 'mark_pending'
  | 'mark_overdue'
  | 'show_summary'
  | 'list_entries'
  | 'get_entry';

/**
 * Target specification for actions
 * Used to identify which entry/entries to operate on
 */
export interface ActionTarget {
  // Direct ID reference
  id?: string;

  // Date-based targeting
  date?: string; // Specific date
  dateFrom?: string;
  dateTo?: string;
  month?: string; // YYYY-MM format

  // Client/project targeting
  clientName?: string;
  project?: string;

  // Status-based targeting
  paymentStatus?: PaymentStatus;

  // Special selectors
  last?: boolean; // Target last entry
  lastForClient?: string; // Last entry for specific client
}

/**
 * Base agent action structure
 */
export interface AgentAction {
  type: ActionType;
  target?: ActionTarget;
  payload?: any;
  dryRun?: boolean; // Preview mode - don't actually modify data
  requiresConfirmation?: boolean; // Should prompt user before executing
}

/**
 * Specific action types with typed payloads
 */
export interface CreateEntryAction extends AgentAction {
  type: 'create_entry';
  payload: WorkEntryInput;
}

export interface UpdateEntryAction extends AgentAction {
  type: 'update_entry';
  target: ActionTarget;
  payload: WorkEntryUpdate;
}

export interface DeleteEntryAction extends AgentAction {
  type: 'delete_entry';
  target: ActionTarget;
}

export interface MarkPaidAction extends AgentAction {
  type: 'mark_paid' | 'mark_pending' | 'mark_overdue';
  target: ActionTarget;
}

export interface ShowSummaryAction extends AgentAction {
  type: 'show_summary';
  target?: ActionTarget;
  payload?: {
    groupBy?: 'client' | 'project';
  };
}

export interface ListEntriesAction extends AgentAction {
  type: 'list_entries';
  target?: ActionTarget;
}

export interface GetEntryAction extends AgentAction {
  type: 'get_entry';
  target: ActionTarget;
}

/**
 * Result of executing an action
 */
export interface ActionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string; // Human-readable success message
  preview?: ActionPreview; // Preview information for dry-run mode
  affectedCount?: number; // Number of entries that would be affected
}

/**
 * Preview information for actions
 */
export interface ActionPreview {
  action: string; // Description of what will happen
  affectedEntries?: Array<{
    id: string;
    date: string;
    clientName: string;
    summary: string; // Brief description
  }>;
  changes?: Record<string, { from: any; to: any }>; // What will change
  isDestructive?: boolean; // Whether this action deletes data
}

/**
 * Context for action execution (optional metadata)
 */
export interface ActionContext {
  userId?: string;
  timestamp?: string;
  source?: 'cli' | 'voice' | 'llm' | 'api';
}
