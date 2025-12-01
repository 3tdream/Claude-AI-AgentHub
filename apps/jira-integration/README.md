# Jira Integration

A modern, production-ready Jira integration interface built with Next.js 15, TypeScript, Tailwind CSS, and shadcn/ui. Connect to your Jira workspace and manage issues, boards, and sprints with a beautiful, accessible UI.

## Features

- **Type-Safe Jira API Client**: Fully typed Jira REST API v3 client with comprehensive type definitions
- **Modern UI Components**: Built with shadcn/ui, Radix UI primitives, and Tailwind CSS
- **Smooth Animations**: Framer Motion animations and micro-interactions
- **Accessible**: WCAG 2.1 AA compliant with keyboard navigation and ARIA labels
- **Issue Management**: View, create, update, and delete Jira issues
- **Board Views**: Kanban and Scrum board visualization
- **Sprint Management**: Track sprint progress and manage sprint issues
- **Real-time Updates**: React Query integration for optimistic updates
- **Responsive Design**: Mobile-first design that works on all screen sizes

## Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ with HSL color system
- **Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **State Management**: React Query (TanStack Query)
- **API Client**: Axios
- **Forms**: React Hook Form (future enhancement)

## Getting Started

### Prerequisites

- Node.js >= 18.17.0
- pnpm >= 8.0.0 (or npm/yarn)
- A Jira account with API access

### Installation

1. **Clone the repository** (if not already in monorepo):

```bash
# If in monorepo, navigate to app directory
cd apps/jira-integration

# If standalone
git clone <repository-url>
cd jira-integration
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Set up environment variables**:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Jira credentials:

```env
JIRA_DOMAIN=yourcompany.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=your_api_token_here
```

### Getting Your Jira API Token

1. Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click "Create API token"
3. Give it a name (e.g., "Jira Integration")
4. Copy the token and paste it into your `.env.local` file

**Important**: Keep your API token secure and never commit it to version control!

### Running the App

```bash
# Development mode
pnpm dev

# The app will be available at http://localhost:3006
```

```bash
# Production build
pnpm build
pnpm start
```

## Project Structure

```
apps/jira-integration/
├── app/                          # Next.js App Router pages
│   ├── api/jira/                # API routes for Jira integration
│   │   ├── connect/             # Connection endpoint
│   │   └── issues/              # Issues CRUD endpoints
│   ├── jira/                    # Jira dashboard pages
│   │   └── page.tsx             # Main dashboard
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   ├── providers.tsx            # React Query provider
│   └── globals.css              # Global styles
├── components/
│   ├── jira/                    # Jira-specific components
│   │   ├── jira-connection-form.tsx
│   │   └── issue-card.tsx
│   └── ui/                      # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── badge.tsx
├── lib/
│   ├── jira/                    # Jira integration logic
│   │   ├── api.ts               # Jira API client
│   │   ├── types.ts             # TypeScript type definitions
│   │   └── utils.ts             # Utility functions
│   └── utils.ts                 # General utilities (cn)
├── hooks/
│   └── use-jira-issues.ts       # React Query hooks
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies
```

## API Client Usage

### Basic Example

```typescript
import { createJiraClient } from '@/lib/jira/api';

const client = createJiraClient({
  domain: 'yourcompany.atlassian.net',
  email: 'you@company.com',
  apiToken: 'your_api_token',
});

// Get issues
const result = await client.searchIssues('project = PROJ ORDER BY created DESC');
console.log(result.issues);

// Get specific issue
const issue = await client.getIssue('PROJ-123');
console.log(issue.fields.summary);

// Create issue
const newIssue = await client.createIssue({
  fields: {
    project: { key: 'PROJ' },
    summary: 'New issue from API',
    issuetype: { name: 'Task' },
    priority: { name: 'Medium' },
  },
});

// Update issue
await client.updateIssue('PROJ-123', {
  fields: {
    summary: 'Updated summary',
  },
});
```

### React Hooks

```typescript
'use client';

import { useJiraIssues, useCreateJiraIssue } from '@/hooks/use-jira-issues';

function MyComponent() {
  // Fetch issues
  const { data, isLoading, error } = useJiraIssues(
    'assignee = currentUser() AND resolution = Unresolved'
  );

  // Create issue mutation
  const createIssue = useCreateJiraIssue();

  const handleCreate = async () => {
    await createIssue.mutateAsync({
      fields: {
        project: { key: 'PROJ' },
        summary: 'New issue',
        issuetype: { name: 'Task' },
      },
    });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data?.issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  );
}
```

## Component Examples

### Issue Card

```typescript
import { IssueCard } from '@/components/jira/issue-card';

<IssueCard
  issue={issue}
  onClick={() => router.push(`/jira/issues/${issue.key}`)}
  showProject={true}
/>
```

### Connection Form

```typescript
import { JiraConnectionForm } from '@/components/jira/jira-connection-form';

