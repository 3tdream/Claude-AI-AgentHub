/**
 * Agent action executor
 * Translates high-level actions into storage operations
 */

import type {
  AgentAction,
  ActionResult,
  ActionTarget,
  ActionPreview,
  CreateEntryAction,
  UpdateEntryAction,
  DeleteEntryAction,
  MarkPaidAction,
  ShowSummaryAction,
  ListEntriesAction,
  GetEntryAction,
} from './types.js';

import {
  addEntry,
  updateEntryById,
  deleteEntryById,
  findEntriesByFilter,
  getEntryById,
  calculateEarnings,
  type WorkEntry,
  type WorkEntryFilter,
  type PaymentStatus,
} from '../storage/index.js';

/**
 * Build preview information for affected entries
 */
async function buildPreview(
  entryIds: string[],
  actionDescription: string,
  changes?: Record<string, { from: any; to: any }>,
  isDestructive = false
): Promise<ActionPreview> {
  const affectedEntries: ActionPreview['affectedEntries'] = [];

  for (const id of entryIds) {
    const result = await getEntryById(id);
    if (result.success && result.data) {
      const entry = result.data;
      const earnings = calculateEarnings(entry);
      affectedEntries.push({
        id: entry.id,
        date: entry.date,
        clientName: entry.clientName,
        summary: `${entry.durationHours}h - ${earnings.toFixed(2)} ${entry.currency}${entry.project ? ` - ${entry.project}` : ''}`,
      });
    }
  }

  return {
    action: actionDescription,
    affectedEntries,
    changes,
    isDestructive,
  };
}

/**
 * Resolve action target to specific entry IDs
 * Handles various targeting strategies
 */
async function resolveTarget(target: ActionTarget): Promise<string[]> {
  const filter: WorkEntryFilter = {};

  // Direct ID
  if (target.id) {
    return [target.id];
  }

  // Date-based
  if (target.date) {
    filter.date = target.date;
  }
  if (target.dateFrom) {
    filter.dateFrom = target.dateFrom;
  }
  if (target.dateTo) {
    filter.dateTo = target.dateTo;
  }

  // Month format (YYYY-MM) -> convert to date range
  if (target.month) {
    const [year, month] = target.month.split('-');
    filter.dateFrom = `${year}-${month}-01`;
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
    filter.dateTo = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
  }

  // Client/project
  if (target.clientName) {
    filter.clientName = target.clientName;
  }
  if (target.project) {
    filter.project = target.project;
  }

  // Payment status
  if (target.paymentStatus) {
    filter.paymentStatus = target.paymentStatus;
  }

  // Find matching entries
  const result = await findEntriesByFilter(filter);

  if (!result.success || !result.data) {
    return [];
  }

  let entries = result.data;

  // Special selectors
  if (target.last) {
    // Sort by date desc and take first
    entries.sort((a, b) => {
      const dateCompare = b.date.localeCompare(a.date);
      if (dateCompare !== 0) return dateCompare;
      return b.createdAt.localeCompare(a.createdAt);
    });
    entries = entries.slice(0, 1);
  }

  if (target.lastForClient) {
    // Filter by client and take most recent
    entries = entries.filter((e) =>
      e.clientName.toLowerCase().includes(target.lastForClient!.toLowerCase())
    );
    entries.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    entries = entries.slice(0, 1);
  }

  return entries.map((e) => e.id);
}

/**
 * Execute a create entry action
 */
async function executeCreateEntry(
  action: CreateEntryAction
): Promise<ActionResult<WorkEntry>> {
  // Dry-run mode: Show preview of what would be created
  if (action.dryRun) {
    const { date, startTime, endTime, clientName, project, hourlyRate, currency } = action.payload;
    const preview: ActionPreview = {
      action: 'Create new work session',
      affectedEntries: [
        {
          id: '<new>',
          date: date || new Date().toISOString().split('T')[0],
          clientName: clientName || 'Unknown',
          summary: `${startTime || '?'} - ${endTime || '?'} - ${hourlyRate || 0} ${currency || 'USD'}/h${project ? ` - ${project}` : ''}`,
        },
      ],
      isDestructive: false,
    };

    return {
      success: true,
      data: undefined,
      message: 'Preview: Would create new work session',
      preview,
      affectedCount: 1,
    };
  }

  const result = await addEntry(action.payload);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  const earnings = calculateEarnings(result.data!);

  return {
    success: true,
    data: result.data,
    message: `Created work session for ${result.data!.clientName} on ${result.data!.date}. Earnings: ${earnings.toFixed(2)} ${result.data!.currency}`,
  };
}

