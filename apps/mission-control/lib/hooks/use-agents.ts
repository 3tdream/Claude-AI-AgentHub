"use client";

import useSWR from "swr";
import type { Agent, CreateAgentParams, UpdateAgentParams } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAgents() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/agent-hub/agents",
    fetcher,
    { revalidateOnFocus: false },
  );

  return {
    agents: (data?.data ?? data ?? []) as Agent[],
    isLoading,
    error,
    mutate,
  };
}

export function useAgent(agentId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    agentId ? `/api/agent-hub/agents/${agentId}` : null,
    fetcher,
  );

  return {
    agent: (data?.data ?? null) as Agent | null,
    isLoading,
    error,
    mutate,
  };
}

export function useAgentPrompt(agentId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    agentId ? `/api/agent-hub/agents/${agentId}/prompt` : null,
    fetcher,
  );

  return {
    prompt: (data?.data ?? "") as string,
    isLoading,
    error,
    mutate,
  };
}

export function usePromptHistory(agentId: string | null) {
  const { data, error, isLoading } = useSWR(
    agentId ? `/api/agent-hub/agents/${agentId}/prompt?history=true` : null,
    fetcher,
  );

  return {
    history: (data?.data ?? []) as Array<{
      version: number;
      changeType: string;
      description: string;
      preview: string;
      createdAt: string;
    }>,
    isLoading,
    error,
  };
}

export async function createAgent(params: CreateAgentParams) {
  const res = await fetch("/api/agent-hub/agents", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function updateAgent(agentId: string, params: UpdateAgentParams) {
  const res = await fetch(`/api/agent-hub/agents/${agentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

export async function deleteAgent(agentId: string) {
  const res = await fetch(`/api/agent-hub/agents/${agentId}`, {
    method: "DELETE",
  });
  return res.json();
}

export async function updateAgentPrompt(agentId: string, prompt: string) {
  const res = await fetch(`/api/agent-hub/agents/${agentId}/prompt`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  return res.json();
}
