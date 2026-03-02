"use client";

function getScoreColor(val: number) {
  if (val >= 92) return "#10b981";
  if (val >= 85) return "#06b6d4";
  if (val >= 75) return "#f59e0b";
  return "#ef4444";
}

function getScoreLabel(val: number) {
  if (val >= 92) return "TOP";
  if (val >= 88) return "GOOD";
  return "WATCH";
}

export function ScoreCircle({ value }: { value: number }) {
  const color = getScoreColor(value);
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-10 h-10">
        <svg viewBox="0 0 40 40" width="40" height="40">
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="var(--border)"
            strokeWidth="3"
          />
          <circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transform: "rotate(-90deg)",
              transformOrigin: "center",
              transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold"
          style={{ color }}
        >
          {value}
        </div>
      </div>
      <span className="font-mono text-[10px] text-muted-foreground">
        {value >= 92 ? "🔥" : value >= 88 ? "✓" : "⚠"} {getScoreLabel(value)}
      </span>
    </div>
  );
}
