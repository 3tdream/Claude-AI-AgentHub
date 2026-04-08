"use client";

export function MetricBox({ value, label, color = "", subtitle }: { value: string; label: string; color?: string; subtitle?: string }) {
  const colorClasses: Record<string, string> = {
    indigo: "text-indigo-600",
    purple: "text-violet-600",
    amber: "text-amber-600",
    green: "text-emerald-600",
    red: "text-rose-600",
    blue: "text-blue-600",
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 text-center hover:shadow-sm transition-shadow">
      <div className={`font-mono text-2xl font-bold leading-none ${colorClasses[color] || "text-slate-900"}`}>
        {value}
      </div>
      <div className="font-mono text-[10px] tracking-wide uppercase text-slate-400 mt-1.5">{label}</div>
      {subtitle && <div className="font-mono text-[10px] text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}
