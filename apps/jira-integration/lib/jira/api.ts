import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  JiraConfig,
  JiraIssue,
  JiraSearchResult,
  JiraProject,
  JiraUser,
  JiraSprint,
  JiraBoard,
  JiraTransition,
  CreateIssuePayload,
  UpdateIssuePayload,
  JiraError,
} from './types';

export class JiraClient {
  private client: AxiosInstance;
  private config: JiraConfig;

  constructor(config: JiraConfig) {
    this.config = config;

    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');

    this.client = axios.create({
      baseURL: `https://${config.domain}/rest/api/3`,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // Add error interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<JiraError>) => {
        if (error.response?.data) {
          const jiraError = error.response.data;
          const errorMessage = jiraError.errorMessages?.join(', ') ||
            Object.values(jiraError.errors || {}).join(', ') ||
            'Unknown Jira API error';
          throw new Error(errorMessage);
        }
        throw error;
      }
    );
  }

  // ==================== Authentication ====================

  async testConnection(): Promise<{ success: boolean; user?: JiraUser; error?: string }> {
    try {
      const response = await this.client.get('/myself');
      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  // ==================== Projects ====================

  async getProjects(): Promise<JiraProject[]> {
    const response = await this.client.get('/project', {
      params: { expand: 'description,lead' },
    });
    return response.data;
  }

  async getProject(projectKey: string): Promise<JiraProject> {
    const response = await this.client.get(`/project/${projectKey}`);
    return response.data;
  }

  // ==================== Issues ====================

  async searchIssues(jql: string, options?: {
    startAt?: number;
    maxResults?: number;
    fields?: string[];
  }): Promise<JiraSearchResult> {
    const fields = options?.fields || [
      'summary',
      'status',
      'assignee',
      'reporter',
      'priority',
      'issuetype',
      'created',
      'updated',
      'duedate',
      'project',
      'parent',
      'subtasks',
      'labels',
      'components',
      'comment',
      'attachment',
    ];

    // Use the new /search/jql endpoint (Jira deprecated POST /search)
    const response = await this.client.get('/search/jql', {
      params: {
        jql,
        startAt: options?.startAt || 0,
        maxResults: options?.maxResults || 50,
        fields: fields.join(','),
      },
    });
    return response.data;
  }

  async getIssue(issueKey: string): Promise<JiraIssue> {
    const response = await this.client.get(`/issue/${issueKey}`);
    return response.data;
  }

  async createIssue(payload: CreateIssuePayload): Promise<JiraIssue> {
    const response = await this.client.post('/issue', payload);
    const issueKey = response.data.key;
    return this.getIssue(issueKey);
  }

  async updateIssue(issueKey: string, payload: UpdateIssuePayload): Promise<void> {
    await this.client.put(`/issue/${issueKey}`, payload);
  }

  async deleteIssue(issueKey: string): Promise<void> {
    await this.client.delete(`/issue/${issueKey}`);
  }

  async assignIssue(issueKey: string, accountId: string | null): Promise<void> {
    await this.client.put(`/issue/${issueKey}/assignee`, {
      accountId: accountId || null,
    });
  }

  // ==================== Transitions ====================

  async getTransitions(issueKey: string): Promise<JiraTransition[]> {
    const response = await this.client.get(`/issue/${issueKey}/transitions`);
    return response.data.transitions;
  }

  async transitionIssue(issueKey: string, transitionId: string): Promise<void> {
    await this.client.post(`/issue/${issueKey}/transitions`, {
      transition: { id: transitionId },
    });
  }

  // ==================== Comments ====================

  async addComment(issueKey: string, comment: string): Promise<void> {
    await this.client.post(`/issue/${issueKey}/comment`, {
      body: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: comment,
              },
            ],
          },
        ],
      },
    });
  }

  // ==================== Users ====================

  async searchUsers(query: string): Promise<JiraUser[]> {
    const response = await this.client.get('/user/search', {
      params: { query },
    });
    return response.data;
  }

  async getUser(accountId: string): Promise<JiraUser> {
    const response = await this.client.get('/user', {
      params: { accountId },
    });
    return response.data;
  }

  // ==================== Boards (Agile API) ====================

  async getBoards(projectKey?: string): Promise<JiraBoard[]> {
    const url = `https://${this.config.domain}/rest/agile/1.0/board`;
    const params = projectKey ? { projectKeyOrId: projectKey } : {};

    const response = await this.client.get(url, { params });
    return response.data.values;
  }

  async getBoard(boardId: number): Promise<JiraBoard> {
    const url = `https://${this.config.domain}/rest/agile/1.0/board/${boardId}`;
    const response = await this.client.get(url);
    return response.data;
  }

  async getBoardIssues(boardId: number): Promise<JiraIssue[]> {
    const url = `https://${this.config.domain}/rest/agile/1.0/board/${boardId}/issue`;
    const response = await this.client.get(url);
    return response.data.issues;
  }

  // ==================== Sprints (Agile API) ====================

  async getSprints(boardId: number): Promise<JiraSprint[]> {
    const url = `https://${this.config.domain}/rest/agile/1.0/board/${boardId}/sprint`;
    const response = await this.client.get(url);
    return response.data.values;
  }

  async getSprint(sprintId: number): Promise<JiraSprint> {
    const url = `https://${this.config.domain}/rest/agile/1.0/sprint/${sprintId}`;
    const response = await this.client.get(url);
    return response.data;
  }

  async getSprintIssues(sprintId: number): Promise<JiraIssue[]> {
    const url = `https://${this.config.domain}/rest/agile/1.0/sprint/${sprintId}/issue`;
    const response = await this.client.get(url);
    return response.data.issues;
  }

  // ==================== Helper Methods ====================

  async getMyIssues(): Promise<JiraIssue[]> {
    const result = await this.searchIssues('assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC');
    return result.issues;
  }

  async getProjectIssues(projectKey: string): Promise<JiraIssue[]> {
    const result = await this.searchIssues(`project = ${projectKey} ORDER BY created DESC`);
    return result.issues;
  }

  async getRecentlyUpdated(days: number = 7): Promise<JiraIssue[]> {
    const result = await this.searchIssues(
      `updated >= -${days}d ORDER BY updated DESC`,
      { maxResults: 100 }
    );
    return result.issues;
  }
}

// Export a factory function for use in server-side code
export function createJiraClient(config: JiraConfig): JiraClient {
  return new JiraClient(config);
}

// Export utilities
export function getJiraConfigFromEnv(): JiraConfig | null {
  const domain = process.env.JIRA_DOMAIN;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;

  if (!domain || !email || !apiToken) {
    return null;
  }

  return { domain, email, apiToken };
}
