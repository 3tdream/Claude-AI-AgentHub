import { JiraIssue } from './types';
import {
  ISSUE_TYPE_COLORS,
  PRIORITY_COLORS,
  STATUS_CATEGORY_COLORS,
} from './types';

/**
 * Get color for issue type
 */
export function getIssueTypeColor(issueType: string): string {
  const normalized = issueType.toLowerCase();
  return ISSUE_TYPE_COLORS[normalized] || 'hsl(240 5% 64%)';
}

/**
 * Get color for priority
 */
export function getPriorityColor(priority: string): string {
  const normalized = priority.toLowerCase();
  return PRIORITY_COLORS[normalized] || 'hsl(240 5% 64%)';
}

/**
 * Get color for status category
 */
export function getStatusColor(statusCategory: string): string {
  const normalized = statusCategory.toLowerCase();
  return STATUS_CATEGORY_COLORS[normalized] || 'hsl(240 5% 64%)';
}

/**
 * Format JQL query safely
 */
export function buildJQL(conditions: Record<string, any>): string {
  const parts: string[] = [];

  if (conditions.project) {
    parts.push(`project = "${conditions.project}"`);
  }

  if (conditions.assignee) {
    if (conditions.assignee === 'currentUser') {
      parts.push('assignee = currentUser()');
    } else {
      parts.push(`assignee = "${conditions.assignee}"`);
    }
  }

  if (conditions.status) {
    if (Array.isArray(conditions.status)) {
      const statuses = conditions.status.map(s => `"${s}"`).join(', ');
      parts.push(`status IN (${statuses})`);
    } else {
      parts.push(`status = "${conditions.status}"`);
    }
  }

  if (conditions.issueType) {
    if (Array.isArray(conditions.issueType)) {
      const types = conditions.issueType.map(t => `"${t}"`).join(', ');
      parts.push(`issuetype IN (${types})`);
    } else {
      parts.push(`issuetype = "${conditions.issueType}"`);
    }
  }

  if (conditions.priority) {
    if (Array.isArray(conditions.priority)) {
      const priorities = conditions.priority.map(p => `"${p}"`).join(', ');
      parts.push(`priority IN (${priorities})`);
    } else {
      parts.push(`priority = "${conditions.priority}"`);
    }
  }

  if (conditions.labels && Array.isArray(conditions.labels)) {
    conditions.labels.forEach(label => {
      parts.push(`labels = "${label}"`);
    });
  }

  if (conditions.text) {
    parts.push(`text ~ "${conditions.text}"`);
  }

  if (conditions.resolution === 'Unresolved') {
    parts.push('resolution = Unresolved');
  }

  if (conditions.sprint) {
    parts.push(`sprint = ${conditions.sprint}`);
  }

  const jql = parts.join(' AND ');
  const orderBy = conditions.orderBy || 'updated DESC';

  return jql ? `${jql} ORDER BY ${orderBy}` : `ORDER BY ${orderBy}`;
}

/**
 * Extract issue key from URL or string
 */
export function extractIssueKey(input: string): string | null {
  // Match pattern like PROJ-123
  const match = input.match(/([A-Z]{2,10}-\d+)/);
  return match ? match[1] : null;
}

/**
 * Get Jira issue URL
 */
export function getIssueUrl(domain: string, issueKey: string): string {
  return `https://${domain}/browse/${issueKey}`;
}

/**
 * Format Jira date
 */
export function formatJiraDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Calculate story points total
 */
export function calculateStoryPoints(issues: JiraIssue[]): number {
  return issues.reduce((sum, issue) => {
    const points = issue.fields.customfield_10016 || 0;
    return sum + points;
  }, 0);
}

/**
 * Group issues by status
 */
export function groupByStatus(issues: JiraIssue[]): Record<string, JiraIssue[]> {
  return issues.reduce((acc, issue) => {
    const status = issue.fields.status.name;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(issue);
    return acc;
  }, {} as Record<string, JiraIssue[]>);
}

/**
 * Group issues by assignee
 */
export function groupByAssignee(issues: JiraIssue[]): Record<string, JiraIssue[]> {
  return issues.reduce((acc, issue) => {
    const assignee = issue.fields.assignee?.displayName || 'Unassigned';
    if (!acc[assignee]) {
      acc[assignee] = [];
    }
    acc[assignee].push(issue);
    return acc;
  }, {} as Record<string, JiraIssue[]>);
}

/**
 * Check if issue is overdue
 */
export function isOverdue(issue: JiraIssue): boolean {
  if (!issue.fields.duedate) return false;
  const dueDate = new Date(issue.fields.duedate);
  const now = new Date();
  return dueDate < now && issue.fields.status.statusCategory.key !== 'done';
}

/**
 * Get issue type icon from Lucide
 */
export function getIssueTypeIcon(issueType: string): string {
  const normalized = issueType.toLowerCase();
  const iconMap: Record<string, string> = {
    epic: 'Zap',
    story: 'BookOpen',
    task: 'CheckSquare',
    bug: 'Bug',
    subtask: 'List',
  };
  return iconMap[normalized] || 'Circle';
}

/**
 * Get priority icon from Lucide
 */
export function getPriorityIcon(priority: string): string {
  const normalized = priority.toLowerCase();
  const iconMap: Record<string, string> = {
    highest: 'ChevronsUp',
    high: 'ChevronUp',
    medium: 'Minus',
    low: 'ChevronDown',
    lowest: 'ChevronsDown',
  };
  return iconMap[normalized] || 'Minus';
}

/**
 * Parse Atlassian Document Format (ADF) to plain text
 */
export function adfToPlainText(adf: any): string {
  if (!adf || typeof adf !== 'object') return '';

  if (adf.type === 'text') {
    return adf.text || '';
  }

  if (adf.content && Array.isArray(adf.content)) {
    return adf.content.map(adfToPlainText).join('');
  }

  return '';
}

/**
 * Create ADF from plain text
 */
export function plainTextToAdf(text: string): any {
  return {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text,
          },
        ],
      },
    ],
  };
}

/**
 * Validate Jira domain format
 */
export function isValidJiraDomain(domain: string): boolean {
  return /^[a-z0-9-]+\.atlassian\.net$/.test(domain);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Sanitize JQL input
 */
export function sanitizeJQL(jql: string): string {
  // Remove potentially dangerous characters
  return jql.replace(/[;<>&|`$()]/g, '');
}