/**
 * Execute an update entry action
 */
async function executeUpdateEntry(
  action: UpdateEntryAction
): Promise<ActionResult<WorkEntry[]>> {
  if (!action.target) {
    return {
      success: false,
      error: 'Update action requires a target',
    };
  }

  const targetIds = await resolveTarget(action.target);

  if (targetIds.length === 0) {
    return {
      success: false,
      error: 'No entries found matching the target criteria',
    };
  }

  // Dry-run mode: Build preview without modifying data
  if (action.dryRun) {
    const preview = await buildPreview(
      targetIds,
      `Update ${targetIds.length} entry/entries`,
      { updates: { from: 'current values', to: action.payload } }
    );

    return {
      success: true,
      data: [],
      message: `Preview: Would update ${targetIds.length} entry/entries`,
      preview,
      affectedCount: targetIds.length,
    };
  }

  const updated: WorkEntry[] = [];
  const errors: string[] = [];

  for (const id of targetIds) {
    const result = await updateEntryById(id, action.payload);
    if (result.success && result.data) {
      updated.push(result.data);
    } else {
      errors.push(`Failed to update ${id}: ${result.error}`);
    }
  }

  if (updated.length === 0) {
    return {
      success: false,
      error: errors.join('; '),
    };
  }

  return {
    success: true,
    data: updated,
    message: `Updated ${updated.length} entry/entries`,
    affectedCount: updated.length,
  };
}

/**
 * Execute a delete entry action
 */
async function executeDeleteEntry(
  action: DeleteEntryAction
): Promise<ActionResult<number>> {
  if (!action.target) {
    return {
      success: false,
      error: 'Delete action requires a target',
    };
  }

  const targetIds = await resolveTarget(action.target);

  if (targetIds.length === 0) {
    return {
      success: false,
      error: 'No entries found matching the target criteria',
    };
  }

  // Dry-run mode: Build preview without deleting data
  if (action.dryRun) {
    const preview = await buildPreview(
      targetIds,
      `Delete ${targetIds.length} entry/entries`,
      undefined,
      true // This is destructive
    );

    return {
      success: true,
      data: 0,
      message: `Preview: Would delete ${targetIds.length} entry/entries`,
      preview,
      affectedCount: targetIds.length,
    };
  }

  let deletedCount = 0;
  const errors: string[] = [];

  for (const id of targetIds) {
    const result = await deleteEntryById(id);
    if (result.success) {
      deletedCount++;
    } else {
      errors.push(`Failed to delete ${id}: ${result.error}`);
    }
  }

  if (deletedCount === 0) {
    return {
      success: false,
      error: errors.join('; '),
    };
  }

  return {
    success: true,
    data: deletedCount,
    message: `Deleted ${deletedCount} entry/entries`,
    affectedCount: deletedCount,
  };
}

/**
 * Execute a mark paid/pending/overdue action
 */
async function executeMarkStatus(
  action: MarkPaidAction
): Promise<ActionResult<WorkEntry[]>> {
  if (!action.target) {
    return {
      success: false,
      error: 'Mark status action requires a target',
    };
  }

  const statusMap: Record<string, PaymentStatus> = {
    mark_paid: 'paid',
    mark_pending: 'pending',
    mark_overdue: 'overdue',
  };

  const newStatus = statusMap[action.type];

  return executeUpdateEntry({
    type: 'update_entry',
    target: action.target,
    payload: { paymentStatus: newStatus },
    dryRun: action.dryRun,
    requiresConfirmation: action.requiresConfirmation,
  });
}

/**
 * Execute a show summary action
 */
