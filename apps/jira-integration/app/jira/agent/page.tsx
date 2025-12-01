'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  ChevronLeft,
  Zap,
  Play,
  Settings,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Check,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Types for Agent configuration
interface AgentAction {
  id: string;
  name: string;
  description: string;
  prompt: string;
  jqlTemplate?: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgentConfig {
  systemPrompt: string;
  actions: AgentAction[];
}

const defaultSystemPrompt = `You are a Jira assistant that helps manage issues, track progress, and automate workflows.
You can:
- Search and filter issues using JQL
- Update issue status, priority, and assignee
- Create new issues and subtasks
- Generate reports and summaries
- Suggest improvements to workflow

Always be concise and action-oriented. When modifying issues, confirm the action before executing.`;

const defaultActions: AgentAction[] = [
  {
    id: '1',
    name: 'Summarize My Issues',
    description: 'Get a summary of all issues assigned to you',
    prompt: 'Summarize all open issues assigned to me, grouped by priority. Include due dates and current status.',
    jqlTemplate: 'assignee = currentUser() AND resolution = Unresolved ORDER BY priority DESC',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Find Overdue Tasks',
    description: 'List all overdue issues that need attention',
    prompt: 'Find all overdue issues and suggest prioritization based on importance and dependencies.',
    jqlTemplate: 'duedate < now() AND resolution = Unresolved ORDER BY duedate ASC',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Sprint Progress Report',
    description: 'Generate a progress report for the current sprint',
    prompt: 'Generate a sprint progress report showing completed, in-progress, and remaining work with estimated completion.',
    jqlTemplate: 'sprint in openSprints() ORDER BY status ASC',
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const STORAGE_KEY = 'jira-agent-config';

export default function AgentPage() {
  const router = useRouter();
  const [config, setConfig] = React.useState<AgentConfig>({
    systemPrompt: defaultSystemPrompt,
    actions: defaultActions,
  });
  const [editingAction, setEditingAction] = React.useState<AgentAction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [actionToDelete, setActionToDelete] = React.useState<string | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Load config from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfig(parsed);
      } catch (e) {
        console.error('Failed to parse saved config:', e);
      }
    }
  }, []);

  // Save config to localStorage
  const saveConfig = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e) {
      console.error('Failed to save config:', e);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new action
  const createAction = () => {
    setEditingAction({
      id: '',
      name: '',
      description: '',
      prompt: '',
      jqlTemplate: '',
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setIsDialogOpen(true);
  };

  // Edit existing action
  const editAction = (action: AgentAction) => {
    setEditingAction({ ...action });
    setIsDialogOpen(true);
  };

  // Save action (create or update)
  const saveAction = () => {
    if (!editingAction) return;

    const now = new Date().toISOString();
    const updatedAction = {
      ...editingAction,
      id: editingAction.id || crypto.randomUUID(),
      updatedAt: now,
    };

    setConfig((prev) => {
      const existingIndex = prev.actions.findIndex((a) => a.id === updatedAction.id);
      if (existingIndex >= 0) {
        const newActions = [...prev.actions];
        newActions[existingIndex] = updatedAction;
        return { ...prev, actions: newActions };
      }
      return { ...prev, actions: [...prev.actions, updatedAction] };
    });

    setIsDialogOpen(false);
    setEditingAction(null);
  };

  // Delete action
  const deleteAction = () => {
    if (!actionToDelete) return;
    setConfig((prev) => ({
      ...prev,
      actions: prev.actions.filter((a) => a.id !== actionToDelete),
    }));
    setIsDeleteDialogOpen(false);
    setActionToDelete(null);
  };

  // Toggle action enabled state
  const toggleAction = (id: string) => {
    setConfig((prev) => ({
      ...prev,
      actions: prev.actions.map((a) =>
        a.id === id ? { ...a, enabled: !a.enabled } : a
      ),
    }));
  };

  // Copy prompt to clipboard
  const copyPrompt = (id: string, prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/jira')}>
                <ChevronLeft size={16} />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Agent Settings</h1>
              </div>
            </div>

            <Button onClick={saveConfig} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Settings className="animate-spin" size={16} />
                  Saving...
                </>
              ) : saveSuccess ? (
                <>
                  <Check size={16} />
                  Saved!
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* System Prompt Section */}
        <motion.section {...fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="text-primary" size={20} />
                System Prompt
              </CardTitle>
              <CardDescription>
                Define the base behavior and capabilities of your Jira agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                value={config.systemPrompt}
                onChange={(e) => setConfig((prev) => ({ ...prev, systemPrompt: e.target.value }))}
                className="w-full h-48 p-4 rounded-lg border bg-muted/50 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Enter the system prompt for your agent..."
              />
              <p className="mt-2 text-xs text-muted-foreground">
                This prompt defines the agent&apos;s personality, capabilities, and constraints.
              </p>
            </CardContent>
          </Card>
        </motion.section>

        {/* Actions Section */}
        <motion.section {...fadeInUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="text-primary" size={20} />
                Agent Actions
              </h2>
              <p className="text-sm text-muted-foreground">
                Create custom actions that your agent can perform on Jira
              </p>
            </div>
            <Button onClick={createAction}>
              <Plus size={16} />
              New Action
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {config.actions.map((action) => (
                <motion.div
                  key={action.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className={`transition-all ${!action.enabled ? 'opacity-60' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Zap className={action.enabled ? 'text-primary' : 'text-muted-foreground'} size={16} />
                            {action.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {action.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyPrompt(action.id, action.prompt)}
                          >
                            {copiedId === action.id ? (
                              <Check size={14} className="text-green-500" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => editAction(action)}
                          >
                            <Edit3 size={14} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => {
                              setActionToDelete(action.id);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="p-3 rounded-md bg-muted/50 text-sm font-mono">
                        <p className="line-clamp-2">{action.prompt}</p>
                      </div>
                      {action.jqlTemplate && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <code className="px-2 py-1 rounded bg-muted line-clamp-1">
                            {action.jqlTemplate}
                          </code>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Button
                          variant={action.enabled ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => toggleAction(action.id)}
                        >
                          {action.enabled ? (
                            <>
                              <Check size={14} />
                              Enabled
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              Disabled
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Play size={14} />
                          Test
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {config.actions.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold">No actions configured</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first action to automate Jira workflows
                </p>
                <Button className="mt-4" onClick={createAction}>
                  <Plus size={16} />
                  Create Action
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.section>
      </main>

      {/* Edit/Create Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAction?.id ? 'Edit Action' : 'Create New Action'}
            </DialogTitle>
            <DialogDescription>
              Define an action that your Jira agent can perform
            </DialogDescription>
          </DialogHeader>
          {editingAction && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Action Name</label>
                <Input
                  value={editingAction.name}
                  onChange={(e) =>
                    setEditingAction((prev) => prev && { ...prev, name: e.target.value })
                  }
                  placeholder="e.g., Summarize Sprint"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={editingAction.description}
                  onChange={(e) =>
                    setEditingAction((prev) => prev && { ...prev, description: e.target.value })
                  }
                  placeholder="Brief description of what this action does"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>
                <textarea
                  value={editingAction.prompt}
                  onChange={(e) =>
                    setEditingAction((prev) => prev && { ...prev, prompt: e.target.value })
                  }
                  className="w-full h-32 p-3 rounded-lg border bg-background font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter the prompt that will be sent to the agent..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">JQL Template (Optional)</label>
                <Input
                  value={editingAction.jqlTemplate || ''}
                  onChange={(e) =>
                    setEditingAction((prev) => prev && { ...prev, jqlTemplate: e.target.value })
                  }
                  placeholder="e.g., assignee = currentUser() AND status = Open"
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  JQL query to fetch relevant issues for this action
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={saveAction}
              disabled={!editingAction?.name || !editingAction?.prompt}
            >
              <Save size={16} />
              {editingAction?.id ? 'Update Action' : 'Create Action'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this action? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteAction}>
              <Trash2 size={16} />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
