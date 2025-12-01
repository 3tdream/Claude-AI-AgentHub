'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Zap,
  ArrowRight,
  Circle,
  Check,
  Loader2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

type Step = 'checklist' | 'provider' | 'apikey' | 'verify';
type Provider = 'openai' | 'anthropic' | 'gemini';

interface ProviderInfo {
  id: Provider;
  name: string;
  description: string;
  apiKeyUrl: string;
  placeholder: string;
  prefix: string;
}

const providers: ProviderInfo[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5-Turbo, and more',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
    prefix: 'sk-',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
    prefix: 'sk-ant-',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini Pro, Gemini Ultra',
    apiKeyUrl: 'https://aistudio.google.com/app/apikey',
    placeholder: 'AIza...',
    prefix: 'AIza',
  },
];

const API_KEY_STORAGE = 'jira-ai-api-key';

export default function ApiKeySetupPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<Step>('checklist');
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | null>(null);
  const [apiKey, setApiKey] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState<string>();
  const [verifySuccess, setVerifySuccess] = React.useState(false);
  const [validationError, setValidationError] = React.useState<string>();

  // Check if already configured
  React.useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.apiKey && parsed.provider) {
          setSelectedProvider(parsed.provider);
          setApiKey(parsed.apiKey);
        }
      } catch (e) {
        console.error('Failed to parse saved API key config:', e);
      }
    }
  }, []);

  const providerInfo = selectedProvider
    ? providers.find((p) => p.id === selectedProvider)
    : null;

  const checklistItems = [
    {
      id: 'provider',
      label: 'AI Provider',
      description: providerInfo ? providerInfo.name : 'Choose your AI provider',
      completed: !!selectedProvider,
    },
    {
      id: 'apikey',
      label: 'API Key',
      description: apiKey ? '••••••••••••' : 'Your API key from the provider',
      completed: !!apiKey && apiKey.length > 10,
    },
    {
      id: 'verified',
      label: 'Verification',
      description: verifySuccess ? 'API key verified' : 'Test connection',
      completed: verifySuccess,
    },
  ];

  const completedSteps = checklistItems.filter((item) => item.completed).length;

  const validateAndNext = (step: Step) => {
    setValidationError(undefined);

    switch (step) {
      case 'provider':
        if (!selectedProvider) {
          setValidationError('Please select a provider');
          return;
        }
        setCurrentStep('apikey');
        break;
      case 'apikey':
        if (!apiKey) {
          setValidationError('API key is required');
          return;
        }
        if (apiKey.length < 10) {
          setValidationError('API key seems too short');
          return;
        }
        setCurrentStep('verify');
        break;
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerifyError(undefined);

    try {
      // Save to localStorage
      localStorage.setItem(
        API_KEY_STORAGE,
        JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKey,
          configuredAt: new Date().toISOString(),
        })
      );

      // Simulate verification (in real app, make an API call)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simple validation based on prefix
      const provider = providers.find((p) => p.id === selectedProvider);
      if (provider && !apiKey.startsWith(provider.prefix)) {
        throw new Error(`Invalid API key format for ${provider.name}`);
      }

      setVerifySuccess(true);

      // Redirect to Jira page after success
      setTimeout(() => {
        router.push('/jira');
      }, 2000);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3, ease: 'easeOut' },
  };

  const steps: { key: Step; icon: React.ElementType; title: string }[] = [
    { key: 'checklist', icon: CheckCircle, title: 'Checklist' },
    { key: 'provider', icon: Sparkles, title: 'Provider' },
    { key: 'apikey', icon: Key, title: 'API Key' },
    { key: 'verify', icon: Shield, title: 'Verify' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl overflow-hidden">
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
                  <Key className="text-primary" size={24} />
                  API Key Setup
                </CardTitle>
                <CardDescription>
                  Configure your AI provider API key to enable the Jira AI Agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {checklistItems.map((item, index) => (
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
                  </motion.div>
                ))}

                {/* Progress indicator */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Setup Progress</span>
                    <span className="font-medium">{completedSteps}/{checklistItems.length} completed</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-primary to-green-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedSteps / checklistItems.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.push('/jira')}>
                  <ChevronLeft size={16} />
                  Back to Dashboard
                </Button>
                <Button onClick={() => setCurrentStep('provider')} size="lg">
                  {completedSteps === checklistItems.length ? 'Review Settings' : 'Start Setup'}
                  <ArrowRight size={16} />
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* Step: Provider Selection */}
          {currentStep === 'provider' && (
            <motion.div key="provider" {...fadeInUp}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="text-primary" size={24} />
                  Step 1: Choose AI Provider
                </CardTitle>
                <CardDescription>
                  Select the AI service you want to use for your Jira agent
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {providers.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => {
                        setSelectedProvider(provider.id);
                        setValidationError(undefined);
                      }}
                      className={`flex items-center gap-4 p-4 rounded-lg border text-left transition-all ${
                        selectedProvider === provider.id
                          ? 'border-primary bg-primary/5 ring-2 ring-primary'
                          : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                          selectedProvider === provider.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <Zap size={24} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{provider.name}</p>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                      {selectedProvider === provider.id && (
                        <CheckCircle className="text-primary" size={20} />
                      )}
                    </button>
                  ))}
                </div>

                {validationError && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <XCircle size={14} />
                    {validationError}
                  </p>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('checklist')}>
                  <ChevronLeft size={16} />
                  Back
                </Button>
                <Button onClick={() => validateAndNext('provider')}>
                  Next
                  <ChevronRight size={16} />
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* Step: API Key */}
          {currentStep === 'apikey' && providerInfo && (
            <motion.div key="apikey" {...fadeInUp}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="text-primary" size={24} />
                  Step 2: Enter API Key
                </CardTitle>
                <CardDescription>
                  Enter your {providerInfo.name} API key
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Instructions */}
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800 space-y-3">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    How to get your {providerInfo.name} API key:
                  </p>
                  <ol className="text-sm text-amber-700 dark:text-amber-300 space-y-2 list-decimal list-inside">
                    <li>Click the button below to open {providerInfo.name} console</li>
                    <li>Sign in or create an account</li>
                    <li>Navigate to API Keys section</li>
                    <li>Create a new API key</li>
                    <li>Copy and paste it below</li>
                  </ol>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => window.open(providerInfo.apiKeyUrl, '_blank')}
                  >
                    <ExternalLink size={14} />
                    Open {providerInfo.name} Console
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    placeholder={providerInfo.placeholder}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
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
                      Your API key is stored locally in your browser and never sent to our servers.
                    </span>
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('provider')}>
                  <ChevronLeft size={16} />
                  Back
                </Button>
                <Button onClick={() => validateAndNext('apikey')}>
                  Next
                  <ChevronRight size={16} />
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {/* Step: Verify */}
          {currentStep === 'verify' && providerInfo && (
            <motion.div key="verify" {...fadeInUp}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="text-primary" size={24} />
                  Step 3: Verify Connection
                </CardTitle>
                <CardDescription>
                  Test your API key to make sure it works
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Provider</span>
                    </div>
                    <span className="font-medium">{providerInfo.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Key size={16} className="text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">API Key</span>
                    </div>
                    <span className="font-medium font-mono">
                      {apiKey.slice(0, 8)}...{apiKey.slice(-4)}
                    </span>
                  </div>
                </div>

                {/* Error Message */}
                {verifyError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-lg bg-destructive/10 border border-destructive text-destructive flex items-start gap-2"
                    role="alert"
                  >
                    <XCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Verification Failed</p>
                      <p className="text-sm">{verifyError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Success Message */}
                {verifySuccess && (
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
                      API Key Configured!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Redirecting to dashboard...
                    </p>
                  </motion.div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('apikey')} disabled={isVerifying || verifySuccess}>
                  <ChevronLeft size={16} />
                  Back
                </Button>
                <Button onClick={handleVerify} disabled={isVerifying || verifySuccess} size="lg">
                  {isVerifying ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Verifying...
                    </>
                  ) : verifySuccess ? (
                    <>
                      <CheckCircle size={16} />
                      Configured!
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Verify & Save
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
}
