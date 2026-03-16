"use client";

import useSWR from "swr";
import { useEffect, useState } from "react";

interface UiConfig {
  lastUpdated: string | null;
}

const fetcher = (url: string) =>
  fetch(url, { cache: "no-store" }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json() as Promise<UiConfig>;
  });

export function TimestampFooter() {
  // ADR-002: format date only on client to avoid SSR/CSR timezone mismatch (FAIL-002)
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  // SWR client-side fetch — PAT-004: revalidateOnFocus: false
  const { data, isLoading } = useSWR<UiConfig>("/api/system/config", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  useEffect(() => {
    // Format only after mount (client-only) to prevent hydration mismatch
    if (data?.lastUpdated) {
      try {
        const formatted = new Intl.DateTimeFormat("ru-RU", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date(data.lastUpdated));
        setFormattedDate(formatted);
      } catch {
        setFormattedDate(null);
      }
    } else {
      setFormattedDate(null);
    }
  }, [data?.lastUpdated]);

  // While loading or no data — render nothing (ADR-002: no flash of wrong content)
  if (isLoading || formattedDate === null) return null;

  return (
    <footer className="border-t border-border px-6 py-2 w-full">
      <span className="text-xs text-muted-foreground truncate block">
        Последнее обновление: {formattedDate}
      </span>
    </footer>
  );
}
