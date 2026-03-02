"use client";

import useSWR from "swr";
import type { CostSummary, DailyCost } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useCostSummary(provider?: string) {
  const url = provider
    ? `/api/agent-hub/costs?provider=${provider}`
    : "/api/agent-hub/costs";

  const { data, error, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: false,
  });

  return {
    costs: (data?.data ?? null) as CostSummary | null,
    isLoading,
    error,
  };
}

export function useDailyCosts(days: number = 30) {
  const { data, error, isLoading } = useSWR(
    `/api/agent-hub/costs/daily?days=${days}`,
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
