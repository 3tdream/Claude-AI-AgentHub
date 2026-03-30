"use client";

import Link from "next/link";
import { useSessions } from "@/lib/hooks/use-sessions";
import type { Agent, Session } from "@/types";
import { ExternalLink } from "lucide-react";

export function SessionsTab({ agent }: { agent: Agent }) {
  const { sessions } = useSessions(agent.id);

  return (
    <div className="space-y-2">
      {(sessions as Session[]).length > 0 ? (
        (sessions as Session[]).slice(0, 10).map((s: Session) => {
          const lastDate = s.updatedAt || s.createdAt;
          return (
            <div key={s.id} className="bg-slate-50 rounded-lg p-3 group hover:bg-slate-100 transition-colors">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-slate-600 truncate">{s.id.substring(0, 20)}...</div>
                <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide uppercase ${
                  s.status === "active" ? "text-emerald-700 bg-emerald-50" : "text-slate-500 bg-slate-100"
                }`}>
                  {s.status}
                </span>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <div className="font-mono text-[11px] text-slate-400">
                  {s.messageCount || 0} msgs
                  {s.channel && <> {"\u00B7"} {s.channel}</>}
                  {lastDate && <> {"\u00B7"} {new Date(lastDate).toLocaleDateString()}</>}
                </div>
                <Link
                  href={`/chat?agent=${agent.id}`}
                  className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-indigo-600 hover:text-indigo-700 text-xs font-medium transition-all"
                >
                  <ExternalLink className="w-3 h-3" />
                  Chat
                </Link>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-center py-6 text-slate-400 text-sm">No sessions</div>
      )}
    </div>
  );
}
