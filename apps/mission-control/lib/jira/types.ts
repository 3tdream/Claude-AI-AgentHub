// Jira types for Mission Control — adapted from jira-integration/lib/jira/types.ts

export interface JiraUser {
  accountId: string;
  displayName: string;
  emailAddress?: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  active: boolean;
}

export interface JiraProject {
  id: string;
  key: string;
  name: string;
  projectTypeKey: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  lead?: JiraUser;
  description?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  self: string;
  fields: {
    summary: string;
    description?: unknown;
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
    reporter?: JiraUser;
    created: string;
    updated: string;
    duedate?: string | null;
    project: JiraProject;
    labels?: string[];
  };
}

export interface JiraSearchResult {
  startAt: number;
  maxResults: number;
  total: number;
  issues: JiraIssue[];
}

export interface CreateIssuePayload {
  fields: {
    project: { key: string };
    summary: string;
    description?: unknown;
    issuetype: { name: string };
    priority?: { name: string };
    labels?: string[];
  };
}

// Color maps for UI badges
export const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "blue-gray": { bg: "bg-slate-500/10", text: "text-slate-400" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400" },
  green: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  yellow: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
};

export const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  Highest: { bg: "bg-red-500/10", text: "text-red-400" },
  High: { bg: "bg-orange-500/10", text: "text-orange-400" },
  Medium: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  Low: { bg: "bg-green-500/10", text: "text-green-400" },
  Lowest: { bg: "bg-slate-500/10", text: "text-slate-400" },
};

export const ISSUE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  Epic: { bg: "bg-purple-500/10", text: "text-purple-400" },
  Story: { bg: "bg-green-500/10", text: "text-green-400" },
  Task: { bg: "bg-blue-500/10", text: "text-blue-400" },
  Bug: { bg: "bg-red-500/10", text: "text-red-400" },
  "Sub-task": { bg: "bg-cyan-500/10", text: "text-cyan-400" },
};
