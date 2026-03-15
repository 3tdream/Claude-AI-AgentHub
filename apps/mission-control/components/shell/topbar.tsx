"use client";

import { Search, Command } from "lucide-react";
import { useAppStore } from "@/lib/stores/app-store";
import { useEffect, useState } from "react";

type HealthStatus = "ok" | "error" | "loading";

function useHealthCheck(intervalMs = 30_000) {
  const [status, setStatus] = useState<HealthStatus>("loading");
  const [uptime, setUptime] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/system/health", { cache: "no-store" });
        if (!cancelled) {
          if (res.ok) {
            const data = (await res.json()) as { status: string; uptime: number };
            setStatus(data.status === "ok" ? "ok" : "error");
            setUptime(data.uptime);
          } else {
            setStatus("error");
          }
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    check();
    const id = setInterval(check, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { status, uptime };
}

export function Topbar() {
  const { setCommandPaletteOpen } = useAppStore();
  const { status, uptime } = useHealthCheck();

  const dotColor =
    status === "ok"
      ? "bg-green-500"
      : status === "error"
        ? "bg-red-500"
        : "bg-yellow-500";

  const label =
    status === "ok"
      ? `Online · ${uptime !== null ? `${uptime}s` : ""}`
      : status === "error"
        ? "Offline"
        : "Checking…";

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-6">
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm"
      >
        <Search className="w-4 h-4" />
        <span className="font-mono text-xs">Search agents...</span>
        <kbd className="ml-4 flex items-center gap-0.5 font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">
          <Command className="w-3 h-3" />K
        </kbd>
      </button>

      <div className="flex items-center gap-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card"
          title={`System health: ${status}`}
        >
          <div
            className={`w-2 h-2 rounded-full ${dotColor} ${status === "ok" ? "animate-pulse" : ""}`}
          />
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>
    </header>
  );
}
