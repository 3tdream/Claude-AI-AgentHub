'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  Zap,
  AlertCircle,
  Loader2,
  Sparkles,
  Trash2,
  Copy,
  Check,
  X,
  Minimize2,
  Maximize2,
  Settings,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useAgentStore, parseUserRequest, AgentCommand } from '@/lib/store/agent-store';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: string;
}

interface AgentAction {
  id: string;
  name: string;
  description: string;
  prompt: string;
  jqlTemplate?: string;
  enabled: boolean;
}

interface AgentConfig {
  systemPrompt: string;
  actions: AgentAction[];
}

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    priority?: { name: string };
    assignee?: { displayName: string };
  };
}

interface AgentChatPanelProps {
  issues?: JiraIssue[];
  isOpen: boolean;
  onToggle: () => void;
  onFilterChange?: (jql: string) => void;
  onSelectFilters?: (filterIds: string[], highlight?: boolean) => void;
  userEmail?: string;
}

const AGENT_STORAGE_KEY = 'jira-agent-config';
const CHAT_MESSAGES_KEY = 'jira-agent-chat-messages';

export function AgentChatPanel({ issues = [], isOpen, onToggle, onFilterChange, onSelectFilters, userEmail }: AgentChatPanelProps) {
  const router = useRouter();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [agentConfig, setAgentConfig] = React.useState<AgentConfig | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [lastCommand, setLastCommand] = React.useState<AgentCommand | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Agent store
  const { executeCommand, setHighlightAll, clearFilters, getJqlForCommand, highlightAll } = useAgentStore();

  // Load configurations
  React.useEffect(() => {
    const savedAgent = localStorage.getItem(AGENT_STORAGE_KEY);
    if (savedAgent) {
      try {
        setAgentConfig(JSON.parse(savedAgent));
      } catch (e) {
        console.error('Failed to parse agent config:', e);
      }
    }

    // Load saved messages
    const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        setMessages(parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })));
      } catch (e) {
        console.error('Failed to parse chat messages:', e);
        initializeChat();
      }
    } else {
      initializeChat();
    }
  }, []);

  // Save messages to localStorage
  React.useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  const initializeChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hi! I\'m your Jira Agent. I can help you manage issues, analyze your sprint, and answer questions about your work. What would you like to know?',
        timestamp: new Date(),
      },
    ]);
  };

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const enabledActions = agentConfig?.actions.filter((a) => a.enabled) || [];

  const generateContextualResponse = (content: string): { response: string; command: AgentCommand | null } => {
    const lowerContent = content.toLowerCase();
    const totalIssues = issues.length;
    const openIssues = issues.filter(i =>
      !['Done', 'Closed', 'Resolved'].includes(i.fields.status?.name || '')
    );
    const highPriority = issues.filter(i =>
      ['Highest', 'High'].includes(i.fields.priority?.name || '')
    );
    const mediumPriority = issues.filter(i =>
      i.fields.priority?.name === 'Medium'
    );
    const lowPriority = issues.filter(i =>
      ['Low', 'Lowest'].includes(i.fields.priority?.name || '')
    );

    // Check for "my tickets" combined command first (In Sprint + My Issues)
    if (lowerContent.match(/\bmy\s*(tickets?|issues?|tasks?)\b/) &&
        !lowerContent.match(/open|closed|high|medium|low|priority|overdue|due/)) {
      // Use multi-select filters: my-issues + in-sprint + open
      if (onSelectFilters) {
        onSelectFilters(['my-issues', 'in-sprint', 'open'], true);
        return {
          response: `Displaying **your tickets** in the active sprint.

Applied filters:
- **My Issues** - Assigned to you
- **In Sprint** - Active sprint only (no backlog)
- **Open** - Unresolved issues

Issues are highlighted by priority:
- **Red glow** = High/Highest priority
- **Orange glow** = Medium priority
- **Green glow** = Low/Lowest priority`,
          command: {
            type: 'show_my_issues',
            timestamp: new Date(),
            description: 'Showing your tickets in active sprint',
            payload: { highlightAll: true }
          }
        };
      }
    }

    // Check for "sprint tickets" or "active sprint" combined command
    if (lowerContent.match(/\b(sprint|active\s*sprint)\s*(tickets?|issues?|tasks?)?\b/) &&
        !lowerContent.match(/backlog/)) {
      if (onSelectFilters) {
        onSelectFilters(['in-sprint', 'open'], true);
        return {
          response: `Displaying **active sprint issues**.

Applied filters:
- **In Sprint** - Active sprint only
- **Open** - Unresolved issues

Issues are highlighted by priority colors.`,
          command: {
            type: 'show_open',
            timestamp: new Date(),
            description: 'Showing active sprint issues',
            payload: { highlightAll: true }
          }
        };
      }
    }

    // Try to parse as a command first
    const command = parseUserRequest(content);

    if (command) {
      // Execute the command
      executeCommand(command);
      const jql = getJqlForCommand(command, userEmail);
      if (onFilterChange) {
        onFilterChange(jql);
      }
      setHighlightAll(true);
      setLastCommand(command);

      // Generate response based on command type
      let response = '';
      switch (command.type) {
        case 'show_open':
          response = `Displaying **${openIssues.length} open issues** on the main screen.

Issues are highlighted by priority:
- **Red glow** = High/Highest priority
- **Orange glow** = Medium priority
- **Green glow** = Low/Lowest priority

${openIssues.length > 0 ? `Top open issues:\n${openIssues.slice(0, 3).map(i => `- **${i.key}**: ${i.fields.summary}`).join('\n')}` : 'No open issues found.'}`;
          break;

        case 'show_high_priority':
          response = `Displaying **${highPriority.length} high priority issues** with **red highlights**.

${highPriority.length > 0 ? highPriority.slice(0, 5).map(i => `- **${i.key}**: ${i.fields.summary}`).join('\n') : 'No high priority issues found!'}`;
          break;

        case 'show_medium_priority':
          response = `Displaying **${mediumPriority.length} medium priority issues** with **orange highlights**.

${mediumPriority.length > 0 ? mediumPriority.slice(0, 5).map(i => `- **${i.key}**: ${i.fields.summary}`).join('\n') : 'No medium priority issues found.'}`;
          break;

        case 'show_low_priority':
          response = `Displaying **${lowPriority.length} low priority issues** with **green highlights**.

${lowPriority.length > 0 ? lowPriority.slice(0, 5).map(i => `- **${i.key}**: ${i.fields.summary}`).join('\n') : 'No low priority issues found.'}`;
          break;

        case 'show_my_issues':
          response = `Displaying **your assigned issues** on the main screen.

All issues are highlighted by priority color.`;
          break;

        case 'show_all':
          response = `Displaying **all ${totalIssues} issues** with priority highlights.

**Priority breakdown:**
- High/Highest: ${highPriority.length} (red)
- Medium: ${mediumPriority.length} (orange)
- Low/Lowest: ${lowPriority.length} (green)`;
          break;

        case 'show_overdue':
          response = `Displaying **overdue issues** on the main screen.

Issues past their due date will be shown with priority highlights.`;
          break;

        case 'show_due_soon':
          response = `Displaying issues **due within 7 days**.

All matching issues are highlighted by priority.`;
          break;

        case 'sort_by_priority':
          response = `Sorting issues by **priority** (${command.payload?.sortOrder === 'asc' ? 'low to high' : 'high to low'}).

Issues are displayed with priority-based highlights.`;
          break;

        case 'sort_by_date':
          response = `Sorting issues by **date** (${command.payload?.sortOrder === 'asc' ? 'oldest first' : 'newest first'}).`;
          break;

        case 'clear_filters':
          clearFilters();
          response = `Filters and highlights have been **cleared**.

The main screen now shows the default view.`;
          break;

        default:
          response = `Command executed: ${command.description}

Issues are now displayed with priority highlights.`;
      }

      return { response, command };
    }

    // Non-command responses
    if (lowerContent.includes('summarize') || lowerContent.includes('summary') || lowerContent.includes('overview')) {
      return {
        response: `Here's a summary of your current issues:

**Total Issues:** ${totalIssues}
**Open Issues:** ${openIssues.length}
**High Priority:** ${highPriority.length} (red)
**Medium Priority:** ${mediumPriority.length} (orange)
**Low Priority:** ${lowPriority.length} (green)

${openIssues.length > 0 ? `**Recent Open Issues:**
${openIssues.slice(0, 3).map(i => `- **${i.key}**: ${i.fields.summary}`).join('\n')}` : ''}

Try: "Show me my open tickets" to display them with priority colors!`,
        command: null,
      };
    }

    if (lowerContent.includes('status') || lowerContent.includes('progress')) {
      const statusGroups = issues.reduce((acc, issue) => {
        const status = issue.fields.status?.name || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        response: `**Issue Status Breakdown:**

${Object.entries(statusGroups).map(([status, count]) => `- ${status}: ${count}`).join('\n')}

Total: ${totalIssues} issues`,
        command: null,
      };
    }

    if (lowerContent.includes('help') || lowerContent.includes('what can you do')) {
      return {
        response: `I can help you manage your Jira issues! Try these commands:

**Combined Filters:**
- "Show me my tickets" - Your issues in active sprint
- "Sprint issues" - All active sprint issues

**Display Commands:**
- "Show me my open tickets"
- "Display high priority issues"
- "Show all issues"
- "List overdue tasks"

**Sort Commands:**
- "Sort by priority"
- "Order by date"

**Clear:**
- "Clear all filters"

Issues will display with priority colors:
🔴 High = Red | 🟠 Medium = Orange | 🟢 Low = Green`,
        command: null,
      };
    }

    // Check if asking about a specific issue
    const issueKeyMatch = content.match(/([A-Z]+-\d+)/i);
    if (issueKeyMatch) {
      const issueKey = issueKeyMatch[1].toUpperCase();
      const issue = issues.find(i => i.key === issueKey);
      if (issue) {
        return {
          response: `**${issue.key}**: ${issue.fields.summary}

**Status:** ${issue.fields.status?.name || 'Unknown'}
**Priority:** ${issue.fields.priority?.name || 'Not set'}
**Assignee:** ${issue.fields.assignee?.displayName || 'Unassigned'}

Would you like me to help you update this issue?`,
          command: null,
        };
      }
      return {
        response: `I couldn't find issue ${issueKey} in your current view. It might be in a different project or filter.`,
        command: null,
      };
    }

    return {
      response: `I understand you're asking about: "${content}"

Try these commands to update the main screen:
- "Show me my open tickets"
- "Display high priority issues"
- "Sort by priority"

Or ask me for a "summary" of your issues!`,
      command: null,
    };
  };

  const handleSendMessage = async (content: string, actionName?: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      action: actionName,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const { response, command } = generateContextualResponse(content);

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
        action: command?.description,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const copyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    initializeChat();
    localStorage.removeItem(CHAT_MESSAGES_KEY);
  };

  if (!isOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
      >
        <Bot size={20} />
        <span className="font-medium">AI Agent</span>
      </motion.button>
    );
  }

  return (
    <motion.aside
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed right-0 top-0 h-full bg-background border-l shadow-xl z-40 flex flex-col ${
        isMinimized ? 'w-16' : 'w-[20%] min-w-[320px] max-w-[400px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        {!isMinimized && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot size={18} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Jira Agent</h3>
              <p className="text-[10px] text-muted-foreground">AI Assistant</p>
            </div>
          </div>
        )}
        {isMinimized && (
          <div className="w-full flex justify-center">
            <Bot size={20} className="text-primary" />
          </div>
        )}
        {!isMinimized && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => router.push('/jira/agent')}>
              <Settings size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat}>
              <Trash2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(true)}>
              <Minimize2 size={14} />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onToggle}>
              <X size={14} />
            </Button>
          </div>
        )}
      </div>

      {isMinimized ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-2 py-4">
          <Button variant="ghost" size="icon" onClick={() => setIsMinimized(false)}>
            <Maximize2 size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X size={16} />
          </Button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-muted'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User size={12} />
                    ) : message.role === 'system' ? (
                      <AlertCircle size={12} />
                    ) : (
                      <Bot size={12} />
                    )}
                  </div>

                  <div className={`flex-1 max-w-[85%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    {message.action && (
                      <div className="text-[10px] text-muted-foreground mb-0.5 flex items-center gap-1">
                        <Zap size={8} />
                        {message.action}
                      </div>
                    )}
                    <Card
                      className={`inline-block ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.role === 'system'
                            ? 'bg-destructive/10 border-destructive'
                            : 'bg-muted/50'
                      }`}
                    >
                      <CardContent className="p-2 text-xs whitespace-pre-wrap leading-relaxed">
                        {message.content}
                      </CardContent>
                    </Card>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyMessage(message.id, message.content)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {copiedId === message.id ? (
                            <Check size={10} className="text-green-500" />
                          ) : (
                            <Copy size={10} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  <Bot size={12} />
                </div>
                <Card className="bg-muted/50">
                  <CardContent className="p-2 flex items-center gap-1">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-xs text-muted-foreground">Thinking...</span>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {enabledActions.length > 0 && (
            <div className="px-3 py-2 border-t bg-muted/20">
              <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                <Sparkles size={10} />
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-1">
                {enabledActions.slice(0, 3).map((action) => (
                  <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSendMessage(action.prompt, action.name)}
                    disabled={isLoading}
                    className="text-[10px] h-6 px-2"
                  >
                    <Zap size={10} />
                    {action.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Default Quick Actions if no custom ones */}
          {enabledActions.length === 0 && (
            <div className="px-3 py-2 border-t bg-muted/20">
              <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
                <Sparkles size={10} />
                Quick Actions
              </p>
              <div className="flex flex-wrap gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('Show me my tickets')}
                  disabled={isLoading}
                  className="text-[10px] h-6 px-2 border-violet-300 shadow-[0_0_8px_rgba(139,92,246,0.3)]"
                >
                  My Tickets
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('Show me high priority issues')}
                  disabled={isLoading}
                  className="text-[10px] h-6 px-2 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.3)]"
                >
                  High Priority
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage('Give me a summary')}
                  disabled={isLoading}
                  className="text-[10px] h-6 px-2"
                >
                  Summary
                </Button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-background">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about your issues..."
                disabled={isLoading}
                className="flex-1 text-sm h-9"
              />
              <Button
                size="icon"
                className="h-9 w-9"
                onClick={() => handleSendMessage(input)}
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
              </Button>
            </div>
          </div>
        </>
      )}
    </motion.aside>
  );
}
