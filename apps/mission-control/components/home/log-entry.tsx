"use client";

export function LogEntry({ type, text, time }: { type: string; text: string; time: string }) {
  const colors: Record<string, string> = {
    kb_read: "border-l-violet-400",
    contract_validate: "border-l-emerald-400",
    simulation: "border-l-amber-400",
    routing: "border-l-indigo-400",
    agent: "border-l-blue-400",
    system: "border-l-slate-300",
  };

  return (
    <div className={`font-mono text-[10px] py-1.5 px-2.5 border-l-2 leading-relaxed text-slate-600 ${colors[type] || colors.system}`}>
      <span className="text-slate-400 mr-1.5">{time}</span>{text}
    </div>
  );
}
