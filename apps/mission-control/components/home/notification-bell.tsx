"use client";

import { Bell } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  read: boolean;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  const { data } = useSWR<{ data: Notification[] }>("/api/notifications", fetcher, {
    refreshInterval: 30_000,
    revalidateOnFocus: true,
  });

  const notifications: Notification[] = data?.data ?? [];
  const unread = notifications.filter((n) => !n.read && !readIds.has(n.id));
  const unreadCount = unread.length;

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function handleOpen() {
    setOpen((prev) => !prev);
  }

  function markAllRead() {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }

  const typeColors: Record<string, string> = {
    info: "bg-blue-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
    success: "bg-emerald-500",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        title="Notifications"
        className="relative flex items-center justify-center w-8 h-8 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white font-mono text-[9px] font-bold leading-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[10px] font-mono text-primary hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const isUnread = !n.read && !readIds.has(n.id);
                return (
                  <div
                    key={n.id}
                    className={`flex gap-3 px-4 py-3 transition-colors ${isUnread ? "bg-primary/5" : ""}`}
                  >
                    <div className={`mt-1 w-1.5 h-1.5 rounded-full shrink-0 ${typeColors[n.type] ?? "bg-muted-foreground"}`} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{n.title}</p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{n.message}</p>
                      <p className="mt-0.5 font-mono text-[9px] text-muted-foreground/50">
                        {new Date(n.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
