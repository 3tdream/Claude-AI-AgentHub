"use client";

import useSWR from "swr";
import type { Session, Message } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useSessions(agentId?: string) {
  const url = agentId
    ? `/api/agent-hub/sessions?agentId=${agentId}`
    : "/api/agent-hub/sessions";

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    sessions: (data?.data ?? data ?? []) as Session[],
    isLoading,
    error,
    mutate,
  };
}

export function useSessionMessages(sessionId: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    sessionId ? `/api/agent-hub/sessions/${sessionId}` : null,
    fetcher,
  );

  return {
    messages: (data?.data ?? data ?? []) as Message[],
    isLoading,
    error,
    mutate,
  };
}

export async function createSession(agentId: string, channel: string = "web") {
  const res = await fetch("/api/agent-hub/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ agentId, channel }),
  });
  return res.json();
}

export async function sendMessage(sessionId: string, message: string) {
  const res = await fetch(`/api/agent-hub/sessions/${sessionId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, waitForResponse: true, timeout: 60000 }),
  });
  return res.json();
}

export async function deleteSession(sessionId: string) {
  const res = await fetch(`/api/agent-hub/sessions/${sessionId}`, {
    method: "DELETE",
  });
  return res.json();
}
