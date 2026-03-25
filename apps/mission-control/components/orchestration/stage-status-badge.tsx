"use client";

import {
  Circle,
  Loader,
  CheckCircle,
  AlertTriangle,
  MinusCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { STAGE_STATUS_CONFIG } from "@/lib/constants/stage-status";
import type { StepStatus } from "@/types/workflow";

const ICONS = {
  circle: Circle,
  loader: Loader,
  "check-circle": CheckCircle,
  "alert-triangle": AlertTriangle,
  "minus-circle": MinusCircle,
  clock: Clock,
  "refresh-cw": RefreshCw,
};

interface StageStatusBadgeProps {
  status: StepStatus;
  showLabel?: boolean;
}

export function StageStatusBadge({
  status,
  showLabel = false,
}: StageStatusBadgeProps) {
  const config = STAGE_STATUS_CONFIG[status];
  const Icon = ICONS[config.icon as keyof typeof ICONS] ?? Circle;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        config.color
      )}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5 shrink-0",
          status === "running" && "animate-spin"
        )}
      />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
