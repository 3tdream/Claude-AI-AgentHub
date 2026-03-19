"use client";

import { BookTemplate, Plus, Trash2, ArrowRight, Copy, Pin } from "lucide-react";
import type { Workflow, WorkflowSlot } from "@/types";

interface TemplateLibraryProps {
  workflows: Workflow[];
  selectedWorkflowId: string | null;
  slots?: [WorkflowSlot, WorkflowSlot, WorkflowSlot, WorkflowSlot];
  onSelectWorkflow: (wf: Workflow) => void;
  onLoadToSlot: (wf: Workflow) => void;
  onSaveAsTemplate: (wf: Workflow) => void;
  onDeleteWorkflow: (id: string) => void;
  onCreateFromTemplate: () => void;
  onCreateNew: () => void;
  onDuplicateToSlot?: (workflowId: string) => void;
  onDropToSlot?: (workflowId: string, slotIndex: 0 | 1 | 2 | 3) => void;
  corePipelineIds?: Set<string>;
}

export function TemplateLibrary({
  workflows,
  selectedWorkflowId,
  slots,
  onSelectWorkflow,
  onLoadToSlot,
  onSaveAsTemplate,
  onDeleteWorkflow,
  onCreateFromTemplate,
  onCreateNew,
  onDuplicateToSlot,
  onDropToSlot,
  corePipelineIds,
}: TemplateLibraryProps) {
  const templates = workflows.filter((w) => w.isTemplate);
  const userWorkflows = workflows.filter((w) => !w.isTemplate);

  return (
    <div className="w-64 flex-shrink-0 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookTemplate className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-bold text-sm">Library</h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onCreateFromTemplate}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="Create from CRM template"
          >
            <BookTemplate className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCreateNew}
            className="p-1.5 rounded hover:bg-muted transition-colors"
            title="New empty workflow"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Templates section */}
        {templates.length > 0 && (
          <div className="px-2 pt-2">
            <p className="px-2 font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Templates</p>
            <div className="space-y-0.5">
              {templates.map((wf) => (
                <WorkflowItem
                  key={wf.id}
                  wf={wf}
                  isSelected={selectedWorkflowId === wf.id}
                  isTemplate
                  onSelect={() => onSelectWorkflow(wf)}
                  onLoadToSlot={() => onLoadToSlot(wf)}
                  onDelete={() => onDeleteWorkflow(wf.id)}
                  onDuplicate={onDuplicateToSlot ? () => onDuplicateToSlot(wf.id) : undefined}
                />
              ))}
            </div>
          </div>
        )}

        {/* User workflows section */}
        <div className="px-2 pt-2 pb-2">
          <p className="px-2 font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Workflows</p>
          <div className="space-y-0.5">
            {userWorkflows.map((wf) => (
              <WorkflowItem
                key={wf.id}
                wf={wf}
                isSelected={selectedWorkflowId === wf.id}
                isCore={corePipelineIds?.has(wf.id)}
                onSelect={() => onSelectWorkflow(wf)}
                onLoadToSlot={() => onLoadToSlot(wf)}
                onSaveAsTemplate={() => onSaveAsTemplate(wf)}
                onDelete={() => onDeleteWorkflow(wf.id)}
                onDuplicate={onDuplicateToSlot ? () => onDuplicateToSlot(wf.id) : undefined}
              />
            ))}
            {userWorkflows.length === 0 && (
              <p className="text-center font-mono text-[10px] text-muted-foreground py-6">
                No workflows yet
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Drop zones for slot targets */}
      {slots && onDropToSlot && (
        <div className="px-2 pb-2 pt-1 border-t border-border/50">
          <p className="px-2 font-mono text-[9px] text-muted-foreground uppercase tracking-wider mb-1.5">Drop to Slot</p>
          <div className="flex gap-1">
            {slots.map((slot, i) => (
              <div
                key={i}
                onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
                onDrop={(e) => {
                  e.preventDefault();
                  const wfId = e.dataTransfer.getData("workflow-id");
                  if (wfId) onDropToSlot(wfId, i as 0 | 1 | 2 | 3);
                }}
                className={`flex-1 h-8 rounded border-2 border-dashed flex items-center justify-center transition-colors ${
                  slot.status === "empty"
                    ? "border-border/40 hover:border-primary/40 text-muted-foreground/30 hover:text-primary/40"
                    : "border-border/20 text-muted-foreground/20"
                }`}
              >
                <span className="font-mono text-[9px]">
                  {slot.status === "empty" ? `${i + 1}` : slot.workflowName?.slice(0, 5)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowItem({
  wf,
  isSelected,
  isTemplate,
  isCore,
  onSelect,
  onLoadToSlot,
  onSaveAsTemplate,
  onDelete,
  onDuplicate,
}: {
  wf: Workflow;
  isSelected: boolean;
  isTemplate?: boolean;
  isCore?: boolean;
  onSelect: () => void;
  onLoadToSlot: () => void;
  onSaveAsTemplate?: () => void;
  onDelete: () => void;
  onDuplicate?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("workflow-id", wf.id);
        e.dataTransfer.effectAllowed = "copyMove";
      }}
      className={`group flex items-center gap-1 px-2 py-1.5 rounded-lg cursor-pointer transition-all ${
        isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
      }`}
    >
      <button onClick={onSelect} className="flex-1 min-w-0 text-left">
        <div className="flex items-center gap-1">
          {isCore && <Pin className="w-3 h-3 text-amber-400 flex-shrink-0" />}
          <p className="text-xs font-medium truncate">{wf.name}</p>
        </div>
        <p className="font-mono text-[10px] text-muted-foreground">
          {wf.steps.length} steps
          {isTemplate && <span className="ml-1 text-primary/60">template</span>}
          {isCore && <span className="ml-1 text-amber-400">core</span>}
        </p>
      </button>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onLoadToSlot(); }}
          className="p-1 hover:text-primary transition-colors"
          title="Load to active slot"
        >
          <ArrowRight className="w-3 h-3" />
        </button>
        {onDuplicate && (
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1 hover:text-primary transition-colors"
            title="Clone to empty slot"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        {onSaveAsTemplate && (
          <button
            onClick={(e) => { e.stopPropagation(); onSaveAsTemplate(); }}
            className="p-1 hover:text-primary transition-colors"
            title="Save as template"
          >
            <BookTemplate className="w-3 h-3" />
          </button>
        )}
        {!isCore && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 hover:text-destructive transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
