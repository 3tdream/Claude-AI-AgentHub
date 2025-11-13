"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FileText,
  CheckSquare,
  BookOpen,
  Bot,
  Code2,
  Zap,
  Globe,
  MessageSquare,
  Layers,
  Settings,
  Database,
  Key,
  Activity,
  Sparkles,
  Brain,
  Users,
  Clock,
  Package,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TabType = "overview" | "tasks" | "documentation" | "agents";

export default function DevPortalPage() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: FileText },
    { id: "tasks" as TabType, label: "Tasks", icon: CheckSquare },
    { id: "documentation" as TabType, label: "Documentation", icon: BookOpen },
    { id: "agents" as TabType, label: "Agents", icon: Bot },
  ];

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950">
      {/* Header with Enhanced Visual Impact */}
      <div className="border-b bg-white dark:bg-slate-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span className="font-medium">Back to App</span>
                </Button>
              </Link>
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Developer Portal
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  OpenAI Realtime Slideshow AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="font-normal gap-1.5">
                <Activity className="h-3 w-3 text-green-500" />
                Active Session
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="border-b bg-white dark:bg-slate-900 sticky top-[52px] z-40">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex gap-1 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative px-6 py-4 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? "text-primary"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                    }
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8 pb-16">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "tasks" && <TasksTab />}
          {activeTab === "documentation" && <DocumentationTab />}
          {activeTab === "agents" && <AgentsTab />}
        </motion.div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const stats = [
    { label: "Total Routes", value: "2", icon: Globe, color: "text-blue-600" },
    { label: "Components", value: "36", icon: Package, color: "text-purple-600" },
    { label: "Hooks", value: "6", icon: Code2, color: "text-orange-600" },
    { label: "AI Tools", value: "7", icon: Sparkles, color: "text-green-600" },
  ];

  return (
    <div className="space-y-8 w-full">
      {/* Hero Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Code2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
              Welcome to the Developer Portal
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage and understand your OpenAI Realtime Slideshow AI application
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 bg-slate-50 dark:bg-slate-800 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="secondary" className="font-normal">v15.1.1</Badge>
            </div>
            <CardTitle className="text-lg mt-4">App Overview</CardTitle>
            <CardDescription>
              Real-time voice AI slideshow application powered by OpenAI Realtime API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-slate-700 dark:text-slate-300">Next.js 15.1.1</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-slate-700 dark:text-slate-300">OpenAI Realtime API</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-slate-700 dark:text-slate-300">WebRTC Audio</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-slate-700 dark:text-slate-300">TypeScript + Tailwind</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="secondary" className="font-normal">7 Tools</Badge>
            </div>
            <CardTitle className="text-lg mt-4">AI Capabilities</CardTitle>
            <CardDescription>
              Pixel can interact with slides through 7 available tools
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">Update slide content</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">Navigate slides</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">Modify blocks</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-slate-700 dark:text-slate-300">Voice + Text input</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <Badge variant="secondary" className="font-normal">Multi-lang</Badge>
            </div>
            <CardTitle className="text-lg mt-4">Features</CardTitle>
            <CardDescription>
              Real-time audio streaming and multilingual support
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-700 dark:text-slate-300">WebRTC Streaming</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-700 dark:text-slate-300">English & Hebrew</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-700 dark:text-slate-300">RTL Support</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-slate-700 dark:text-slate-300">Responsive Design</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Architecture Overview */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Layers className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-xl">System Architecture</CardTitle>
              <CardDescription>High-level overview of application structure</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Frontend</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Next.js 15 app with responsive layouts (desktop 3-column, mobile single-column).
                Real-time WebRTC audio streaming with OpenAI Realtime API integration.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-slate-900 dark:text-white">State Management</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Zustand stores for slides and language. Custom hooks for WebRTC session,
                microphone, and tool functions.
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-600" />
                <h4 className="font-semibold text-slate-900 dark:text-white">API Integration</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                POST /api/session creates OpenAI Realtime sessions. WebRTC establishes
                bidirectional audio streaming for real-time AI conversations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TasksTab() {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <CheckSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Tasks</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Track development tasks and project progress
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="w-full border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Clock className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Task Management</CardTitle>
              <CardDescription>Coming soon - integrate with your project management tools</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              This section will help you manage development tasks, track bugs, and plan features.
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="font-normal">Task Tracking</Badge>
              <Badge variant="secondary" className="font-normal">Bug Management</Badge>
              <Badge variant="secondary" className="font-normal">Feature Planning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DocumentationTab() {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Documentation</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Technical documentation and guides
            </p>
          </div>
        </div>
      </div>

      {/* Documentation Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">App Structure</CardTitle>
                <CardDescription>Complete codebase documentation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Comprehensive documentation of routes, components, hooks, and data structures.
            </p>
            <Link href="/dev-portal/docs">
              <Button variant="outline" size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                View Documentation
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-lg">API Reference</CardTitle>
                <CardDescription>OpenAI Realtime API integration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Model</span>
                <span className="text-sm text-slate-900 dark:text-white font-mono">gpt-4o-realtime-preview</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Voice</span>
                <span className="text-sm text-slate-900 dark:text-white">shimmer</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Modalities</span>
                <span className="text-sm text-slate-900 dark:text-white">audio, text</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Available Tools</CardTitle>
                <CardDescription>AI function calling capabilities</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[
                "getCurrentSlide",
                "updateCurrentSlideTitle",
                "updateCurrentSlideDescription",
                "updateSlideBlock",
                "nextSlide",
                "prevSlide",
                "getCurrentTime",
              ].map((tool) => (
                <div key={tool} className="flex items-center gap-2 text-sm">
                  <Code2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-slate-700 dark:text-slate-300 font-mono">{tool}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Key className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Environment Variables</CardTitle>
                <CardDescription>Required configuration</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white font-mono mb-1">
                  OPENAI_API_KEY
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  OpenAI API key for Realtime API access
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AgentsTab() {
  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-lg">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">AI Agents</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage AI agent configurations and personalities
            </p>
          </div>
        </div>
      </div>

      {/* Current Agent */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <CardTitle className="text-xl">Current Agent: Pixel</CardTitle>
                <CardDescription>Friendly AI helper for teaching kids about technology</CardDescription>
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 font-normal">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Personality</h4>
              </div>
              <div className="space-y-2">
                {[
                  "Super friendly and patient",
                  "Playful and creative",
                  "Enthusiastic about AI tools",
                  "Makes learning fun",
                ].map((trait) => (
                  <div key={trait} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    <span className="text-slate-700 dark:text-slate-300">{trait}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                <h4 className="font-semibold text-slate-900 dark:text-white">Teaching Approach</h4>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Uses simple, clear English with fun examples. Encourages experimentation
                and celebrates every success.
              </p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-green-600" />
              <h4 className="font-semibold text-slate-900 dark:text-white">Language Support</h4>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary" className="font-normal">English</Badge>
              <Badge variant="secondary" className="font-normal">Hebrew (RTL)</Badge>
              <Badge variant="secondary" className="font-normal">Multilingual Ready</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Management */}
      <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </div>
            <div>
              <CardTitle className="text-xl">Agent Management</CardTitle>
              <CardDescription>Configure and manage AI agents</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Future: Create custom agents, modify system prompts, and manage agent behaviors.
            </p>
            <div className="flex gap-2">
              <Badge variant="secondary" className="font-normal">Custom Agents</Badge>
              <Badge variant="secondary" className="font-normal">Prompt Engineering</Badge>
              <Badge variant="secondary" className="font-normal">Behavior Tuning</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
