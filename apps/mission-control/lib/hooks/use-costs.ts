"use client";

import useSWR from "swr";
import type { CostSummary, DailyCost } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCostSummary(provider?: string, projectId?: string | null) {
  const params = new URLSearchParams();
  if (provider) params.set("provider", provider);
  if (projectId) params.set("projectId", projectId);
  const qs = params.toString();
  const url = `/api/agent-hub/costs${qs ? `?${qs}` : ""}`;

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    costs: (data?.data ?? null) as CostSummary | null,
    isLoading,
    error,
  };
}

export function useDailyCosts(days: number = 30, projectId?: string | null) {
  const params = new URLSearchParams({ days: String(days) });
  if (projectId) params.set("projectId", projectId);
  const { data, error, isLoading } = useSWR(
    `/api/agent-hub/costs/daily?${params.toString()}`,
    fetcher,
    { refreshInterval: 60000 },
  );

  return {
    dailyCosts: (data?.data ?? []) as DailyCost[],
    summary: data?.summary ?? null,
    isLoading,
    error,
  };
}
