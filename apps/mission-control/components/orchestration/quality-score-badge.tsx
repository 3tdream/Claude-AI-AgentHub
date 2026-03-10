"use client";

import type { QualityScore } from "@/types";
import { useState } from "react";

function getScoreColor(score: number): string {
  if (score >= 8) return "#10b981";
  if (score >= 6) return "#f59e0b";
  return "#ef4444";
}

interface QualityScoreBadgeProps {
  score: QualityScore;
}

export function QualityScoreBadge({ score }: QualityScoreBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const color = getScoreColor(score.overall);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1 px-2 py-0.5 rounded-full border transition-all hover:scale-105"
        style={{ borderColor: `${color}40`, backgroundColor: `${color}10` }}
      >
        <span className="font-mono text-xs font-bold" style={{ color }}>
          {score.overall.toFixed(1)}
        </span>
        <span className="font-mono text-[8px] text-muted-foreground">
          /10
        </span>
      </button>

      {expanded && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-card border border-border rounded-lg p-3 shadow-lg min-w-[160px]">
          <div className="space-y-2">
            <ScoreRow label="Completeness" value={score.completeness} />
            <ScoreRow label="Specificity" value={score.specificity} />
            <ScoreRow label="Actionability" value={score.actionability} />
            <div className="border-t border-border pt-1.5 mt-1.5">
              <ScoreRow label="Overall" value={score.overall} bold />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  const color = getScoreColor(value);
  return (
    <div className="flex items-center justify-between gap-3">
      <span className={`font-mono text-[10px] ${bold ? "font-bold" : "text-muted-foreground"}`}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <div className="w-12 h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${(value / 10) * 100}%`, backgroundColor: color }}
          />
        </div>
        <span className="font-mono text-[10px] font-bold min-w-[24px] text-right" style={{ color }}>
          {value.toFixed(1)}
        </span>
      </div>
    </div>
  );
}
