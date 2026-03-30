"use client";

export function StatusPill({ color, label }: { color: string; label: string }) {
  const dotColors: Record<string, string> = {
    green: "bg-emerald-500",
    blue: "bg-indigo-500",
    amber: "bg-amber-500",
    red: "bg-rose-500",
    gray: "bg-slate-400",
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${dotColors[color] || dotColors.gray}`} />
      <span className="font-mono text-[10px] tracking-wide text-slate-500">{label}</span>
    </div>
  );
}
