'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Play,
  CheckCircle2,
  XCircle,
  Bot,
  MessageSquare,
  Zap,
  Filter,
  ArrowUpDown,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { parseUserRequest, qaTestScenarios } from '@/lib/store/agent-store';

interface TestResult {
  input: string;
  expectedCommand: string;
  actualCommand: string | null;
  passed: boolean;
  description: string;
}

// Extended QA scenarios with 20 tests
const extendedQAScenarios = [
  // Open/Active issues (4 tests)
  { input: 'Show me my open tickets', expectedCommand: 'show_open', category: 'Display' },
  { input: 'Display all active issues', expectedCommand: 'show_open', category: 'Display' },
  { input: 'List pending tasks', expectedCommand: 'show_open', category: 'Display' },
  { input: 'Get unresolved bugs', expectedCommand: 'show_open', category: 'Display' },

  // Priority-based (5 tests)
  { input: 'Show high priority issues', expectedCommand: 'show_high_priority', category: 'Priority' },
  { input: 'Display urgent tickets', expectedCommand: 'show_high_priority', category: 'Priority' },
  { input: 'Find critical bugs', expectedCommand: 'show_high_priority', category: 'Priority' },
  { input: 'Show medium priority tasks', expectedCommand: 'show_medium_priority', category: 'Priority' },
  { input: 'Display low priority items', expectedCommand: 'show_low_priority', category: 'Priority' },

  // Due dates (3 tests)
  { input: 'Show overdue issues', expectedCommand: 'show_overdue', category: 'Due Date' },
  { input: 'Display tasks due soon', expectedCommand: 'show_due_soon', category: 'Due Date' },
  { input: 'Find items due this week', expectedCommand: 'show_due_soon', category: 'Due Date' },

  // Assignment (3 tests)
  { input: 'Show my issues', expectedCommand: 'show_my_issues', category: 'Assignment' },
  { input: 'Display tickets assigned to me', expectedCommand: 'show_my_issues', category: 'Assignment' },
  { input: 'List unassigned tasks', expectedCommand: 'show_unassigned', category: 'Assignment' },

  // Sorting (3 tests)
  { input: 'Sort by priority', expectedCommand: 'sort_by_priority', category: 'Sorting' },
  { input: 'Order by date', expectedCommand: 'sort_by_date', category: 'Sorting' },
  { input: 'Arrange by status', expectedCommand: 'sort_by_status', category: 'Sorting' },

  // Clear/Reset (2 tests)
  { input: 'Clear all filters', expectedCommand: 'clear_filters', category: 'Clear' },
  { input: 'Reset highlights', expectedCommand: 'clear_filters', category: 'Clear' },
];

