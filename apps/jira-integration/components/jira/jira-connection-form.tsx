'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { isValidJiraDomain, isValidEmail } from '@/lib/jira/utils';

interface JiraConnectionFormProps {
  onConnect: (config: { domain: string; email: string; apiToken: string }) => Promise<void>;
  isLoading?: boolean;
  error?: string;
  success?: boolean;
}

export function JiraConnectionForm({
  onConnect,
  isLoading = false,
  error,
  success = false,
}: JiraConnectionFormProps) {
  const [domain, setDomain] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [apiToken, setApiToken] = React.useState('');
  const [validationErrors, setValidationErrors] = React.useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!domain) {
      errors.domain = 'Domain is required';
    } else if (!isValidJiraDomain(domain)) {
      errors.domain = 'Invalid domain format (e.g., yourcompany.atlassian.net)';
    }

    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }

    if (!apiToken) {
      errors.apiToken = 'API token is required';
    } else if (apiToken.length < 10) {
      errors.apiToken = 'API token seems too short';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onConnect({ domain, email, apiToken });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.2, ease: 'easeOut' },
  };

  return (
    <motion.div {...fadeInUp}>
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Connect to Jira</CardTitle>
          <CardDescription>
            Enter your Jira credentials to connect your workspace. Your credentials are securely stored and never shared.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Domain Input */}
            <div className="space-y-2">
              <Label htmlFor="domain">
                Jira Domain
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="domain"
                type="text"
                placeholder="yourcompany.atlassian.net"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                disabled={isLoading || success}
                className={validationErrors.domain ? 'border-destructive' : ''}
                aria-invalid={!!validationErrors.domain}
                aria-describedby={validationErrors.domain ? 'domain-error' : undefined}
              />
              {validationErrors.domain && (
                <p id="domain-error" className="text-sm text-destructive flex items-center gap-1">
                  <XCircle size={14} />
                  {validationErrors.domain}
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info size={12} className="mt-0.5" />
                Your Jira instance URL (e.g., company.atlassian.net)
              </p>
            </div>

            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || success}
                className={validationErrors.email ? 'border-destructive' : ''}
                aria-invalid={!!validationErrors.email}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
              />
              {validationErrors.email && (
                <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                  <XCircle size={14} />
                  {validationErrors.email}
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info size={12} className="mt-0.5" />
                The email associated with your Jira account
              </p>
            </div>

            {/* API Token Input */}
            <div className="space-y-2">
              <Label htmlFor="apiToken">
                API Token
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="apiToken"
                type="password"
                placeholder="Enter your Jira API token"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                disabled={isLoading || success}
                className={validationErrors.apiToken ? 'border-destructive' : ''}
                aria-invalid={!!validationErrors.apiToken}
                aria-describedby={validationErrors.apiToken ? 'apiToken-error' : undefined}
              />
              {validationErrors.apiToken && (
                <p id="apiToken-error" className="text-sm text-destructive flex items-center gap-1">
                  <XCircle size={14} />
                  {validationErrors.apiToken}
                </p>
              )}
              <p className="text-xs text-muted-foreground flex items-start gap-1">
                <Info size={12} className="mt-0.5" />
                Generate an API token from{' '}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Atlassian Account Settings
                </a>
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-md bg-destructive/10 border border-destructive text-destructive flex items-start gap-2"
                role="alert"
              >
                <XCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Connection Failed</p>
                  <p className="text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Success Message */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-md bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 flex items-start gap-2"
                role="status"
              >
                <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Connected Successfully</p>
                  <p className="text-sm">Your Jira workspace is now connected.</p>
                </div>
              </motion.div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDomain('');
                setEmail('');
                setApiToken('');
                setValidationErrors({});
              }}
              disabled={isLoading || success}
            >
              Clear
            </Button>

            <Button type="submit" disabled={isLoading || success}>
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
                'Connect to Jira'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
}
