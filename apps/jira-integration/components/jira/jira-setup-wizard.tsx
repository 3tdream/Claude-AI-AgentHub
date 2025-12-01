'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  Copy,
  Check,
  ChevronRight,
  ChevronLeft,
  Key,
  Mail,
  Globe,
  Zap,
  ArrowRight,
  Circle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isValidJiraDomain, isValidEmail } from '@/lib/jira/utils';

interface JiraSetupWizardProps {
  onConnect: (config: { domain: string; email: string; apiToken: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
}

type Step = 'checklist' | 'domain' | 'email' | 'token' | 'connect';

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export function JiraSetupWizard({
  onConnect,
  isLoading = false,
  error,
  success = false,
}: JiraSetupWizardProps) {
  const [currentStep, setCurrentStep] = React.useState<Step>('checklist');
  const [domain, setDomain] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [apiToken, setApiToken] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string>();

  const checklist: ChecklistItem[] = [
    {
      id: 'account',
      label: 'Atlassian Account',
      description: 'You have access to a Jira Cloud instance',
      completed: true,
    },
    {
      id: 'domain',
      label: 'Jira Domain',
      description: domain ? `${domain}` : 'e.g., yourcompany.atlassian.net',
      completed: !!domain && isValidJiraDomain(domain),
    },
    {
      id: 'email',
      label: 'Account Email',
      description: email || 'Your Jira account email',
      completed: !!email && isValidEmail(email),
    },
    {
      id: 'token',
      label: 'API Token',
      description: apiToken ? '••••••••••••' : 'Generate from Atlassian',
      completed: !!apiToken && apiToken.length >= 10,
    },
  ];

  const completedSteps = checklist.filter((item) => item.completed).length;
  const allStepsCompleted = completedSteps === checklist.length;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const validateAndNext = (step: Step) => {
    setValidationError(undefined);

    switch (step) {
      case 'domain':
        if (!domain) {
          setValidationError('Domain is required');
          return;
        }
        if (!isValidJiraDomain(domain)) {
          setValidationError('Invalid domain format (e.g., yourcompany.atlassian.net)');
          return;
        }
        setCurrentStep('email');
        break;
      case 'email':
        if (!email) {
          setValidationError('Email is required');
          return;
        }
        if (!isValidEmail(email)) {
          setValidationError('Invalid email format');
          return;
        }
        setCurrentStep('token');
        break;
      case 'token':
        if (!apiToken) {
          setValidationError('API token is required');
          return;
        }
        if (apiToken.length < 10) {
          setValidationError('API token seems too short');
          return;
        }
        setCurrentStep('connect');
        break;
    }
  };

  const handleConnect = async () => {
    await onConnect({ domain, email, apiToken });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  };

  const steps: { key: Step; icon: React.ElementType; title: string }[] = [
    { key: 'checklist', icon: CheckCircle, title: 'Checklist' },
    { key: 'domain', icon: Globe, title: 'Domain' },
    { key: 'email', icon: Mail, title: 'Email' },
    { key: 'token', icon: Key, title: 'Token' },
    { key: 'connect', icon: Zap, title: 'Connect' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      {/* Progress Steps */}
      <div className="bg-muted/50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.key;
            const isCompleted = index < currentStepIndex;
            const isPast = index <= currentStepIndex;

            return (
              <React.Fragment key={step.key}>
                <button
                  onClick={() => index <= currentStepIndex && setCurrentStep(step.key)}
                  disabled={index > currentStepIndex}
                  className={`flex flex-col items-center gap-1 transition-all ${
                    isPast ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground scale-110'
                        : isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {step.title}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-green-500' : 'bg-muted-foreground/20'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step: Checklist */}
        {currentStep === 'checklist' && (
          <motion.div key="checklist" {...fadeInUp}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="text-primary" size={24} />
                Setup Checklist
              </CardTitle>
              <CardDescription>
                Complete these steps to connect your Jira workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {checklist.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                    item.completed
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      item.completed
                        ? 'bg-green-500 text-white'
                        : 'bg-muted-foreground/20 text-muted-foreground'
                    }`}
                  >
                    {item.completed ? <Check size={16} /> : <Circle size={16} />}
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${item.completed ? 'text-green-700 dark:text-green-300' : ''}`}>
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  {!item.completed && item.id !== 'account' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentStep(item.id as Step)}
                      className="flex-shrink-0"
                    >
                      Add
                      <ChevronRight size={14} />
                    </Button>
                  )}
                </motion.div>
              ))}

              {/* Progress indicator */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Setup Progress</span>
                  <span className="font-medium">{completedSteps}/{checklist.length} completed</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-primary to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedSteps / checklist.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => setCurrentStep('domain')}
                className="w-full"
                size="lg"
              >
                {allStepsCompleted ? 'Review & Connect' : 'Start Setup'}
                <ArrowRight size={16} />
              </Button>
            </CardFooter>
          </motion.div>
        )}

        {/* Step: Domain */}
        {currentStep === 'domain' && (
          <motion.div key="domain" {...fadeInUp}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="text-primary" size={24} />
                Step 1: Jira Domain
              </CardTitle>
              <CardDescription>
                Enter your Atlassian Jira Cloud domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Jira Domain</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="yourcompany.atlassian.net"
                  value={domain}
                  onChange={(e) => {
                    setDomain(e.target.value);
                    setValidationError(undefined);
                  }}
                  className={validationError ? 'border-destructive' : ''}
                />
                {validationError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle size={14} />
                    {validationError}
                  </p>
                )}
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                  <Info size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Your domain is the URL you use to access Jira. It looks like{' '}
                    <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">yourcompany.atlassian.net</code>
                  </span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('checklist')}>
                <ChevronLeft size={16} />
                Back
              </Button>
              <Button onClick={() => validateAndNext('domain')}>
                Next
                <ChevronRight size={16} />
              </Button>
            </CardFooter>
          </motion.div>
        )}

        {/* Step: Email */}
        {currentStep === 'email' && (
          <motion.div key="email" {...fadeInUp}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="text-primary" size={24} />
                Step 2: Account Email
              </CardTitle>
              <CardDescription>
                Enter the email associated with your Jira account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setValidationError(undefined);
                  }}
                  className={validationError ? 'border-destructive' : ''}
                />
                {validationError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle size={14} />
                    {validationError}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('domain')}>
                <ChevronLeft size={16} />
                Back
              </Button>
              <Button onClick={() => validateAndNext('email')}>
                Next
                <ChevronRight size={16} />
              </Button>
            </CardFooter>
          </motion.div>
        )}

        {/* Step: Token */}
        {currentStep === 'token' && (
          <motion.div key="token" {...fadeInUp}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="text-primary" size={24} />
                Step 3: API Token
              </CardTitle>
              <CardDescription>
                Generate and enter your Jira API token
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instructions */}
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 space-y-3">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  How to get your API token:
                </p>
                <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-2 list-decimal list-inside">
                  <li>Click the button below to open Atlassian settings</li>
                  <li>Click "Create API token"</li>
                  <li>Give it a name (e.g., "Jira Integration")</li>
                  <li>Copy the generated token</li>
                  <li>Paste it in the field below</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open('https://id.atlassian.com/manage-profile/security/api-tokens', '_blank')}
                >
                  <ExternalLink size={14} />
                  Open Atlassian API Tokens
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiToken">API Token</Label>
                <div className="relative">
                  <Input
                    id="apiToken"
                    type="password"
                    placeholder="Paste your API token here"
                    value={apiToken}
                    onChange={(e) => {
                      setApiToken(e.target.value);
                      setValidationError(undefined);
                    }}
                    className={validationError ? 'border-destructive pr-10' : 'pr-10'}
                  />
                  {apiToken && (
                    <button
                      type="button"
                      onClick={() => copyToClipboard(apiToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  )}
                </div>
                {validationError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle size={14} />
                    {validationError}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('email')}>
                <ChevronLeft size={16} />
                Back
              </Button>
              <Button onClick={() => validateAndNext('token')}>
                Next
                <ChevronRight size={16} />
              </Button>
            </CardFooter>
          </motion.div>
        )}

        {/* Step: Connect */}
        {currentStep === 'connect' && (
          <motion.div key="connect" {...fadeInUp}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="text-primary" size={24} />
                Step 4: Connect
              </CardTitle>
              <CardDescription>
                Review your settings and connect to Jira
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Globe size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Domain</span>
                  </div>
                  <span className="font-medium">{domain}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Email</span>
                  </div>
                  <span className="font-medium">{email}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Key size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">API Token</span>
                  </div>
                  <span className="font-medium">••••••••••••</span>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive flex items-start gap-2"
                  role="alert"
                >
                  <XCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Connection Failed</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-center"
                  role="status"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  >
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
                  </motion.div>
                  <p className="font-semibold text-green-700 dark:text-green-300 text-lg">
                    Connected Successfully!
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Redirecting to dashboard...
                  </p>
                </motion.div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep('token')} disabled={isLoading || success}>
                <ChevronLeft size={16} />
                Back
              </Button>
              <Button onClick={handleConnect} disabled={isLoading || success} size="lg">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Connecting...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle size={16} />
                    Connected
                  </>
                ) : (
                  <>
                    <Zap size={16} />
                    Connect to Jira
                  </>
                )}
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
