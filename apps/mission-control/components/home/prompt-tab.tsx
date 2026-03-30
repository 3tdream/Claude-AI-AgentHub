"use client";

import { useState, useEffect } from "react";
import { useAgentPrompt, usePromptHistory, updateAgentPrompt } from "@/lib/hooks/use-agents";
import { toast } from "sonner";
import type { Agent } from "@/types";
import { Save, RotateCcw } from "lucide-react";

export function PromptTab({ agent }: { agent: Agent }) {
  const { prompt, isLoading: promptLoading, mutate: mutatePrompt } = useAgentPrompt(agent.id);
  const { history } = usePromptHistory(agent.id);
  const [editedPrompt, setEditedPrompt] = useState("");
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Sync prompt when loaded
  useEffect(() => {
    if (prompt && !initialized) {
      setEditedPrompt(prompt);
      setInitialized(true);
    }
  }, [prompt, initialized]);

  // Reset when agent changes
  useEffect(() => {
    setInitialized(false);
    setEditedPrompt("");
  }, [agent.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAgentPrompt(agent.id, editedPrompt);
      if (res.error) {
        toast.error(`Failed to save prompt: ${res.error}`);
      } else {
        toast.success("Prompt saved");
        mutatePrompt();
      }
    } catch (e) {
      toast.error("Failed to save prompt");
    } finally {
      setSaving(false);
    }
  };

  const handleRestore = async (version: { preview: string }) => {
    setSaving(true);
    try {
      const res = await updateAgentPrompt(agent.id, version.preview);
      if (res.error) {
        toast.error(`Failed to restore: ${res.error}`);
      } else {
        setEditedPrompt(version.preview);
        toast.success("Prompt restored");
        mutatePrompt();
      }
    } catch (e) {
      toast.error("Failed to restore prompt");
    } finally {
      setSaving(false);
    }
  };

  const isDirty = editedPrompt !== (prompt || "");

  return (
    <div className="space-y-3">
      {promptLoading ? (
        <div className="text-center py-6 text-slate-400 text-sm">Loading...</div>
      ) : (
        <>
          <textarea
            className="w-full bg-white border border-slate-200 rounded-lg p-3 font-mono text-xs text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors resize-none"
            style={{ minHeight: "200px" }}
            value={editedPrompt}
            onChange={(e) => setEditedPrompt(e.target.value)}
            placeholder="Agent system prompt..."
          />
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs text-slate-400">
              {editedPrompt.length} chars{isDirty ? " \u00B7 unsaved" : ""}
            </span>
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-30"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? "Saving..." : "Save Prompt"}
            </button>
          </div>

          {/* Version history */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-2">History ({history.length})</div>
              {history.slice(0, 5).map((h, i) => (
                <div key={i} className="flex items-center justify-between py-1 group">
                  <div className="font-mono text-xs text-slate-400">
                    v{h.version} {"\u00B7"} {h.changeType} {"\u00B7"} {h.description.substring(0, 30)}
                  </div>
                  <button
                    onClick={() => handleRestore(h)}
                    disabled={saving}
                    className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-0.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded text-xs font-medium transition-all"
                    title="Restore this version"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Restore
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