export default function QASimulationPage() {
  const router = useRouter();
  const [results, setResults] = React.useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(-1);

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    setCurrentIndex(0);

    const newResults: TestResult[] = [];

    for (let i = 0; i < extendedQAScenarios.length; i++) {
      setCurrentIndex(i);
      const scenario = extendedQAScenarios[i];

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const command = parseUserRequest(scenario.input);
      const actualCommand = command?.type || null;
      const passed = actualCommand === scenario.expectedCommand;

      newResults.push({
        input: scenario.input,
        expectedCommand: scenario.expectedCommand,
        actualCommand,
        passed,
        description: command?.description || 'No command recognized',
      });

      setResults([...newResults]);
    }

    setCurrentIndex(-1);
    setIsRunning(false);
  };

  const runSingleTest = (index: number) => {
    const scenario = extendedQAScenarios[index];
    const command = parseUserRequest(scenario.input);
    const actualCommand = command?.type || null;
    const passed = actualCommand === scenario.expectedCommand;

    const newResult: TestResult = {
      input: scenario.input,
      expectedCommand: scenario.expectedCommand,
      actualCommand,
      passed,
      description: command?.description || 'No command recognized',
    };

    setResults((prev) => {
      const updated = [...prev];
      const existingIndex = updated.findIndex((r) => r.input === scenario.input);
      if (existingIndex >= 0) {
        updated[existingIndex] = newResult;
      } else {
        updated.push(newResult);
      }
      return updated;
    });
  };

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Display':
        return <MessageSquare size={14} />;
      case 'Priority':
        return <Zap size={14} />;
      case 'Due Date':
        return <Filter size={14} />;
      case 'Assignment':
        return <Bot size={14} />;
      case 'Sorting':
        return <ArrowUpDown size={14} />;
      case 'Clear':
        return <Trash2 size={14} />;
      default:
        return <MessageSquare size={14} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Display':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Priority':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'Due Date':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'Assignment':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Sorting':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'Clear':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <h1 className="text-xl font-bold">QA Simulation</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {results.length > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle2 size={12} className="mr-1" />
                    {passedCount} Passed
                  </Badge>
                  {failedCount > 0 && (
                    <Badge variant="destructive">
                      <XCircle size={12} className="mr-1" />
                      {failedCount} Failed
                    </Badge>
                  )}
                </div>
              )}
              <Button onClick={runAllTests} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Run All Tests
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Info Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary" />
              AI Agent Command Recognition Test
            </CardTitle>
            <CardDescription>
              This simulation tests 20 different user requests to verify the AI Agent correctly understands
              and executes commands. Each test shows the user input, expected command, and whether it passed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-sm">
              <div className="p-2 rounded bg-blue-100 dark:bg-blue-900/30 text-center">
                <div className="font-semibold text-blue-800 dark:text-blue-300">Display</div>
                <div className="text-xs text-muted-foreground">4 tests</div>
              </div>
              <div className="p-2 rounded bg-red-100 dark:bg-red-900/30 text-center">
                <div className="font-semibold text-red-800 dark:text-red-300">Priority</div>
                <div className="text-xs text-muted-foreground">5 tests</div>
              </div>
              <div className="p-2 rounded bg-amber-100 dark:bg-amber-900/30 text-center">
                <div className="font-semibold text-amber-800 dark:text-amber-300">Due Date</div>
                <div className="text-xs text-muted-foreground">3 tests</div>
              </div>
              <div className="p-2 rounded bg-purple-100 dark:bg-purple-900/30 text-center">
                <div className="font-semibold text-purple-800 dark:text-purple-300">Assignment</div>
                <div className="text-xs text-muted-foreground">3 tests</div>
              </div>
              <div className="p-2 rounded bg-green-100 dark:bg-green-900/30 text-center">
                <div className="font-semibold text-green-800 dark:text-green-300">Sorting</div>
                <div className="text-xs text-muted-foreground">3 tests</div>
              </div>
              <div className="p-2 rounded bg-gray-100 dark:bg-gray-900/30 text-center">
                <div className="font-semibold text-gray-800 dark:text-gray-300">Clear</div>
                <div className="text-xs text-muted-foreground">2 tests</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Results Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {extendedQAScenarios.map((scenario, index) => {
            const result = results.find((r) => r.input === scenario.input);
            const isCurrentlyRunning = currentIndex === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={`transition-all duration-300 ${
                    isCurrentlyRunning
                      ? 'ring-2 ring-primary shadow-lg'
                      : result?.passed === true
                        ? 'border-green-500/50 bg-green-50/50 dark:bg-green-900/10'
                        : result?.passed === false
                          ? 'border-red-500/50 bg-red-50/50 dark:bg-red-900/10'
                          : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <Badge className={getCategoryColor(scenario.category)} variant="secondary">
                          {getCategoryIcon(scenario.category)}
                          <span className="ml-1">{scenario.category}</span>
                        </Badge>
                      </div>
                      {result ? (
                        result.passed ? (
                          <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle size={20} className="text-red-500 flex-shrink-0" />
                        )
                      ) : isCurrentlyRunning ? (
                        <RefreshCw size={20} className="text-primary animate-spin flex-shrink-0" />
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-xs text-muted-foreground">User Request:</span>
                        <p className="font-medium text-sm">"{scenario.input}"</p>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">Expected: </span>
                          <code className="px-1 py-0.5 bg-muted rounded">{scenario.expectedCommand}</code>
                        </div>
                        {result && (
                          <div>
                            <span className="text-muted-foreground">Got: </span>
                            <code
                              className={`px-1 py-0.5 rounded ${
                                result.passed ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                              }`}
                            >
                              {result.actualCommand || 'null'}
                            </code>
                          </div>
                        )}
                      </div>

                      {result && (
                        <p className="text-xs text-muted-foreground">{result.description}</p>
                      )}
                    </div>

                    {!result && !isRunning && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => runSingleTest(index)}
                      >
                        <Play size={12} />
                        Run Test
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Summary */}
        {results.length === extendedQAScenarios.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className={passedCount === extendedQAScenarios.length ? 'border-green-500' : 'border-amber-500'}>
              <CardContent className="p-6 text-center">
                {passedCount === extendedQAScenarios.length ? (
                  <>
                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
                    <h2 className="text-2xl font-bold text-green-600 mb-2">All Tests Passed!</h2>
                    <p className="text-muted-foreground">
                      The AI Agent correctly understands all {extendedQAScenarios.length} user request patterns.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle size={48} className="mx-auto text-amber-500 mb-4" />
                    <h2 className="text-2xl font-bold text-amber-600 mb-2">
                      {passedCount}/{extendedQAScenarios.length} Tests Passed
                    </h2>
                    <p className="text-muted-foreground">
                      Some request patterns need improvement. Review failed tests above.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}
