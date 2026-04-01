"use client";

import { useEffect, useRef, useState } from "react";
import { FolderOpen, ChevronDown } from "lucide-react";

export interface ProjectDropdownProps {
  activeProjectId: string | null;
  projects: { id: string; name: string; framework: string; status: string }[];
  onSelectProject: (id: string | null) => void;
}

export function ProjectDropdown({ activeProjectId, projects, onSelectProject }: ProjectDropdownProps) {
  const [projectOpen, setProjectOpen] = useState(false);
  const projectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (projectRef.current && !projectRef.current.contains(e.target as Node)) setProjectOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={projectRef} className="relative">
      <button
        onClick={() => setProjectOpen(!projectOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
          activeProjectId
            ? "bg-indigo-50 border-indigo-200 text-indigo-700"
            : "bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
        }`}
      >
        <FolderOpen className="w-3 h-3" />
        <span className="max-w-[100px] truncate">
          {projects.find((p) => p.id === activeProjectId)?.name || "Select project"}
        </span>
        <ChevronDown className={`w-2.5 h-2.5 transition-transform ${projectOpen ? "rotate-180" : ""}`} />
      </button>
      {projectOpen && (
        <div className="absolute top-full mt-1 right-0 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
          <button
            onClick={() => { onSelectProject(null); setProjectOpen(false); }}
            className={`w-full px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
              !activeProjectId ? "text-indigo-600 font-medium bg-indigo-50/50" : "text-slate-500"
            }`}
          >
            No project (global)
          </button>
          <div className="border-t border-slate-100" />
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => { onSelectProject(p.id); setProjectOpen(false); }}
              className={`w-full px-3 py-2 text-left flex items-center justify-between transition-colors hover:bg-slate-50 ${
                activeProjectId === p.id ? "bg-indigo-50/50 text-indigo-700" : "text-slate-700"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className={`w-1.5 h-1.5 rounded-full ${p.status === "active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                <span className="text-xs font-medium truncate">{p.name}</span>
              </div>
              <span className="font-mono text-[9px] text-slate-400 shrink-0">{p.framework}</span>
            </button>
          ))}
          {projects.length === 0 && (
            <div className="px-3 py-3 text-xs text-slate-400 text-center">No projects discovered</div>
          )}
        </div>
      )}
    </div>
  );
}
