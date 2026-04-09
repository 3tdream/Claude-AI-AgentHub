"use client";

import { useState } from "react";
import { ShieldCheck, CheckCircle2, XCircle, X } from "lucide-react";

export interface CheckpointBarProps {
  executionId: string;
  onApprove: (executionId: string) => void;
  onReject: (executionId: string, reason: string) => void;
}

export function CheckpointBar({ executionId, onApprove, onReject }: CheckpointBarProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  return (
    <div className="px-4 py-3 border-b border-amber-200 bg-amber-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 animate-pulse" />
          <span className="text-xs font-medium text-amber-800">Checkpoint — awaiting approval</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onApprove(executionId)}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors"
          >
            <CheckCircle2 className="w-3 h-3" />
            Approve
          </button>
          {!showRejectInput ? (
            <button
              onClick={() => setShowRejectInput(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 transition-colors"
            >
              <XCircle className="w-3 h-3" />
              Reject
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason..."
                className="border border-rose-200 rounded px-2 py-0.5 text-[10px] w-32 focus:outline-none focus:ring-1 focus:ring-rose-300"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && rejectReason.trim()) {
                    onReject(executionId, rejectReason.trim());
                    setShowRejectInput(false);
                    setRejectReason("");
                  }
                }}
                autoFocus
              />
              <button
                onClick={() => {
                  if (rejectReason.trim()) {
                    onReject(executionId, rejectReason.trim());
                    setShowRejectInput(false);
                    setRejectReason("");
                  }
                }}
                disabled={!rejectReason.trim()}
                className="px-1.5 py-0.5 rounded text-[10px] bg-rose-600 text-white disabled:opacity-30"
              >
                Send
              </button>
              <button
                onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                className="p-0.5 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
