"use client";

import useSWR from "swr";
import type { LLMModel } from "@/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useModels(provider?: string) {
  const url = provider
    ? `/api/agent-hub/models?provider=${provider}`
    : "/api/agent-hub/models";

  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    models: (data?.data ?? data ?? []) as LLMModel[],
    isLoading,
    error,
  };
}
