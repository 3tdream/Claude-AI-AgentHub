'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Bot,
  User,
  ChevronLeft,
  Zap,
  AlertCircle,
  Loader2,
  Sparkles,
  Key,
  Settings,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

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

interface ApiKeyConfig {
  provider: string;
  apiKey: string;
}

const AGENT_STORAGE_KEY = 'jira-agent-config';
const API_KEY_STORAGE = 'jira-ai-api-key';

export default function AIChatPage() {
  const router = useRouter();
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [agentConfig, setAgentConfig] = React.useState<AgentConfig | null>(null);
  const [apiKeyConfig, setApiKeyConfig] = React.useState<ApiKeyConfig | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Load configurations
  React.useEffect(() => {
    // Load agent config
    const savedAgent = localStorage.getItem(AGENT_STORAGE_KEY);
    if (savedAgent) {
      try {
        setAgentConfig(JSON.parse(savedAgent));
      } catch (e) {
        console.error('Failed to parse agent config:', e);
      }
    }

    // Load API key config
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedApiKey) {
      try {
        setApiKeyConfig(JSON.parse(savedApiKey));
      } catch (e) {
        console.error('Failed to parse API key config:', e);
      }
    }

    // Add welcome message
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your Jira AI Agent. I can help you manage issues, track progress, and automate workflows. Try one of the quick actions below or type your own request.',
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom on new messages
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const enabledActions = agentConfig?.actions.filter((a) => a.enabled) || [];

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
      // Simulate AI response (in real app, call your AI API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Generate a mock response based on the input
      let response = '';

      if (content.toLowerCase().includes('summarize') || content.toLowerCase().includes('summary')) {
        response = `Based on your Jira data, here's a summary:

**Open Issues:** 12 total
- High Priority: 3
- Medium Priority: 6
- Low Priority: 3

**Recent Activity:**
- 5 issues updated in the last 24 hours
- 2 issues completed this week
- 1 new issue created today

Would you like me to provide more details on any specific area?`;
      } else if (content.toLowerCase().includes('overdue')) {
        response = `I found **3 overdue issues** that need attention:

1. **PROJ-123** - "Update user authentication flow"
   - Due: 2 days ago
   - Assignee: You
   - Priority: High

2. **PROJ-156** - "Fix mobile responsiveness"
   - Due: 1 day ago
   - Assignee: You
   - Priority: Medium

3. **PROJ-189** - "Update documentation"
   - Due: Today
   - Assignee: You
   - Priority: Low

Would you like me to help prioritize these or update their status?`;
      } else if (content.toLowerCase().includes('sprint')) {
        response = `**Sprint Progress Report**

📊 **Sprint: Q4 Release - Week 2**

| Status | Count | % |
|--------|-------|---|
| Done | 8 | 40% |
| In Progress | 5 | 25% |
| To Do | 7 | 35% |

**Burndown:** On track
**Days Remaining:** 5

**Top Blockers:**
- Waiting for API spec from backend team
- Design review pending for 2 tickets

Need me to drill down into any specific area?`;
      } else {
        response = `I understand you're asking about: "${content}"

Based on your Jira configuration, I can help you with:
- Searching and filtering issues
- Updating issue status and properties
- Generating reports and summaries
- Analyzing sprint progress

Could you be more specific about what you'd like to do? Or try one of the quick actions below.`;
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'Sorry, I encountered an error processing your request. Please try again.',
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
    setMessages([
      {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Chat cleared. How can I help you?',
        timestamp: new Date(),
      },
    ]);
  };

  const hasApiKey = !!apiKeyConfig?.apiKey;

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
                <h1 className="text-xl font-bold">AI Agent Chat</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push('/jira/agent')}>
                <Settings size={16} />
                <span className="hidden sm:inline">Agent Settings</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={clearChat}>
                <Trash2 size={16} />
                <span className="hidden sm:inline">Clear</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <AlertCircle size={16} />
              <span className="text-sm">API key not configured. Chat responses are simulated.</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-800 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-200"
              onClick={() => router.push('/jira/api-key')}
            >
              <Key size={14} />
              Configure API Key
            </Button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl px-4 py-6 space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.role === 'system'
                        ? 'bg-destructive text-destructive-foreground'
                        : 'bg-muted'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User size={16} />
                  ) : message.role === 'system' ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Bot size={16} />
                  )}
                </div>

                {/* Message Content */}
                <div
                  className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}
                >
                  {message.action && (
                    <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Zap size={10} />
                      Action: {message.action}
                    </div>
                  )}
                  <Card
                    className={`inline-block ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                          ? 'bg-destructive/10 border-destructive'
                          : ''
                    }`}
                  >
                    <CardContent className="p-3 text-sm whitespace-pre-wrap">
                      {message.content}
                    </CardContent>
                  </Card>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyMessage(message.id, message.content)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedId === message.id ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Loading indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Bot size={16} />
              </div>
              <Card>
                <CardContent className="p-3 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Actions */}
      {enabledActions.length > 0 && (
        <div className="border-t bg-muted/30 px-4 py-3">
          <div className="container mx-auto max-w-4xl">
            <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles size={12} />
              Quick Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {enabledActions.slice(0, 4).map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSendMessage(action.prompt, action.name)}
                  disabled={isLoading}
                  className="text-xs"
                >
                  <Zap size={12} />
                  {action.name}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t bg-background px-4 py-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything about your Jira issues..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => handleSendMessage(input)}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {hasApiKey
              ? `Using ${apiKeyConfig?.provider || 'AI'} API`
              : 'Simulated responses - Configure API key for real AI'}
          </p>
        </div>
      </div>
    </div>
  );
}
