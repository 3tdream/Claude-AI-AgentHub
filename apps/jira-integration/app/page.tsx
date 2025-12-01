'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Github, BookOpen, Zap, Loader2 } from 'lucide-react';
import { JiraSetupWizard } from '@/components/jira/jira-setup-wizard';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import type { JiraConfig, JiraUser } from '@/lib/jira/types';

export default function HomePage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);
  const [error, setError] = React.useState<string>();
  const [connectedUser, setConnectedUser] = React.useState<JiraUser | null>(null);

  // Check if already connected and redirect to /jira
  React.useEffect(() => {
    axios.get('/api/jira/me')
      .then((res) => {
        if (res.data.email) {
          // Already connected, redirect to dashboard
          router.replace('/jira');
        } else {
          setIsCheckingAuth(false);
        }
      })
      .catch(() => {
        // Not connected, show setup wizard
        setIsCheckingAuth(false);
      });
  }, [router]);

  const handleConnect = async (config: JiraConfig) => {
    setIsConnecting(true);
    setError(undefined);

    try {
      const response = await axios.post('/api/jira/connect', config);

      if (response.data.success) {
        setConnectedUser(response.data.user);
        // In a real app, you'd store this securely and redirect to the dashboard
        setTimeout(() => {
          window.location.href = '/jira';
        }, 1500);
      }
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.error || 'Connection failed');
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking connection...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
      {...fadeIn}
    >
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-primary" strokeWidth={2} />
              <h1 className="text-xl font-bold">Jira Integration</h1>
            </div>

            <nav className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <a
                  href="https://github.com/yourusername/jira-integration"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github size={16} />
                  GitHub
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href="#docs">
                  <BookOpen size={16} />
                  Docs
                </a>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <motion.div
          className="max-w-4xl mx-auto space-y-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {/* Hero Section */}
          <motion.div className="text-center space-y-4" variants={fadeInUp}>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              Connect to Jira in Seconds
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A modern, production-ready Jira integration built with Next.js 15, TypeScript, and Tailwind CSS.
              Manage issues, boards, and sprints with a beautiful, accessible interface.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={fadeInUp}
          >
            {features.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden">
                <CardContent className="p-6 space-y-2">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `hsl(${feature.color})` }}
                  >
                    <feature.icon size={24} className="text-white" strokeWidth={2} />
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Setup Wizard */}
          <motion.div variants={fadeInUp}>
            <JiraSetupWizard
              onConnect={handleConnect}
              isLoading={isConnecting}
              error={error}
              success={!!connectedUser}
            />
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-24">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-sm text-muted-foreground">
            Built with Claude Code • Open Source • MIT License
          </p>
        </div>
      </footer>
    </motion.div>
  );
}

const features = [
  {
    title: 'Type-Safe',
    description: 'Full TypeScript support with comprehensive type definitions for all Jira entities.',
    icon: Zap,
    color: '207 90% 54%',
  },
  {
    title: 'Modern UI',
    description: 'Built with shadcn/ui components, Tailwind CSS, and Framer Motion animations.',
    icon: BookOpen,
    color: '142 71% 45%',
  },
  {
    title: 'Accessible',
    description: 'WCAG 2.1 AA compliant with keyboard navigation and screen reader support.',
    icon: Github,
    color: '271 91% 65%',
  },
];
