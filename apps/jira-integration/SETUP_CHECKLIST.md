# Jira Integration Setup Checklist

This comprehensive checklist will guide you through setting up the Jira integration from scratch.

## Prerequisites Checklist

- [ ] Node.js >= 18.17.0 installed
  ```bash
  node --version  # Should show v18.17.0 or higher
  ```

- [ ] pnpm >= 8.0.0 installed (or npm/yarn)
  ```bash
  pnpm --version  # Should show 8.0.0 or higher
  # Install if needed: npm install -g pnpm@8.15.0
  ```

- [ ] Git installed
  ```bash
  git --version
  ```

- [ ] Active Jira Cloud account
  - Your organization's Jira instance (e.g., `yourcompany.atlassian.net`)
  - Admin or user access to create API tokens

## Step 1: Get Jira API Credentials

### 1.1 Find Your Jira Domain

- [ ] Log into your Jira account
- [ ] Copy the domain from your browser URL
  - Example: If URL is `https://mycompany.atlassian.net/jira/...`
  - Your domain is: `mycompany.atlassian.net`
- [ ] Write it down (you'll need it for `.env.local`)

### 1.2 Generate API Token

- [ ] Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
- [ ] Click "Create API token"
- [ ] Enter a label (e.g., "Jira Integration - Development")
- [ ] Click "Create"
- [ ] Copy the token immediately (you can't view it again!)
- [ ] Store it securely (password manager recommended)

### 1.3 Verify Your Email

- [ ] Confirm the email address associated with your Jira account
- [ ] Go to [Atlassian Profile](https://id.atlassian.com/manage-profile/profile-and-visibility)
- [ ] Note your email address

## Step 2: Install Dependencies

### 2.1 Navigate to Project

```bash
# If in monorepo
cd apps/jira-integration

# If standalone
cd jira-integration
```

- [ ] Verify you're in the correct directory
  ```bash
  ls package.json  # Should exist
  ```

### 2.2 Install Packages

```bash
pnpm install
```

- [ ] Wait for installation to complete
- [ ] Verify no critical errors in output
- [ ] Check that `node_modules` folder was created

### 2.3 Verify Installation

```bash
# Check that Next.js is installed
pnpm next --version
```

- [ ] Should show Next.js version 15 or higher

## Step 3: Configure Environment Variables

### 3.1 Create Environment File

```bash
cp .env.example .env.local
```

- [ ] Verify `.env.local` was created
  ```bash
  ls -la .env.local
  ```

### 3.2 Edit Environment File

Open `.env.local` in your editor:

```bash
# VS Code
code .env.local

# Or any text editor
nano .env.local
```

- [ ] Replace `yourcompany.atlassian.net` with your domain
- [ ] Replace `you@company.com` with your email
- [ ] Replace `your_api_token_here` with your API token

Example:
```env
JIRA_DOMAIN=acme-corp.atlassian.net
JIRA_EMAIL=john.doe@acme-corp.com
JIRA_API_TOKEN=ATATT3xFfGF0...
```

### 3.3 Verify Environment Variables

- [ ] No extra spaces before or after values
- [ ] No quotes around values (unless part of the actual value)
- [ ] Domain does NOT include `https://` or `/`
- [ ] Email is correct format
- [ ] API token is complete (usually starts with `ATATT`)

## Step 4: Test Connection

### 4.1 Start Development Server

```bash
pnpm dev
```

- [ ] Server starts without errors
- [ ] You see output: "Ready on http://localhost:3006"
- [ ] No TypeScript errors shown

### 4.2 Test API Connection

Open a new terminal and test the connection:

```bash
curl -X POST http://localhost:3006/api/jira/connect \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "yourcompany.atlassian.net",
    "email": "you@company.com",
    "apiToken": "your_token"
  }'
```

Replace values with your actual credentials.

Expected response:
```json
{
  "success": true,
  "user": {
    "accountId": "...",
    "displayName": "Your Name",
    "emailAddress": "you@company.com"
  }
}
```

- [ ] Response shows `"success": true`
- [ ] Your user information is displayed
- [ ] No error messages

### 4.3 Open in Browser

- [ ] Open http://localhost:3006 in your browser
- [ ] Landing page loads successfully
- [ ] Click "Get Started" button
- [ ] Connection form appears
- [ ] Fill in your credentials
- [ ] Click "Connect to Jira"
- [ ] Connection succeeds (green checkmark)

## Step 5: Verify Features

### 5.1 Dashboard Access

- [ ] Navigate to http://localhost:3006/jira
- [ ] Dashboard loads
- [ ] Your issues are displayed
- [ ] No error messages in browser console

### 5.2 Issue Display

- [ ] Issues show correct information:
  - [ ] Issue key (e.g., PROJ-123)
  - [ ] Summary/title
  - [ ] Status badge
  - [ ] Assignee name
  - [ ] Last updated time
  - [ ] Priority indicator
  - [ ] Issue type icon

### 5.3 Search Functionality

- [ ] Type in search box
- [ ] Issues filter as you type
- [ ] Search works for:
  - [ ] Issue key
  - [ ] Summary text
  - [ ] Project name

### 5.4 Quick Filters

Test each quick filter button:
- [ ] "My Open Issues" - shows your unresolved issues
- [ ] "Recently Updated" - shows recent updates
- [ ] "High Priority" - shows high/highest priority
- [ ] "Due Soon" - shows issues due within 7 days

## Step 6: Troubleshooting (If Needed)

### Common Issue 1: Connection Failed

Symptoms:
- Red error message: "Connection failed"
- API returns 401 Unauthorized

Solutions:
- [ ] Verify domain format (no https://, no trailing slash)
- [ ] Regenerate API token
- [ ] Check email matches Jira account
- [ ] Ensure account has API access
- [ ] Test with curl command to isolate issue

### Common Issue 2: Module Not Found

Symptoms:
- Error: "Cannot find module ..."
- TypeScript errors about missing types

Solutions:
- [ ] Delete `node_modules` and reinstall:
  ```bash
  rm -rf node_modules
  pnpm install
  ```
- [ ] Clear Next.js cache:
  ```bash
  rm -rf .next
  pnpm dev
  ```

### Common Issue 3: Port Already in Use

Symptoms:
- Error: "Port 3006 is already in use"

Solutions:
- [ ] Kill process on port 3006:
  ```bash
  # Find process
  lsof -i :3006
  # Kill it (replace PID)
  kill -9 <PID>
  ```
- [ ] Or use different port:
  ```bash
  pnpm dev -- --port 3007
  ```

### Common Issue 4: CORS Errors

Symptoms:
- Browser console shows CORS errors
- API requests fail from browser

Solutions:
- [ ] Verify you're accessing app on correct URL (localhost:3006)
- [ ] Check `next.config.ts` is properly configured
- [ ] Ensure API routes are in `app/api/` directory

### Common Issue 5: Hydration Errors

Symptoms:
- Warning: "Hydration failed"
- Content flickers on page load

Solutions:
- [ ] Check for `Date.now()` or `Math.random()` in components
- [ ] Verify no `typeof window` conditionals during SSR
- [ ] Use `suppressHydrationWarning` only as last resort

## Step 7: Development Workflow

### 7.1 Daily Development

- [ ] Start dev server: `pnpm dev`
- [ ] Open app: http://localhost:3006
- [ ] Make changes to code
- [ ] Changes hot-reload automatically
- [ ] Test in browser

### 7.2 Type Checking

```bash
pnpm typecheck
```

- [ ] No TypeScript errors
- [ ] All types are correct

### 7.3 Linting

```bash
pnpm lint
```

- [ ] No linting errors
- [ ] Code follows style guide

### 7.4 Building for Production

```bash
pnpm build
```

- [ ] Build succeeds
- [ ] No errors in output
- [ ] `.next` directory created

```bash
pnpm start
```

- [ ] Production server starts
- [ ] App works in production mode

## Step 8: Advanced Configuration (Optional)

### 8.1 Custom Port

Edit `package.json`:
```json
{
  "scripts": {
    "dev": "next dev --port 3007"
  }
}
```

### 8.2 Custom Base Path

Edit `next.config.ts`:
```typescript
const nextConfig = {
  basePath: '/jira-integration',
  // ...
}
```

### 8.3 Environment-Specific Configs

Create additional env files:
- `.env.development` - Development overrides
- `.env.production` - Production settings
- `.env.test` - Testing configuration

### 8.4 TypeScript Strict Mode

Edit `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitAny": true
  }
}
```

## Step 9: Integration Testing

### 9.1 Test All CRUD Operations

Create Issue:
- [ ] Click "New Issue" button (when implemented)
- [ ] Fill in form
- [ ] Submit successfully
- [ ] Issue appears in list

Update Issue:
- [ ] Click on an issue
- [ ] Edit fields (when detail page implemented)
- [ ] Save changes
- [ ] Changes reflect in UI

Delete Issue:
- [ ] Select an issue
- [ ] Click delete (when implemented)
- [ ] Confirm deletion
- [ ] Issue removed from list

### 9.2 Test Error Handling

- [ ] Disconnect internet
- [ ] Try to fetch issues
- [ ] Error message appears
- [ ] Can retry connection

### 9.3 Test Performance

- [ ] Dashboard loads < 2 seconds
- [ ] Search responds instantly
- [ ] No lag when switching filters
- [ ] Smooth animations

## Step 10: Deployment Preparation

### 10.1 Security Audit

- [ ] No API tokens in code
- [ ] `.env.local` in `.gitignore`
- [ ] No console.logs with sensitive data
- [ ] Input validation on all forms
- [ ] JQL sanitization in place

### 10.2 Production Build Test

```bash
pnpm build
pnpm start
```

- [ ] Build completes without warnings
- [ ] App runs in production mode
- [ ] All features work
- [ ] Performance is acceptable

### 10.3 Environment Variables for Production

Prepare production environment variables:
- [ ] JIRA_DOMAIN (production Jira instance)
- [ ] JIRA_EMAIL (service account email)
- [ ] JIRA_API_TOKEN (production token)
- [ ] NODE_ENV=production

## Completion Checklist

- [ ] All dependencies installed
- [ ] Environment variables configured
- [ ] Connection to Jira successful
- [ ] Dashboard displays issues
- [ ] Search and filters work
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Production build succeeds
- [ ] Documentation read
- [ ] Ready for deployment

## Next Steps

After completing this checklist:

1. **Customize the UI** - Modify components to match your brand
2. **Add Features** - Implement board view, sprint management, etc.
3. **Deploy** - Push to Vercel, Netlify, or your preferred host
4. **Monitor** - Set up error tracking and analytics
5. **Iterate** - Gather user feedback and improve

## Resources

- [Jira REST API Documentation](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## Support

If you encounter issues not covered in this checklist:

1. Check the main README.md
2. Review GitHub issues
3. Check Jira API status page
4. Contact support

---

**Congratulations!** If you've completed all steps, your Jira integration is ready to use!
