"use client";

import { useEffect, useRef } from "react";
import { Trash2, EyeOff, Eye, GitBranch, Copy } from "lucide-react";

interface StageContextMenuProps {
  x: number;
  y: number;
  stepId: string;
  isDisabled: boolean;
  isParallel: boolean;
  onClose: () => void;
  onRemove: () => void;
  onToggleDisable: () => void;
  onToggleParallel: () => void;
  onDuplicate: () => void;
}

export function StageContextMenu({
  x,
  y,
  stepId,
  isDisabled,
  isParallel,
  onClose,
  onRemove,
  onToggleDisable,
  onToggleParallel,
  onDuplicate,
}: StageContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const items = [
    {
      icon: isDisabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />,
      label: isDisabled ? "Enable Stage" : "Disable Stage",
      onClick: onToggleDisable,
      className: "hover:bg-muted",
    },
    {
      icon: <GitBranch className="w-3.5 h-3.5" />,
      label: isParallel ? "Make Sequential" : "Make Parallel",
      onClick: onToggleParallel,
      className: "hover:bg-muted",
    },
    {
      icon: <Copy className="w-3.5 h-3.5" />,
      label: "Duplicate Stage",
      onClick: onDuplicate,
      className: "hover:bg-muted",
    },
    {
      icon: <Trash2 className="w-3.5 h-3.5" />,
      label: "Remove Stage",
      onClick: onRemove,
      className: "hover:bg-red-500/10 text-red-400",
    },
  ];

  const menuWidth = 180;
  const menuHeight = items.length * 34 + 40;
  const clampedX = Math.min(x, (typeof window !== "undefined" ? window.innerWidth : 1920) - menuWidth - 8);
  const clampedY = Math.min(y, (typeof window !== "undefined" ? window.innerHeight : 1080) - menuHeight - 8);

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-card border border-border rounded-lg shadow-xl py-1 min-w-[160px]"
      style={{ left: clampedX, top: clampedY }}
    >
      <div className="px-3 py-1.5 border-b border-border/50">
        <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-wider">{stepId}</span>
      </div>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors ${item.className}`}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
