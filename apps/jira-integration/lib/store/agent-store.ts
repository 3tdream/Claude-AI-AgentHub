import { create } from 'zustand';

export type AgentCommandType =
  | 'show_all'
  | 'show_open'
  | 'show_closed'
  | 'show_high_priority'
  | 'show_medium_priority'
  | 'show_low_priority'
  | 'show_overdue'
  | 'show_due_soon'
  | 'show_my_issues'
  | 'show_unassigned'
  | 'sort_by_priority'
  | 'sort_by_date'
  | 'sort_by_status'
  | 'search'
  | 'clear_filters'
  | 'highlight_results';

export interface AgentCommand {
  type: AgentCommandType;
  payload?: {
    searchQuery?: string;
    jqlFilter?: string;
    sortBy?: 'priority' | 'date' | 'status';
    sortOrder?: 'asc' | 'desc';
    highlightIssues?: string[]; // Issue keys to highlight
    highlightAll?: boolean;
  };
  timestamp: Date;
  description: string;
}

export interface AgentState {
  // Current active command
  currentCommand: AgentCommand | null;

  // Command history
  commandHistory: AgentCommand[];

  // UI state
  highlightedIssues: Set<string>;
  highlightAll: boolean;
  activeFilter: string | null;
  sortBy: 'priority' | 'date' | 'status' | null;
  sortOrder: 'asc' | 'desc';

  // Actions
  executeCommand: (command: AgentCommand) => void;
  setHighlightedIssues: (keys: string[]) => void;
  setHighlightAll: (value: boolean) => void;
  clearHighlights: () => void;
  clearFilters: () => void;
  getJqlForCommand: (command: AgentCommand, userEmail?: string) => string;
}

export const useAgentStore = create<AgentState>((set, get) => ({
  currentCommand: null,
  commandHistory: [],
  highlightedIssues: new Set(),
  highlightAll: false,
  activeFilter: null,
  sortBy: null,
  sortOrder: 'desc',

  executeCommand: (command) => {
    set((state) => ({
      currentCommand: command,
      commandHistory: [...state.commandHistory.slice(-19), command],
      highlightAll: command.payload?.highlightAll ?? false,
      highlightedIssues: command.payload?.highlightIssues
        ? new Set(command.payload.highlightIssues)
        : state.highlightedIssues,
      sortBy: command.payload?.sortBy ?? state.sortBy,
      sortOrder: command.payload?.sortOrder ?? state.sortOrder,
    }));
  },

  setHighlightedIssues: (keys) => {
    set({ highlightedIssues: new Set(keys) });
  },

  setHighlightAll: (value) => {
    set({ highlightAll: value });
  },

  clearHighlights: () => {
    set({ highlightedIssues: new Set(), highlightAll: false });
  },

  clearFilters: () => {
    set({
      currentCommand: null,
      highlightedIssues: new Set(),
      highlightAll: false,
      activeFilter: null,
      sortBy: null,
      sortOrder: 'desc',
    });
  },

  getJqlForCommand: (command, userEmail) => {
    const email = userEmail || 'currentUser()';

    switch (command.type) {
      case 'show_all':
        return 'ORDER BY updated DESC';
      case 'show_open':
        return 'resolution = Unresolved ORDER BY updated DESC';
      case 'show_closed':
        return 'resolution != Unresolved ORDER BY updated DESC';
      case 'show_high_priority':
        return 'priority IN (Highest, High) ORDER BY priority DESC, updated DESC';
      case 'show_medium_priority':
        return 'priority = Medium ORDER BY updated DESC';
      case 'show_low_priority':
        return 'priority IN (Low, Lowest) ORDER BY priority ASC, updated DESC';
      case 'show_overdue':
        return 'duedate < now() AND resolution = Unresolved ORDER BY duedate ASC';
      case 'show_due_soon':
        return 'duedate <= 7d AND duedate >= now() AND resolution = Unresolved ORDER BY duedate ASC';
      case 'show_my_issues':
        return `assignee = "${email}" AND resolution = Unresolved ORDER BY updated DESC`;
      case 'show_unassigned':
        return 'assignee IS EMPTY AND resolution = Unresolved ORDER BY updated DESC';
      case 'sort_by_priority':
        return `ORDER BY priority ${command.payload?.sortOrder === 'asc' ? 'ASC' : 'DESC'}, updated DESC`;
      case 'sort_by_date':
        return `ORDER BY updated ${command.payload?.sortOrder === 'asc' ? 'ASC' : 'DESC'}`;
      case 'sort_by_status':
        return `ORDER BY status ${command.payload?.sortOrder === 'asc' ? 'ASC' : 'DESC'}, updated DESC`;
      case 'search':
        return command.payload?.jqlFilter || 'ORDER BY updated DESC';
      default:
        return 'ORDER BY updated DESC';
    }
  },
}));

