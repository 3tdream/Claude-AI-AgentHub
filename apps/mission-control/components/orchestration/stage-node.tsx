"use client";

import {
  Search, Cpu, ClipboardList, Boxes, Shield, Server, Monitor, Palette,
  ShieldCheck, TestTube, Container, FileText, CircleCheck, CircleX,
  Loader2, Clock, ShieldAlert,
} from "lucide-react";
import type { StepStatus, StageMetadata } from "@/types";

const AGENT_ICONS: Record<string, React.ElementType> = {
  "research-agent": Search,
  "orchestrator": Cpu,
  "pm-agent": ClipboardList,
  "architect-agent": Boxes,
  "cyber-agent": Shield,
  "backend-agent": Server,
  "frontend-agent": Monitor,
  "designer-agent": Palette,
  "qa-agent": TestTube,
  "devops-agent": Container,
};

const STATUS_STYLES: Record<StepStatus, { bg: string; border: string; text: string }> = {
  pending: { bg: "bg-muted", border: "border-border", text: "text-muted-foreground" },
  running: { bg: "bg-blue-500/10", border: "border-blue-500/50", text: "text-blue-500" },
  completed: { bg: "bg-emerald-500/10", border: "border-emerald-500/50", text: "text-emerald-500" },
  failed: { bg: "bg-red-500/10", border: "border-red-500/50", text: "text-red-500" },
  skipped: { bg: "bg-muted", border: "border-border", text: "text-muted-foreground" },
  awaiting_approval: { bg: "bg-amber-500/10", border: "border-amber-500/50", text: "text-amber-500" },
  retrying: { bg: "bg-orange-500/10", border: "border-orange-500/50", text: "text-orange-500" },
};

interface StageNodeProps {
  id: string;
  agentId: string;
  agentName: string;
  status: StepStatus;
  metadata?: StageMetadata;
  selected?: boolean;
  onClick?: () => void;
  qualityScore?: number;
  retryCount?: number;
  escalated?: boolean;
}

export function StageNode({ id, agentId, agentName, status, metadata, selected, onClick, qualityScore, retryCount, escalated }: StageNodeProps) {
  const Icon = AGENT_ICONS[agentId] || FileText;
  const styles = STATUS_STYLES[status];
  const isCheckpoint = metadata?.isCheckpoint;

  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all cursor-pointer
        min-w-[80px] group
        ${selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}
        hover:scale-105
      `}
    >
      {/* Node circle */}
      <div
        className={`
          w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
          ${styles.bg} ${styles.border}
          ${status === "running" || status === "retrying" ? "animate-pulse" : ""}
          ${isCheckpoint ? "rounded-lg" : ""}
          ${escalated ? "ring-2 ring-red-500 ring-offset-1 ring-offset-background" : ""}
        `}
      >
        {status === "running" ? (
          <Loader2 className={`w-5 h-5 ${styles.text} animate-spin`} />
        ) : status === "retrying" ? (
          <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
        ) : status === "completed" ? (
          <CircleCheck className="w-5 h-5 text-emerald-500" />
        ) : status === "failed" ? (
          <CircleX className="w-5 h-5 text-red-500" />
        ) : status === "awaiting_approval" ? (
          <ShieldAlert className="w-5 h-5 text-amber-500" />
        ) : (
          <Icon className={`w-5 h-5 ${styles.text}`} />
        )}
      </div>

      {/* Label */}
      <span className="font-mono text-[10px] text-center leading-tight max-w-[80px] truncate">
        {agentName}
      </span>

      {/* Stage number */}
      {metadata?.stageNumber && (
        <span className="font-mono text-[8px] text-muted-foreground">
          S{metadata.stageNumber}
        </span>
      )}

      {/* Quality score dot */}
      {qualityScore !== undefined && status === "completed" && (
        <div
          className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white
            ${qualityScore >= 8 ? "bg-emerald-500" : qualityScore >= 6 ? "bg-amber-500" : "bg-red-500"}
          `}
        >
          {qualityScore.toFixed(0)}
        </div>
      )}

      {/* Retry count badge */}
      {retryCount !== undefined && retryCount > 0 && (
        <div className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white bg-orange-500">
          R{retryCount}
        </div>
      )}

      {/* Escalation indicator */}
      {escalated && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white bg-red-600">
          !
        </div>
      )}

      {/* Status dot for pending */}
      {status === "pending" && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-border" />
      )}
    </button>
  );
}
