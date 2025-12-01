'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  RefreshCw,
  Filter,
  Search,
  Menu,
  LayoutDashboard,
  FolderKanban,
  Columns3,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Zap,
  Bot,
  Key,
  MessageSquare
} from 'lucide-react';
import { useJiraIssues } from '@/hooks/use-jira-issues';
import { IssueCard } from '@/components/jira/issue-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';

export default function JiraDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [userDomain, setUserDomain] = React.useState<string | null>(null);
  const [jqlFilter, setJqlFilter] = React.useState('updated >= -7d ORDER BY updated DESC');

  // Fetch user email on mount
  React.useEffect(() => {
    axios.get('/api/jira/me')
      .then(res => {
        if (res.data.email) {
          setUserEmail(res.data.email);
          setUserDomain(res.data.domain);
          // Set default filter to user's open issues
          setJqlFilter(`assignee = "${res.data.email}" AND resolution = Unresolved ORDER BY updated DESC`);
        }
      })
      .catch(() => {
        // If not connected, redirect to setup
        router.replace('/');
      });
  }, [router]);

  const handleDisconnect = async () => {
    try {
      await axios.post('/api/jira/disconnect');
      router.replace('/');
    } catch {
      // Force redirect even if API fails
      router.replace('/');
    }
  };

  const { data, isLoading, error, refetch, isRefetching } = useJiraIssues(jqlFilter);

  const filteredIssues = React.useMemo(() => {
    if (!data?.issues) return [];

    if (!searchQuery) return data.issues;

    const query = searchQuery.toLowerCase();
    return data.issues.filter(
      (issue) =>
        issue.key.toLowerCase().includes(query) ||
        issue.fields.summary.toLowerCase().includes(query) ||
        issue.fields.project.name.toLowerCase().includes(query)
    );
  }, [data?.issues, searchQuery]);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Issues</CardTitle>
            <CardDescription>{error.message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()} variant="outline">
              <RefreshCw size={16} />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg hidden sm:inline">Jira Integration</span>
              </div>

              {/* Navigation Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Menu size={16} />
                    <span className="hidden sm:inline">Menu</span>
                    <ChevronDown size={14} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/jira')}>
                    <LayoutDashboard size={16} />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`https://${userDomain}/jira/projects`, '_blank')}>
                    <FolderKanban size={16} />
                    Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`https://${userDomain}/jira/boards`, '_blank')}>
                    <Columns3 size={16} />
                    Boards
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>AI Agent</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push('/jira/agent')}>
                    <Bot size={16} />
                    Agent Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/jira/api-key')}>
                    <Key size={16} />
                    API Key
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/jira/chat')}>
                    <MessageSquare size={16} />
                    AI Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuItem disabled>
                    <User size={16} />
                    <span className="truncate">{userEmail || 'Loading...'}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`https://${userDomain}`, '_blank')}>
                    <Settings size={16} />
                    Open Jira
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleDisconnect} className="text-destructive focus:text-destructive">
                    <LogOut size={16} />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Page Title */}
            <div className="flex-1 text-center hidden md:block">
              <h1 className="text-xl font-semibold">My Issues</h1>
              <p className="text-xs text-muted-foreground">
                {data?.total || 0} total
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              <Button size="sm">
                <Plus size={16} />
                <span className="hidden sm:inline">New Issue</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter Bar */}
        <motion.div className="mb-8 space-y-4" {...fadeInUp}>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                type="search"
                placeholder="Search issues by key, summary, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Button variant="outline">
              <Filter size={16} />
              Filters
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {getQuickFilters(userEmail).map((filter) => (
              <Button
                key={filter.label}
                variant={jqlFilter === filter.jql ? 'default' : 'outline'}
                size="sm"
                onClick={() => setJqlFilter(filter.jql)}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Issues Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-48">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted animate-shimmer rounded" />
                    <div className="h-12 bg-muted animate-shimmer rounded" />
                    <div className="h-4 bg-muted animate-shimmer rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredIssues.length === 0 ? (
          <motion.div {...fadeInUp}>
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No issues found</p>
                {searchQuery && (
                  <Button
                    variant="link"
                    onClick={() => setSearchQuery('')}
                    className="mt-2"
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredIssues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onClick={() => {
                  // Navigate to issue detail page
                  window.location.href = `/jira/issues/${issue.key}`;
                }}
              />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}

const getQuickFilters = (email: string | null) => [
  {
    label: 'My Open Issues',
    jql: email
      ? `assignee = "${email}" AND resolution = Unresolved ORDER BY updated DESC`
      : 'assignee = currentUser() AND resolution = Unresolved ORDER BY updated DESC'
  },
  { label: 'Recently Updated', jql: 'updated >= -7d ORDER BY updated DESC' },
  { label: 'High Priority', jql: 'priority IN (Highest, High) AND resolution = Unresolved ORDER BY priority DESC' },
  { label: 'Due Soon', jql: 'duedate <= 7d AND resolution = Unresolved ORDER BY duedate ASC' },
];