async function executeShowSummary(
  action: ShowSummaryAction
): Promise<ActionResult<any>> {
  const filter: WorkEntryFilter = {};

  if (action.target) {
    if (action.target.month) {
      const [year, month] = action.target.month.split('-');
      filter.dateFrom = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      filter.dateTo = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
    }
    if (action.target.clientName) filter.clientName = action.target.clientName;
    if (action.target.project) filter.project = action.target.project;
    if (action.target.paymentStatus)
      filter.paymentStatus = action.target.paymentStatus;
  }

  const result = await findEntriesByFilter(filter);

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'Failed to fetch entries for summary',
    };
  }

  const entries = result.data;

  if (entries.length === 0) {
    return {
      success: true,
      data: {
        totalSessions: 0,
        totalHours: 0,
        totalEarnings: 0,
        entries: [],
      },
      message: 'No entries found for the specified period',
    };
  }

  // Calculate totals
  const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
  const totalEarnings = entries.reduce(
    (sum, e) => sum + calculateEarnings(e),
    0
  );
  const avgRate =
    entries.reduce((sum, e) => sum + e.hourlyRate, 0) / entries.length;

  // Group by client or project
  const groupBy = action.payload?.groupBy || 'client';
  const groupField = groupBy === 'project' ? 'project' : 'clientName';

  const grouped = entries.reduce((acc, entry) => {
    const key = (entry[groupField] as string) || 'Unknown';
    if (!acc[key]) {
      acc[key] = { hours: 0, earnings: 0, count: 0, entries: [] };
    }
    acc[key].hours += entry.durationHours;
    acc[key].earnings += calculateEarnings(entry);
    acc[key].count += 1;
    acc[key].entries.push(entry);
    return acc;
  }, {} as Record<string, { hours: number; earnings: number; count: number; entries: WorkEntry[] }>);

  // Payment status breakdown
  const statusBreakdown = entries.reduce((acc, e) => {
    const status = e.paymentStatus || 'pending';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return {
    success: true,
    data: {
      totalSessions: entries.length,
      totalHours,
      totalEarnings,
      avgRate,
      grouped,
      statusBreakdown,
      entries,
    },
    message: `Summary: ${entries.length} sessions, ${totalHours.toFixed(2)} hours, ${totalEarnings.toFixed(2)} total earnings`,
  };
}

/**
 * Execute a list entries action
 */
async function executeListEntries(
  action: ListEntriesAction
): Promise<ActionResult<WorkEntry[]>> {
  const filter: WorkEntryFilter = {};

  if (action.target) {
    if (action.target.month) {
      const [year, month] = action.target.month.split('-');
      filter.dateFrom = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      filter.dateTo = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;
    }
    if (action.target.date) filter.date = action.target.date;
    if (action.target.dateFrom) filter.dateFrom = action.target.dateFrom;
    if (action.target.dateTo) filter.dateTo = action.target.dateTo;
    if (action.target.clientName) filter.clientName = action.target.clientName;
    if (action.target.project) filter.project = action.target.project;
    if (action.target.paymentStatus)
      filter.paymentStatus = action.target.paymentStatus;
  }

  const result = await findEntriesByFilter(filter);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  const entries = result.data || [];

  return {
    success: true,
    data: entries,
    message: `Found ${entries.length} entry/entries`,
  };
}

/**
 * Execute a get entry action
 */
async function executeGetEntry(
  action: GetEntryAction
): Promise<ActionResult<WorkEntry>> {
  if (!action.target) {
    return {
      success: false,
      error: 'Get entry action requires a target',
    };
  }

  const targetIds = await resolveTarget(action.target);

  if (targetIds.length === 0) {
    return {
      success: false,
      error: 'No entry found matching the target criteria',
    };
  }

  if (targetIds.length > 1) {
    return {
      success: false,
      error: `Multiple entries found (${targetIds.length}). Please be more specific.`,
    };
  }

  const result = await getEntryById(targetIds[0]);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    data: result.data,
    message: `Retrieved entry for ${result.data!.clientName} on ${result.data!.date}`,
  };
}

/**
 * Main action executor
 * Routes actions to specific handlers
 */
export async function executeAction(
  action: AgentAction
): Promise<ActionResult> {
  try {
    switch (action.type) {
      case 'create_entry':
        return await executeCreateEntry(action as CreateEntryAction);

      case 'update_entry':
        return await executeUpdateEntry(action as UpdateEntryAction);

      case 'delete_entry':
        return await executeDeleteEntry(action as DeleteEntryAction);

      case 'mark_paid':
      case 'mark_pending':
      case 'mark_overdue':
        return await executeMarkStatus(action as MarkPaidAction);

      case 'show_summary':
        return await executeShowSummary(action as ShowSummaryAction);

      case 'list_entries':
        return await executeListEntries(action as ListEntriesAction);

      case 'get_entry':
        return await executeGetEntry(action as GetEntryAction);

      default:
        return {
          success: false,
          error: `Unknown action type: ${action.type}`,
        };
    }
  } catch (error) {
    return {
      success: false,
      error: `Action execution failed: ${(error as Error).message}`,
    };
  }
}

/**
 * Execute multiple actions in sequence
 */
export async function executeActions(
  actions: AgentAction[]
): Promise<ActionResult[]> {
  const results: ActionResult[] = [];

  for (const action of actions) {
    const result = await executeAction(action);
    results.push(result);

    // Stop on first error if desired
    // if (!result.success) break;
  }

  return results;
}

// Export types
export * from './types.js';
