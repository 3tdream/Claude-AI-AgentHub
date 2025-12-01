# Jira Integration - Quick Start Guide

Get up and running with Jira integration in 5 minutes!

## Quick Setup (5 Minutes)

### 1. Install Dependencies (1 minute)

```bash
cd apps/jira-integration
pnpm install
```

### 2. Get Jira Credentials (2 minutes)

1. **Get your API token**: Visit [Atlassian API Tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Name it "Jira Integration"
   - Copy the token

2. **Note your details**:
   - Your Jira domain: `yourcompany.atlassian.net`
   - Your email: The email you use for Jira
   - Your API token: The token you just created

### 3. Configure Environment (1 minute)

```bash
# Create environment file
cp .env.example .env.local

# Edit with your favorite editor
code .env.local
```

Add your credentials:
```env
JIRA_DOMAIN=yourcompany.atlassian.net
JIRA_EMAIL=you@company.com
JIRA_API_TOKEN=your_token_here
```

### 4. Start the App (1 minute)

```bash
pnpm dev
```

Visit: http://localhost:3006

### 5. Connect to Jira (30 seconds)

1. Click "Get Started"
2. Enter your credentials (same as `.env.local`)
3. Click "Connect to Jira"
4. You're connected!

## What You Get

- **Dashboard**: View all your Jira issues
- **Search**: Find issues by key, summary, or project
- **Filters**: Quick filters for common queries
- **Issue Cards**: Beautiful cards with status, priority, and more
- **Real-time Updates**: Changes sync automatically

## Next Steps

### View Your Issues

The dashboard shows your issues by default. Use quick filters:
- **My Open Issues**: Your unresolved tickets
- **Recently Updated**: What changed this week
- **High Priority**: Urgent items
- **Due Soon**: Deadlines approaching

### Search

Type in the search box to filter by:
- Issue key (e.g., `PROJ-123`)
- Summary text
- Project name

### Customize

Edit these files to customize:
- `app/jira/page.tsx` - Dashboard layout
- `components/jira/issue-card.tsx` - Issue card design
- `tailwind.config.ts` - Colors and styling

## Common Commands

```bash
# Development
pnpm dev

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Production build
pnpm build
pnpm start
```

## Troubleshooting

### "Connection Failed"
- Verify your domain has no `https://` or `/`
- Check your API token is correct
- Ensure your email matches your Jira account

### "Port 3006 in use"
```bash
# Kill process on port 3006
lsof -i :3006 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Or use different port
pnpm dev -- --port 3007
```

### "Module not found"
```bash
# Reinstall dependencies
rm -rf node_modules .next
pnpm install
```

## Learn More

- **Full Documentation**: See `README.md`
- **Setup Checklist**: See `SETUP_CHECKLIST.md`
- **API Reference**: [Jira REST API Docs](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)

## API Examples

### Fetch Issues

```typescript
import { useJiraIssues } from '@/hooks/use-jira-issues';

const { data, isLoading } = useJiraIssues(
  'project = MYPROJ ORDER BY created DESC'
);
```

### Create Issue

```typescript
import { useCreateJiraIssue } from '@/hooks/use-jira-issues';

const createIssue = useCreateJiraIssue();

await createIssue.mutateAsync({
  fields: {
    project: { key: 'MYPROJ' },
    summary: 'New issue',
    issuetype: { name: 'Task' },
  },
});
```

### Update Issue

```typescript
import { useUpdateJiraIssue } from '@/hooks/use-jira-issues';

const updateIssue = useUpdateJiraIssue('PROJ-123');

await updateIssue.mutateAsync({
  fields: {
    summary: 'Updated summary',
  },
});
```

## JQL Quick Reference

```jql
# My open issues
assignee = currentUser() AND resolution = Unresolved

# High priority
priority IN (Highest, High) AND resolution = Unresolved

# Updated this week
updated >= -7d ORDER BY updated DESC

# Specific project
project = "MYPROJ" AND status != Done

# Due soon
duedate <= 7d AND resolution = Unresolved
```

## Project Structure

```
apps/jira-integration/
├── app/                     # Pages
│   ├── api/jira/           # API routes
│   ├── jira/               # Dashboard
│   └── page.tsx            # Landing page
├── components/
│   ├── jira/               # Jira components
│   └── ui/                 # UI components
├── lib/jira/               # Jira client & types
├── hooks/                  # React Query hooks
└── [config files]
```

## Features Coming Soon

- [ ] Board view (Kanban/Scrum)
- [ ] Sprint management
- [ ] Create/edit issues UI
- [ ] Bulk operations
- [ ] Dark mode
- [ ] Export to CSV

## Need Help?

- Check `README.md` for detailed docs
- See `SETUP_CHECKLIST.md` for troubleshooting
- Review GitHub issues
- Email: support@yourcompany.com

---

**Ready to build?** Start coding in `app/jira/page.tsx`!
