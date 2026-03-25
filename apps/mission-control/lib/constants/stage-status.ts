import type { StepStatus } from "@/types/workflow";

export const STAGE_STATUS_CONFIG: Record<
  StepStatus,
  { color: string; icon: string; label: string }
> = {
  pending: {
    color: "text-zinc-400 border-zinc-600",
    icon: "circle",
    label: "Pending",
  },
  running: {
    color: "text-blue-400 border-blue-500 animate-pulse",
    icon: "loader",
    label: "Running",
  },
  completed: {
    color: "text-green-400 border-green-600",
    icon: "check-circle",
    label: "Passed",
  },
  failed: {
    color: "text-red-400 border-red-600",
    icon: "alert-triangle",
    label: "Failed",
  },
  skipped: {
    color: "text-zinc-600 opacity-50",
    icon: "minus-circle",
    label: "Skipped",
  },
  awaiting_approval: {
    color: "text-amber-400 border-amber-500",
    icon: "clock",
    label: "Awaiting Approval",
  },
  retrying: {
    color: "text-yellow-400 border-yellow-500",
    icon: "refresh-cw",
    label: "Retrying",
  },
};
