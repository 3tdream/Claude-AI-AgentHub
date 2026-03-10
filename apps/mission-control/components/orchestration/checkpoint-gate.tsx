"use client";

import { useState } from "react";
import { ShieldAlert, Check, X } from "lucide-react";

interface CheckpointGateProps {
  isPending: boolean;
  status: "pending" | "awaiting_approval" | "completed" | "failed";
  onApprove: () => void;
  onReject: (reason: string) => void;
  selected?: boolean;
  onClick?: () => void;
}

export function CheckpointGate({ isPending, status, onApprove, onReject, selected, onClick }: CheckpointGateProps) {
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleReject = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason.trim());
      setShowRejectInput(false);
      setRejectReason("");
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={onClick}
        className={`
          relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer
          min-w-[80px]
          ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
          hover:scale-105
        `}
      >
        {/* Gate icon */}
        <div
          className={`
            w-12 h-12 rounded-lg flex items-center justify-center border-2 transition-all
            ${status === "awaiting_approval" ? "bg-amber-500/20 border-amber-500 animate-pulse" : ""}
            ${status === "completed" ? "bg-emerald-500/10 border-emerald-500/50" : ""}
            ${status === "failed" ? "bg-red-500/10 border-red-500/50" : ""}
            ${status === "pending" ? "bg-muted border-border" : ""}
          `}
        >
          <ShieldAlert
            className={`w-5 h-5
              ${status === "awaiting_approval" ? "text-amber-500" : ""}
              ${status === "completed" ? "text-emerald-500" : ""}
              ${status === "failed" ? "text-red-500" : ""}
              ${status === "pending" ? "text-muted-foreground" : ""}
            `}
          />
        </div>
        <span className="font-mono text-[10px] text-center leading-tight">
          Checkpoint
        </span>
        <span className="font-mono text-[8px] text-muted-foreground">S4.5</span>
      </button>

      {/* Approve / Reject buttons */}
      {isPending && status === "awaiting_approval" && (
        <div className="flex flex-col items-center gap-2 mt-1">
          {!showRejectInput ? (
            <div className="flex gap-2">
              <button
                onClick={onApprove}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-mono hover:bg-emerald-600 transition-colors"
              >
                <Check className="w-3 h-3" /> Approve
              </button>
              <button
                onClick={() => setShowRejectInput(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-mono hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" /> Reject
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 w-48">
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rejection reason..."
                className="w-full px-2 py-1.5 text-xs bg-background border border-red-500/50 rounded-lg focus:outline-none focus:border-red-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleReject()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={!rejectReason.trim()}
                  className="flex-1 px-2 py-1 rounded-lg bg-red-500 text-white text-xs font-mono hover:bg-red-600 disabled:opacity-30 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                  className="px-2 py-1 rounded-lg border border-border text-xs font-mono hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
