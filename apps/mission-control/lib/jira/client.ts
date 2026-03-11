// Jira API client for Mission Control — file-based + env fallback auth (server-side only)

import type {
  JiraProject,
  JiraIssue,
  JiraSearchResult,
  CreateIssuePayload,
} from "./types";
import { getJiraConfig, type JiraConfig } from "./config";

function getHeaders(config: JiraConfig) {
  const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString("base64");

  return {
    Authorization: `Basic ${auth}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

async function jiraFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const config = await getJiraConfig();
  const url = `${config.baseUrl}/rest/api/3${path}`;

  const res = await fetch(url, {
    ...init,
    headers: { ...getHeaders(config), ...init?.headers },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg =
      body?.errorMessages?.join(", ") ||
      Object.values(body?.errors || {}).join(", ") ||
      `Jira API error: ${res.status}`;
    throw new Error(msg);
  }

  return res.json();
}

export async function getProjects(): Promise<JiraProject[]> {
  return jiraFetch<JiraProject[]>("/project?expand=description,lead");
}

export async function searchIssues(
  jql: string,
  maxResults = 50,
  startAt = 0,
): Promise<JiraSearchResult> {
  const fields = [
    "summary",
    "status",
    "assignee",
    "reporter",
    "priority",
    "issuetype",
    "created",
    "updated",
    "duedate",
    "project",
    "labels",
  ].join(",");

  const params = new URLSearchParams({
    jql,
    startAt: String(startAt),
    maxResults: String(maxResults),
    fields,
  });

  return jiraFetch<JiraSearchResult>(`/search/jql?${params}`);
}

export async function getIssue(issueKey: string): Promise<JiraIssue> {
  return jiraFetch<JiraIssue>(`/issue/${issueKey}`);
}

export async function createIssue(
  payload: CreateIssuePayload,
): Promise<JiraIssue> {
  const created = await jiraFetch<{ key: string }>("/issue", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return getIssue(created.key);
}

export async function addComment(
  issueKey: string,
  bodyAdf: unknown,
): Promise<void> {
  await jiraFetch(`/issue/${issueKey}/comment`, {
    method: "POST",
    body: JSON.stringify({ body: bodyAdf }),
  });
}

export interface JiraTransition {
  id: string;
  name: string;
  to: { id: string; name: string; statusCategory: { key: string } };
}

export async function getTransitions(
  issueKey: string,
): Promise<JiraTransition[]> {
  const result = await jiraFetch<{ transitions: JiraTransition[] }>(
    `/issue/${issueKey}/transitions`,
  );
  return result.transitions;
}

export async function transitionIssue(
  issueKey: string,
  transitionId: string,
): Promise<void> {
  await jiraFetch(`/issue/${issueKey}/transitions`, {
    method: "POST",
    body: JSON.stringify({ transition: { id: transitionId } }),
  });
}

export async function updateIssue(
  issueKey: string,
  fields: Record<string, unknown>,
): Promise<void> {
  await jiraFetch(`/issue/${issueKey}`, {
    method: "PUT",
    body: JSON.stringify({ fields }),
  });
}
