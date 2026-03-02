"use client";

import { useEffect, useState } from "react";

function getScoreColor(val: number) {
  if (val >= 92) return "#10b981";
  if (val >= 85) return "#06b6d4";
  if (val >= 75) return "#f59e0b";
  return "#ef4444";
}

export function ScoreBar({ value }: { value: number }) {
  const [width, setWidth] = useState(0);
  const color = getScoreColor(value);

  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="flex items-center gap-2.5 min-w-[150px]">
      <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          }}
        />
      </div>
      <span
        className="font-mono text-sm font-bold min-w-[36px] text-right"
        style={{ color }}
      >
        {value}%
      </span>
    </div>
  );
}
