// ── Typed API Client — 3D Pipeline Preview ───────────────────────────────────
// Auth: httpOnly cookie — NEVER localStorage

import type { Pipeline3DData, PipelineListItem, PipelineExecution, ExecutionStats, AgentNode, AgentStatus } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    credentials: "include", // httpOnly cookie — no localStorage
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body?.message ?? `HTTP ${res.status}`) as Error & { status: number; code?: string };
    err.status = res.status;
    err.code = body?.code;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const pipelineApi = {
  list: (): Promise<{ pipelines: PipelineListItem[]; total: number }> =>
    apiFetch("/api/pipelines"),
  get: (id: string): Promise<Pipeline3DData> =>
    apiFetch(`/api/pipelines/${id}`),
  getExecution: (id: string): Promise<PipelineExecution> =>
    apiFetch(`/api/pipelines/${id}/execution`),
  getAgents: (id: string): Promise<{ agents: AgentNode[] }> =>
    apiFetch(`/api/pipelines/${id}/agents`),
  run: (id: string): Promise<{ executionId: string }> =>
    apiFetch(`/api/pipelines/${id}/run`, { method: "POST" }),
  pause: (id: string): Promise<void> =>
    apiFetch(`/api/pipelines/${id}/pause`, { method: "POST" }),
  resume: (id: string): Promise<void> =>
    apiFetch(`/api/pipelines/${id}/resume`, { method: "POST" }),
  stop: (id: string): Promise<void> =>
    apiFetch(`/api/pipelines/${id}/stop`, { method: "POST" }),
};

export const agentApi = {
  get: (id: string): Promise<AgentNode> =>
    apiFetch(`/api/agents/${id}`),
  updateStatus: (id: string, status: AgentStatus): Promise<AgentNode> =>
    apiFetch(`/api/agents/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};

export const statsApi = {
  executions: (): Promise<ExecutionStats> =>
    apiFetch("/api/stats/executions"),
};

export function subscribePipelineEvents(
  pipelineId: string,
  onData: (data: Partial<PipelineExecution>) => void,
  onError?: (err: Event) => void
): () => void {
  const es = new EventSource(`${BASE_URL}/api/pipelines/${pipelineId}/events`, { withCredentials: true });
  es.onmessage = (e) => { try { onData(JSON.parse(e.data)); } catch { /* ignore */ } };
  if (onError) es.onerror = onError;
  return () => es.close();
}
