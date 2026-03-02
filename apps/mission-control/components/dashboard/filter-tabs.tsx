"use client";

import { cn } from "@/lib/utils";

export function FilterTabs({
  items,
  active,
  onChange,
}: {
  items: { value: string; label: string }[];
  active: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "font-mono text-sm px-4 py-2 rounded-lg border transition-all uppercase tracking-wider",
            active === item.value
              ? "border-primary text-foreground bg-primary/10"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