<JiraConnectionForm
  onConnect={async (config) => {
    // Handle connection
    await connectToJira(config);
  }}
  isLoading={isConnecting}
  error={errorMessage}
  success={isConnected}
/>
```

## Design System

### HSL Color System

The app uses HSL-based CSS variables for consistent theming:

```css
--primary: 222.2 47.4% 11.2%
--primary-foreground: 210 40% 98%
--secondary: 210 40% 96.1%
--muted: 210 40% 96.1%
--accent: 210 40% 96.1%
--destructive: 0 84.2% 60.2%
```

### Jira-Specific Colors

```typescript
// Issue types
epic: 'hsl(271 91% 65%)'     // Purple
story: 'hsl(142 71% 45%)'    // Green
task: 'hsl(207 90% 54%)'     // Blue
bug: 'hsl(0 84% 60%)'        // Red
subtask: 'hsl(180 77% 47%)'  // Cyan

// Priorities
highest: 'hsl(0 84% 60%)'    // Red
high: 'hsl(25 95% 53%)'      // Orange
medium: 'hsl(43 96% 56%)'    // Yellow
low: 'hsl(142 71% 45%)'      // Green
lowest: 'hsl(240 5% 64%)'    // Gray
```

## API Endpoints

### POST `/api/jira/connect`

Test Jira connection.

**Request Body**:
```json
{
  "domain": "yourcompany.atlassian.net",
  "email": "you@company.com",
  "apiToken": "your_token"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "accountId": "...",
    "displayName": "John Doe",
    "emailAddress": "john@company.com"
  }
}
```

### GET `/api/jira/issues?jql=...`

Search for issues using JQL.

**Query Parameters**:
- `jql`: JQL query string
- `maxResults`: Maximum number of results (default: 50)

**Response**:
```json
{
  "total": 100,
  "issues": [...]
}
```

### GET `/api/jira/issues/[issueKey]`

Get a specific issue.

### POST `/api/jira/issues`

Create a new issue.

### PUT `/api/jira/issues/[issueKey]`

Update an issue.

### DELETE `/api/jira/issues/[issueKey]`

Delete an issue.

## JQL (Jira Query Language)

Common JQL queries:

```jql
// My open issues
assignee = currentUser() AND resolution = Unresolved

// High priority bugs
priority IN (Highest, High) AND issuetype = Bug AND resolution = Unresolved

// Recently updated
updated >= -7d ORDER BY updated DESC

// Issues due this week
duedate <= 7d AND resolution = Unresolved

// Project issues
project = "PROJ" AND status != Done ORDER BY created DESC
```

## Accessibility

This app follows WCAG 2.1 AA standards:

- All interactive elements have visible focus states
- Minimum contrast ratio of 4.5:1 for text
- ARIA labels for icon-only buttons
- Semantic HTML elements
- Keyboard navigation support
- Screen reader compatible

### Keyboard Shortcuts

- `Tab`: Navigate between elements
- `Enter/Space`: Activate buttons and cards
- `Escape`: Close modals/dialogs

## Performance Optimizations

- **Server-Side Rendering**: Initial data fetched on server
- **React Query Caching**: Automatic request deduplication
- **Optimistic Updates**: Instant UI feedback
- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component

## Security Best Practices

1. **Never commit API tokens** to version control
2. **Use environment variables** for sensitive data
3. **Validate all inputs** on both client and server
4. **Sanitize JQL queries** to prevent injection
5. **Use HTTPS** in production
6. **Implement rate limiting** for API routes
7. **Store tokens securely** (encrypted cookies/database)

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import repository in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3006
CMD ["node", "server.js"]
```

## Troubleshooting

### Connection Issues

**Problem**: "Failed to connect to Jira"

**Solutions**:
1. Verify your domain is correct (without `https://`)
2. Ensure your API token is valid
3. Check that your email matches your Jira account
4. Verify network connectivity

### API Token Invalid

**Problem**: "Unauthorized" or "Invalid credentials"

**Solutions**:
1. Generate a new API token
2. Ensure no extra spaces in environment variables
3. Check that your account has API access

### Rate Limiting

**Problem**: "Too many requests"

**Solutions**:
1. Implement caching with React Query
2. Add request debouncing
3. Reduce polling frequency

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Documentation: [Jira REST API v3](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- Issues: Create an issue on GitHub
- Email: support@yourcompany.com

## Roadmap

- [ ] Dark mode support
- [ ] Board view (Kanban/Scrum)
- [ ] Sprint management UI
- [ ] Bulk operations
- [ ] Export to CSV/PDF
- [ ] Advanced filtering
- [ ] Real-time updates with webhooks
- [ ] Offline support with PWA
- [ ] Mobile app (React Native)

## Credits

Built with:
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Radix UI](https://www.radix-ui.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev/)
- [React Query](https://tanstack.com/query/latest)

Generated with Claude Code by Anthropic.

---

**Last Updated**: November 2025
