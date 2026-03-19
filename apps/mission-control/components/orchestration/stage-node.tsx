"use client";

import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Search, Cpu, ClipboardList, Boxes, Shield, Server, Monitor, Palette,
  ShieldCheck, TestTube, Container, FileText, CircleCheck, CircleX,
  Loader2, Clock, ShieldAlert, Headphones, Megaphone,
} from "lucide-react";
import type { StepStatus, StageMetadata, PipelineExecution } from "@/types";
import { AgentPreviewCard } from "./agent-preview-card";

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
  "michael-personal-bot": Headphones,
  "email-calendar-agent": Clock,
  "tech-support-agent": ShieldCheck,
  "assistant-agent": FileText,
  "avatar-prompter": Megaphone,
  "profile-generator": Megaphone,
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
  disabled?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  qualityScore?: number;
  retryCount?: number;
  escalated?: boolean;
  executionHistory?: PipelineExecution[];
  draggable?: boolean;
}

export function StageNode({
  id, agentId, agentName, status, metadata, selected, disabled,
  onClick, onContextMenu, onDragStart, onDragOver, onDrop,
  qualityScore, retryCount, escalated, executionHistory, draggable,
}: StageNodeProps) {
  const Icon = AGENT_ICONS[agentId] || FileText;
  const styles = STATUS_STYLES[status];
  const isCheckpoint = metadata?.isCheckpoint;
  const [showPreview, setShowPreview] = useState(false);
  const [anchorRect, setAnchorRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  function handleMouseEnter() {
    hoverTimer.current = setTimeout(() => {
      if (btnRef.current) {
        const r = btnRef.current.getBoundingClientRect();
        setAnchorRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      }
      setShowPreview(true);
    }, 400);
  }

  function handleMouseLeave() {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setShowPreview(false);
  }

  return (<>
    <button
      ref={btnRef}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`
        relative flex flex-col items-center gap-1 p-1.5 rounded-lg transition-all cursor-pointer
        min-w-[56px] group
        ${selected ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""}
        ${disabled ? "opacity-35 grayscale" : ""}
        ${draggable ? "cursor-grab active:cursor-grabbing" : ""}
        hover:scale-105
      `}
    >
      {/* Node circle */}
      <div
        className={`
          w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
          ${styles.bg} ${styles.border}
          ${status === "running" || status === "retrying" ? "animate-pulse" : ""}
          ${isCheckpoint ? "rounded-md" : ""}
          ${escalated ? "ring-2 ring-red-500 ring-offset-1 ring-offset-background" : ""}
        `}
      >
        {status === "running" ? (
          <Loader2 className={`w-4 h-4 ${styles.text} animate-spin`} />
        ) : status === "retrying" ? (
          <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
        ) : status === "completed" ? (
          <CircleCheck className="w-4 h-4 text-emerald-500" />
        ) : status === "failed" ? (
          <CircleX className="w-4 h-4 text-red-500" />
        ) : status === "awaiting_approval" ? (
          <ShieldAlert className="w-4 h-4 text-amber-500" />
        ) : (
          <Icon className={`w-4 h-4 ${styles.text}`} />
        )}
      </div>

      {/* Label */}
      <span className="font-mono text-[9px] text-center leading-tight max-w-[60px] truncate">
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
          className={`absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white
            ${qualityScore >= 8 ? "bg-emerald-500" : qualityScore >= 6 ? "bg-amber-500" : "bg-red-500"}
          `}
        >
          {qualityScore.toFixed(0)}
        </div>
      )}

      {/* Retry count badge */}
      {retryCount !== undefined && retryCount > 0 && (
        <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white bg-orange-500">
          R{retryCount}
        </div>
      )}

      {/* Escalation indicator */}
      {escalated && (
        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold text-white bg-red-600">
          !
        </div>
      )}

      {/* Disabled strike-through */}
      {disabled && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-0.5 bg-muted-foreground/40 rotate-[-30deg]" />
        </div>
      )}

      {/* Status dot for pending */}
      {status === "pending" && !disabled && (
        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-border" />
      )}
    </button>
    {/* Portal: render preview card at document.body to avoid overflow clipping */}
    {showPreview && executionHistory && typeof document !== "undefined" && createPortal(
      <AgentPreviewCard
        agentId={agentId}
        executionHistory={executionHistory}
        anchorRect={anchorRect}
      />,
      document.body,
    )}
  </>
  );
}