// Command parser - understands natural language requests
export function parseUserRequest(input: string): AgentCommand | null {
  const text = input.toLowerCase().trim();

  // Show/display patterns
  if (text.match(/show|display|list|get|find|see/)) {
    // Open/unresolved issues
    if (text.match(/open|unresolved|active|pending|todo|to do|in progress/)) {
      return {
        type: 'show_open',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing open/unresolved issues with priority highlights',
      };
    }

    // Closed/done issues
    if (text.match(/closed|done|resolved|completed|finished/)) {
      return {
        type: 'show_closed',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing closed/resolved issues',
      };
    }

    // High priority
    if (text.match(/high\s*priority|urgent|critical|highest|important/)) {
      return {
        type: 'show_high_priority',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing high priority issues with red highlights',
      };
    }

    // Medium priority
    if (text.match(/medium\s*priority|moderate|normal/)) {
      return {
        type: 'show_medium_priority',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing medium priority issues with orange highlights',
      };
    }

    // Low priority
    if (text.match(/low\s*priority|minor|lowest/)) {
      return {
        type: 'show_low_priority',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing low priority issues with green highlights',
      };
    }

    // Overdue
    if (text.match(/overdue|late|past\s*due|missed/)) {
      return {
        type: 'show_overdue',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing overdue issues',
      };
    }

    // Due soon
    if (text.match(/due\s*soon|upcoming|this\s*week|next/)) {
      return {
        type: 'show_due_soon',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing issues due soon',
      };
    }

    // My issues
    if (text.match(/my\s*(issue|ticket|task|bug)|assigned\s*to\s*me|mine/)) {
      return {
        type: 'show_my_issues',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing your assigned issues',
      };
    }

    // Unassigned
    if (text.match(/unassigned|no\s*assignee|not\s*assigned/)) {
      return {
        type: 'show_unassigned',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing unassigned issues',
      };
    }

    // All issues
    if (text.match(/all|every|everything/)) {
      return {
        type: 'show_all',
        payload: { highlightAll: true },
        timestamp: new Date(),
        description: 'Showing all issues with priority highlights',
      };
    }
  }

  // Sort patterns
  if (text.match(/sort|order|arrange|organize/)) {
    if (text.match(/priority/)) {
      const order = text.match(/asc|low.*first/) ? 'asc' : 'desc';
      return {
        type: 'sort_by_priority',
        payload: { sortBy: 'priority', sortOrder: order, highlightAll: true },
        timestamp: new Date(),
        description: `Sorting by priority (${order === 'desc' ? 'high to low' : 'low to high'})`,
      };
    }
    if (text.match(/date|time|recent|update/)) {
      const order = text.match(/oldest|asc/) ? 'asc' : 'desc';
      return {
        type: 'sort_by_date',
        payload: { sortBy: 'date', sortOrder: order, highlightAll: true },
        timestamp: new Date(),
        description: `Sorting by date (${order === 'desc' ? 'newest first' : 'oldest first'})`,
      };
    }
    if (text.match(/status/)) {
      return {
        type: 'sort_by_status',
        payload: { sortBy: 'status', highlightAll: true },
        timestamp: new Date(),
        description: 'Sorting by status',
      };
    }
  }

  // Clear/reset patterns
  if (text.match(/clear|reset|remove|cancel/)) {
    if (text.match(/filter|highlight|all/)) {
      return {
        type: 'clear_filters',
        timestamp: new Date(),
        description: 'Clearing all filters and highlights',
      };
    }
  }

  // Highlight patterns
  if (text.match(/highlight|mark|emphasize/)) {
    return {
      type: 'highlight_results',
      payload: { highlightAll: true },
      timestamp: new Date(),
      description: 'Highlighting issues with priority colors',
    };
  }

  return null;
}

// QA Test scenarios
export const qaTestScenarios = [
  // Open/Active issues
  { input: 'Show me my open tickets', expectedCommand: 'show_open' },
  { input: 'Display all active issues', expectedCommand: 'show_open' },
  { input: 'List pending tasks', expectedCommand: 'show_open' },
  { input: 'Get unresolved bugs', expectedCommand: 'show_open' },

  // Priority-based
  { input: 'Show high priority issues', expectedCommand: 'show_high_priority' },
  { input: 'Display urgent tickets', expectedCommand: 'show_high_priority' },
  { input: 'Find critical bugs', expectedCommand: 'show_high_priority' },
  { input: 'Show medium priority tasks', expectedCommand: 'show_medium_priority' },
  { input: 'Display low priority items', expectedCommand: 'show_low_priority' },

  // Due dates
  { input: 'Show overdue issues', expectedCommand: 'show_overdue' },
  { input: 'Display tasks due soon', expectedCommand: 'show_due_soon' },
  { input: 'Find items due this week', expectedCommand: 'show_due_soon' },

  // Assignment
  { input: 'Show my issues', expectedCommand: 'show_my_issues' },
  { input: 'Display tickets assigned to me', expectedCommand: 'show_my_issues' },
  { input: 'List unassigned tasks', expectedCommand: 'show_unassigned' },

  // Sorting
  { input: 'Sort by priority', expectedCommand: 'sort_by_priority' },
  { input: 'Order by date', expectedCommand: 'sort_by_date' },
  { input: 'Arrange by status', expectedCommand: 'sort_by_status' },

  // Clear/Reset
  { input: 'Clear all filters', expectedCommand: 'clear_filters' },
  { input: 'Reset highlights', expectedCommand: 'clear_filters' },
];
