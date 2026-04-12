"use client";

import { useState } from "react";
import { useModels } from "@/lib/hooks/use-models";
import { createAgent } from "@/lib/hooks/use-agents";
import { toast } from "sonner";
import type { LLMProvider } from "@/types";
import { X } from "lucide-react";
import { PROVIDERS } from "./constants";

export function NewAgentPanel({ onClose, onCreated }: { onClose: () => void; onCreated: (id: string) => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [provider, setProvider] = useState<LLMProvider>("anthropic");
  const [model, setModel] = useState("claude-sonnet-4-6");
  const [maxTokens, setMaxTokens] = useState(25000);
  const [saving, setSaving] = useState(false);

  const { models } = useModels(provider);
  const filteredModels = (models || []).filter((m: any) => !provider || m.provider === provider);

  const handleCreate = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!model.trim()) { toast.error("Select a model"); return; }
    setSaving(true);
    try {
      const res = await createAgent({ name, description, llmProvider: provider, llmModel: model, maxTokens, maxToolSteps: 10 });
      if (res?.data?.id || res?.id) {
        toast.success(`Agent "${name}" created`);
        onCreated(res.data?.id || res.id);
      } else {
        toast.error(res?.error || "Failed to create agent");
      }
    } catch (e) {
      toast.error(String(e));
    }
    setSaving(false);
  };

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";
  const labelCls = "text-xs text-slate-500 uppercase tracking-wide font-medium mb-1";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <span className="text-sm font-semibold text-indigo-600">+ New Agent</span>
        <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors" aria-label="Close new agent panel">
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div>
          <div className={labelCls}>Name *</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. My-Custom-Agent"
            className={inputCls} />
        </div>
        <div>
          <div className={labelCls}>Description</div>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="What does this agent do?"
            className={`${inputCls} resize-none`} />
        </div>
        <div>
          <div className={labelCls}>Provider</div>
          <select value={provider} onChange={(e) => { setProvider(e.target.value as LLMProvider); setModel(""); }}
            className={inputCls}>
            {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <div className={labelCls}>Model</div>
          <select value={model} onChange={(e) => setModel(e.target.value)}
            className={inputCls}>
            {!model && <option value="">— Select model —</option>}
            {filteredModels.length > 0
              ? filteredModels.map((m: any) => <option key={m.id} value={m.id}>{m.name || m.id}</option>)
              : model ? <option value={model}>{model}</option> : null}
          </select>
        </div>
        <div>
          <div className={labelCls}>Max Tokens</div>
          <input type="number" value={maxTokens} onChange={(e) => setMaxTokens(Number(e.target.value))}
            min={1000} max={200000} step={1000}
            className={inputCls} />
        </div>
        <button onClick={handleCreate} disabled={saving || !name.trim() || !model.trim()}
          className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-30">
          {saving ? "Creating..." : "Create Agent"}
        </button>
      </div>
    </div>
  );
}
