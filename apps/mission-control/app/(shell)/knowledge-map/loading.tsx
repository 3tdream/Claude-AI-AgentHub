"use client";

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-400 font-mono">Loading...</span>
      </div>
    </div>
  );
}
