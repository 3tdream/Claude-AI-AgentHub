// Jira API Type Definitions

export type IssueType = 'epic' | 'story' | 'task' | 'bug' | 'subtask';
export type Priority = 'highest' | 'high' | 'medium' | 'low' | 'lowest';
export type StatusCategory = 'todo' | 'inprogress' | 'done';

export interface JiraConfig {
  domain: string; // e.g., "yourcompany.atlassian.net"
  email: string;
  apiToken: string;
}

export interface JiraUser {
  accountId: string;
  emailAddress: string;
  displayName: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  active: boolean;
  timeZone?: string;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: {
    '48x48': string;
    '24x24': string;
    '16x16': string;
    '32x32': string;
  };
  lead?: JiraUser;
  description?: string;
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'future' | 'active' | 'closed';
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  originBoardId?: number;
  goal?: string;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: 'scrum' | 'kanban';
  location?: {
    projectId: number;
    projectName: string;
    projectKey: string;
  };
}

export interface JiraIssueFields {
  summary: string;
  description?: any; // ADF (Atlassian Document Format) or plain text
  issuetype: {
    id: string;
    name: string;
    subtask: boolean;
    iconUrl: string;
  };
  priority: {
    id: string;
    name: string;
    iconUrl: string;
  };
  status: {
    id: string;
    name: string;
    statusCategory: {
      id: number;
      key: string;
      colorName: string;
      name: string;
    };
  };
  assignee?: JiraUser | null;
  reporter: JiraUser;
  created: string;
  updated: string;
  duedate?: string | null;
  project: JiraProject;
  parent?: {
    id: string;
    key: string;
    fields: {
      summary: string;
    };
  };
  subtasks?: Array<{
    id: string;
    key: string;
    fields: {
      summary: string;
      status: {
        name: string;
      };
    };
  }>;
  comment?: {
    comments: JiraComment[];
    total: number;
  };
  attachment?: JiraAttachment[];
  labels?: string[];
  components?: Array<{
    id: string;
    name: string;
  }>;
  customfield_10016?: number; // Story points (common field ID)
  [key: string]: any; // Allow custom fields
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: JiraIssueFields;
}

export interface JiraComment {
  id: string;
  author: JiraUser;
  body: any; // ADF format
  created: string;
  updated: string;
}

export interface JiraAttachment {
  id: string;
  filename: string;
  author: JiraUser;
  created: string;
  size: number;
  mimeType: string;
  content: string; // URL
  thumbnail?: string;
}

export interface JiraSearchResult {
  expand: string;
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

export interface JiraTransition {
  id: string;
  name: string;
  to: {
    id: string;
    name: string;
    statusCategory: {
      id: number;
      key: string;
      colorName: string;
    };
  };
}

export interface CreateIssuePayload {
  fields: {
    project: {
      key: string;
    };
    summary: string;
    description?: any;
    issuetype: {
      name: string;
    };
    priority?: {
      name: string;
    };
    assignee?: {
      accountId: string;
    } | null;
    labels?: string[];
    duedate?: string;
    parent?: {
      key: string;
    };
    [key: string]: any;
  };
}

export interface UpdateIssuePayload {
  fields?: {
    summary?: string;
    description?: any;
    priority?: {
      name: string;
    };
    assignee?: {
      accountId: string;
    } | null;
    labels?: string[];
    duedate?: string;
    [key: string]: any;
  };
  update?: {
    [key: string]: Array<{
      add?: any;
      remove?: any;
      set?: any;
    }>;
  };
}

export interface JiraError {
  errorMessages: string[];
  errors: Record<string, string>;
}

// Helper type for issue type colors
export const ISSUE_TYPE_COLORS: Record<string, string> = {
  epic: 'hsl(271 91% 65%)',
  story: 'hsl(142 71% 45%)',
  task: 'hsl(207 90% 54%)',
  bug: 'hsl(0 84% 60%)',
  subtask: 'hsl(180 77% 47%)',
};

// Helper type for priority colors
export const PRIORITY_COLORS: Record<string, string> = {
  highest: 'hsl(0 84% 60%)',
  high: 'hsl(25 95% 53%)',
  medium: 'hsl(43 96% 56%)',
  low: 'hsl(142 71% 45%)',
  lowest: 'hsl(240 5% 64%)',
};

// Helper type for status category colors
export const STATUS_CATEGORY_COLORS: Record<string, string> = {
  todo: 'hsl(240 5% 64%)',
  inprogress: 'hsl(207 90% 54%)',
  done: 'hsl(142 71% 45%)',
};
