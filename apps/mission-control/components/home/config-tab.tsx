"use client";

import { useState, useEffect } from "react";
import { useModels } from "@/lib/hooks/use-models";
import { updateAgent } from "@/lib/hooks/use-agents";
import { toast } from "sonner";
import type { Agent, LLMProvider } from "@/types";
import { Save } from "lucide-react";
import { PROVIDERS } from "./constants";

export function ConfigTab({ agent, onSaved }: { agent: Agent; onSaved: () => void }) {
  const [name, setName] = useState(agent.name);
  const [description, setDescription] = useState(agent.description || "");
  const [provider, setProvider] = useState<LLMProvider>(agent.llmProvider);
  const [model, setModel] = useState(agent.llmModel);
  const [maxTokens, setMaxTokens] = useState(agent.maxTokens);
  const [maxOutputTokens, setMaxOutputTokens] = useState(agent.maxOutputTokens || 0);
  const [maxToolSteps, setMaxToolSteps] = useState(agent.maxToolSteps);
  const [saving, setSaving] = useState(false);

  const { models } = useModels(provider);

  // Reset form when agent changes
  useEffect(() => {
    setName(agent.name);
    setDescription(agent.description || "");
    setProvider(agent.llmProvider);
    setModel(agent.llmModel);
    setMaxTokens(agent.maxTokens);
    setMaxOutputTokens(agent.maxOutputTokens || 0);
    setMaxToolSteps(agent.maxToolSteps);
  }, [agent.id, agent.name, agent.description, agent.llmProvider, agent.llmModel, agent.maxTokens, agent.maxOutputTokens, agent.maxToolSteps]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateAgent(agent.id, {
        name,
        description: description || undefined,
        llmProvider: provider,
        llmModel: model,
        maxTokens,
        maxOutputTokens: maxOutputTokens || undefined,
        maxToolSteps,
      });
      if (res.error) {
        toast.error(`Failed to save: ${res.error}`);
      } else {
        toast.success("Agent config saved");
        onSaved();
      }
    } catch (e) {
      toast.error("Failed to save agent config");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full bg-white border border-slate-200 rounded-lg px-3 py-2 font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors";
  const labelCls = "text-xs text-slate-500 uppercase tracking-wide font-medium mb-1";

  return (
    <div className="space-y-4">
      {/* ID — read-only */}
      <div>
        <div className={labelCls}>ID</div>
        <div className="font-mono text-xs text-slate-400 mt-0.5">{agent.id}</div>
      </div>

      {/* Name */}
      <div>
        <div className={labelCls}>Name</div>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* Description */}
      <div>
        <div className={labelCls}>Description</div>
        <textarea
          className={`${inputCls} resize-none h-16`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Agent description..."
        />
      </div>

      {/* Provider */}
      <div>
        <div className={labelCls}>Provider</div>
        <select
          className={inputCls}
          value={provider}
          onChange={(e) => { setProvider(e.target.value as LLMProvider); setModel(""); }}
        >
          {PROVIDERS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Model */}
      <div>
        <div className={labelCls}>Model</div>
        <select
          className={inputCls}
          value={model}
          onChange={(e) => setModel(e.target.value)}
        >
          {model && !models.find((m) => m.id === model) && (
            <option value={model}>{model}</option>
          )}
          {models.map((m) => (
            <option key={m.id} value={m.id}>{m.name || m.id}</option>
          ))}
        </select>
      </div>

      {/* Max Tokens */}
      <div>
        <div className={labelCls}>Max Tokens</div>
        <input
          type="number"
          className={inputCls}
          value={maxTokens}
          onChange={(e) => setMaxTokens(Number(e.target.value))}
        />
      </div>

      {/* Max Output Tokens */}
      <div>
        <div className={labelCls}>Max Output Tokens</div>
        <input
          type="number"
          className={inputCls}
          value={maxOutputTokens}
          onChange={(e) => setMaxOutputTokens(Number(e.target.value))}
        />
      </div>

      {/* Max Tool Steps */}
      <div>
        <div className={labelCls}>Max Tool Steps</div>
        <input
          type="number"
          className={inputCls}
          value={maxToolSteps}
          onChange={(e) => setMaxToolSteps(Number(e.target.value))}
        />
      </div>

      {/* Teams — read-only */}
      <div>
        <div className={labelCls}>Teams</div>
        <div className="font-mono text-xs text-violet-600 mt-0.5">{agent.teams.join(", ") || "\u2014"}</div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors disabled:opacity-40"
      >
        <Save className="w-4 h-4" />
        {saving ? "Saving..." : "Save Config"}
      </button>
    </div>
  );
}
