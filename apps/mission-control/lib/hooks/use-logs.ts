"use client";

import useSWR from "swr";
import type { LogEntry, CreateLogParams } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface UseLogsOptions {
  type?: string;
  agentId?: string;
  search?: string;
  limit?: number;
}

export function useLogs(options: UseLogsOptions = {}) {
  const params = new URLSearchParams();
  if (options.type) params.set("type", options.type);
  if (options.agentId) params.set("agentId", options.agentId);
  if (options.search) params.set("search", options.search);
  if (options.limit) params.set("limit", String(options.limit));

  const url = `/api/logs?${params.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  });

  return {
    logs: (data?.data ?? []) as LogEntry[],
    total: (data?.total ?? 0) as number,
    isLoading,
    error,
    mutate,
  };
}

export async function postLog(params: CreateLogParams) {
  const res = await fetch("/api/logs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}
