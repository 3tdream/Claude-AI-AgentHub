# Jira Integration - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         JIRA INTEGRATION                         │
│                         Next.js 15 App                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────┐  ┌────────────────────┐                │
│  │   Landing Page     │  │  Jira Dashboard    │                │
│  │   (page.tsx)       │  │  (jira/page.tsx)   │                │
│  │                    │  │                    │                │
│  │  - Hero Section    │  │  - Issue List      │                │
│  │  - Feature Cards   │  │  - Search Bar      │                │
│  │  - Connection Form │  │  - Quick Filters   │                │
│  └────────────────────┘  └────────────────────┘                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        COMPONENT LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Jira-Specific Components                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • JiraConnectionForm   - Authentication UI              │  │
│  │  • IssueCard            - Issue display card             │  │
│  │  • (Future: BoardColumn, SprintHeader, etc.)             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           UI Components (shadcn/ui)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Button      • Card        • Input                     │  │
│  │  • Label       • Badge                                   │  │
│  │  (Radix UI primitives + Tailwind CSS)                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          STATE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              React Query (TanStack Query)                 │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • useJiraIssues      - Fetch & cache issues             │  │
│  │  • useJiraIssue       - Fetch single issue               │  │
│  │  • useCreateIssue     - Create mutation                  │  │
│  │  • useUpdateIssue     - Update mutation                  │  │
│  │  • useDeleteIssue     - Delete mutation                  │  │
│  │                                                           │  │
│  │  Features:                                                │  │
│  │  - Automatic caching                                      │  │
│  │  - Background refetching                                  │  │
│  │  - Optimistic updates                                     │  │
│  │  - Query invalidation                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API ROUTES LAYER                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Next.js API Routes                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  POST   /api/jira/connect                                │  │
│  │  GET    /api/jira/issues?jql=...                         │  │
│  │  POST   /api/jira/issues                                 │  │
│  │  GET    /api/jira/issues/[issueKey]                      │  │
│  │  PUT    /api/jira/issues/[issueKey]                      │  │
│  │  DELETE /api/jira/issues/[issueKey]                      │  │
│  │                                                           │  │
│  │  Responsibilities:                                        │  │
│  │  - Request validation                                     │  │
│  │  - Environment variable handling                          │  │
│  │  - Error handling & formatting                            │  │
│  │  - Response transformation                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       BUSINESS LOGIC LAYER                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Jira API Client                         │  │
│  │                   (lib/jira/api.ts)                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  class JiraClient {                                       │  │
│  │    • testConnection()                                     │  │
│  │    • getProjects()                                        │  │
│  │    • searchIssues(jql)                                    │  │
│  │    • getIssue(key)                                        │  │
│  │    • createIssue(payload)                                 │  │
│  │    • updateIssue(key, payload)                            │  │
│  │    • deleteIssue(key)                                     │  │
│  │    • assignIssue(key, accountId)                          │  │
│  │    • getTransitions(key)                                  │  │
│  │    • transitionIssue(key, transitionId)                   │  │
│  │    • addComment(key, comment)                             │  │
│  │    • searchUsers(query)                                   │  │
│  │    • getBoards(), getSprints(), etc.                      │  │
│  │  }                                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Utility Functions                        │  │
│  │                  (lib/jira/utils.ts)                      │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • Color helpers (getIssueTypeColor, etc.)               │  │
│  │  • JQL builder (buildJQL)                                │  │
│  │  • Date formatters (formatJiraDate)                      │  │
│  │  • Grouping functions (groupByStatus, etc.)              │  │
│  │  • Validation (isValidJiraDomain, etc.)                  │  │
│  │  • Text processing (adfToPlainText)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Type Definitions                        │  │
│  │                   (lib/jira/types.ts)                     │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  • JiraConfig                                            │  │
│  │  • JiraUser, JiraProject, JiraIssue                      │  │
│  │  • JiraSprint, JiraBoard                                 │  │
│  │  • CreateIssuePayload, UpdateIssuePayload                │  │
│  │  • 30+ interfaces covering all Jira entities             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HTTP CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      Axios Client                         │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Configuration:                                           │  │
│  │  - Base URL: https://{domain}/rest/api/3                 │  │
│  │  - Auth: Basic (email:apiToken base64)                   │  │
│  │  - Headers: Content-Type, Accept                         │  │
│  │                                                           │  │
│  │  Interceptors:                                            │  │
│  │  - Request: Add authentication                            │  │
│  │  - Response: Transform errors                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                    ┌─────────────────────┐                      │
│                    │   Jira Cloud API    │                      │
│                    │   (Atlassian)       │                      │
│                    │                     │                      │
│                    │  REST API v3        │                      │
│                    │  {domain}.atlassian │                      │
│                    │       .net          │                      │
│                    └─────────────────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Connection Flow

```
User                  Component               API Route            Jira Client          Jira API
  │                      │                       │                    │                   │
  │  Fill Form           │                       │                    │                   │
  ├─────────────────────>│                       │                    │                   │
  │                      │                       │                    │                   │
  │  Click Connect       │                       │                    │                   │
  ├─────────────────────>│                       │                    │                   │
  │                      │                       │                    │                   │
  │                      │  POST /api/jira/connect                    │                   │
  │                      ├──────────────────────>│                    │                   │
  │                      │                       │                    │                   │
  │                      │                       │  new JiraClient()  │                   │
  │                      │                       ├───────────────────>│                   │
  │                      │                       │                    │                   │
  │                      │                       │                    │  GET /myself      │
  │                      │                       │                    ├──────────────────>│
  │                      │                       │                    │                   │
  │                      │                       │                    │  User Data        │
  │                      │                       │                    │<──────────────────┤
  │                      │                       │                    │                   │
  │                      │                       │  Success Response  │                   │
  │                      │                       │<───────────────────┤                   │
  │                      │                       │                    │                   │
  │                      │  { success, user }    │                    │                   │
  │                      │<──────────────────────┤                    │                   │
  │                      │                       │                    │                   │
  │  Success Message     │                       │                    │                   │
  │<─────────────────────┤                       │                    │                   │
  │                      │                       │                    │                   │
  │  Redirect to /jira   │                       │                    │                   │
  │<─────────────────────┤                       │                    │                   │
```

### 2. Issue Fetching Flow

```
Dashboard            React Query           API Route            Jira Client          Jira API
    │                    │                    │                    │                   │
    │  useJiraIssues()   │                    │                    │                   │
    ├───────────────────>│                    │                    │                   │
    │                    │                    │                    │                   │
    │                    │  Check Cache       │                    │                   │
    │                    ├──────>             │                    │                   │
    │                    │                    │                    │                   │
    │                    │  Cache Miss        │                    │                   │
    │                    │<──────┤            │                    │                   │
    │                    │                    │                    │                   │
    │                    │  GET /api/jira/issues?jql=...           │                   │
    │                    ├───────────────────>│                    │                   │
    │                    │                    │                    │                   │
    │                    │                    │  searchIssues()    │                   │
    │                    │                    ├───────────────────>│                   │
    │                    │                    │                    │                   │
    │                    │                    │                    │  POST /search     │
    │                    │                    │                    ├──────────────────>│
    │                    │                    │                    │                   │
    │                    │                    │                    │  Issues Data      │
    │                    │                    │                    │<──────────────────┤
    │                    │                    │                    │                   │
    │                    │                    │  Issues Array      │                   │
    │                    │                    │<───────────────────┤                   │
    │                    │                    │                    │                   │
    │                    │  Response Data     │                    │                   │
    │                    │<───────────────────┤                    │                   │
    │                    │                    │                    │                   │
    │                    │  Update Cache      │                    │                   │
    │                    ├──────>             │                    │                   │
    │                    │                    │                    │                   │
    │  Render Issues     │                    │                    │                   │
    │<───────────────────┤                    │                    │                   │
```

### 3. Issue Creation Flow (Optimistic Update)

```
User              Component          React Query         API Route          Jira Client        Jira API
 │                    │                  │                  │                   │                 │
 │  Click Create      │                  │                  │                   │                 │
 ├───────────────────>│                  │                  │                   │                 │
 │                    │                  │                  │                   │                 │
 │                    │  mutateAsync()   │                  │                   │                 │
 │                    ├─────────────────>│                  │                   │                 │
 │                    │                  │                  │                   │                 │
 │                    │                  │  Optimistic Update                   │                 │
 │                    │                  ├────────>         │                   │                 │
 │                    │                  │                  │                   │                 │
 │  Show New Issue    │                  │  (Temp ID)       │                   │                 │
 │<───────────────────┤                  │                  │                   │                 │
 │                    │                  │                  │                   │                 │
 │                    │                  │  POST /api/jira/issues              │                 │
 │                    │                  ├─────────────────>│                   │                 │
 │                    │                  │                  │                   │                 │
 │                    │                  │                  │  createIssue()    │                 │
 │                    │                  │                  ├──────────────────>│                 │
 │                    │                  │                  │                   │                 │
 │                    │                  │                  │                   │  POST /issue    │
 │                    │                  │                  │                   ├────────────────>│
 │                    │                  │                  │                   │                 │
 │                    │                  │                  │                   │  Created Issue  │
 │                    │                  │                  │                   │<────────────────┤
 │                    │                  │                  │                   │                 │
 │                    │                  │                  │  Issue Object     │                 │
 │                    │                  │                  │<──────────────────┤                 │
 │                    │                  │                  │                   │                 │
 │                    │                  │  Response         │                   │                 │
 │                    │                  │<─────────────────┤                   │                 │
 │                    │                  │                  │                   │                 │
 │                    │                  │  Invalidate Cache                    │                 │
 │                    │                  ├────────>         │                   │                 │
 │                    │                  │                  │                   │                 │
 │                    │                  │  Refetch Issues  │                   │                 │
 │                    │                  ├─────────────────>│                   │                 │
 │                    │                  │                  │                   │                 │
 │  Update with Real  │                  │                  │                   │                 │
 │  Issue Data        │                  │                  │                   │                 │
 │<───────────────────┤                  │                  │                   │                 │
```

## Component Hierarchy

```
App
├── RootLayout
│   ├── Providers (React Query)
│   └── Body
│       ├── HomePage (Landing)
│       │   ├── Header
│       │   ├── Hero Section
│       │   ├── Features Grid
│       │   │   └── Card × 3
│       │   └── JiraConnectionForm
│       │       ├── Input (domain)
│       │       ├── Input (email)
│       │       ├── Input (apiToken)
│       │       └── Button
│       │
│       └── JiraDashboardPage
│           ├── Header (sticky)
│           │   ├── Title
│           │   ├── Button (Refresh)
│           │   └── Button (New Issue)
│           ├── SearchBar
│           │   ├── Input (search)
│           │   └── Button (Filters)
│           ├── QuickFilters
│           │   └── Button × 4
│           └── IssuesGrid
│               └── IssueCard × N
│                   ├── Issue Type Icon
│                   ├── Priority Icon
│                   ├── Summary
│                   ├── Status Badge
│                   └── Metadata (assignee, date)
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        REACT QUERY CACHE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Query Keys:                                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ['jira-issues', jql]        → Search results cache         │ │
│  │ ['jira-issue', issueKey]    → Single issue cache           │ │
│  │ ['jira-projects']           → Projects list cache          │ │
│  │ ['jira-boards']             → Boards list cache            │ │
│  │ ['jira-sprints', boardId]   → Sprints cache                │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Mutation Keys:                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ createIssue   → Invalidates ['jira-issues']                │ │
│  │ updateIssue   → Updates ['jira-issue', key] + invalidates  │ │
│  │ deleteIssue   → Removes ['jira-issue', key] + invalidates  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Cache Configuration:                                            │
│  - staleTime: 30 seconds (queries stay fresh)                   │
│  - cacheTime: 5 minutes (unused data kept in memory)            │
│  - refetchOnWindowFocus: true (stay up-to-date)                 │
│  - retry: 3 attempts with exponential backoff                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## File Dependencies Graph

```
app/page.tsx
  ├── components/jira/jira-connection-form.tsx
  │   ├── components/ui/card.tsx
  │   ├── components/ui/input.tsx
  │   ├── components/ui/label.tsx
  │   ├── components/ui/button.tsx
  │   ├── lib/jira/utils.ts
  │   └── lib/utils.ts
  └── components/ui/button.tsx

app/jira/page.tsx
  ├── hooks/use-jira-issues.ts
  │   └── lib/jira/types.ts
  ├── components/jira/issue-card.tsx
  │   ├── components/ui/card.tsx
  │   ├── components/ui/badge.tsx
  │   ├── lib/jira/types.ts
  │   ├── lib/jira/utils.ts
  │   └── lib/utils.ts
  ├── components/ui/button.tsx
  └── components/ui/input.tsx

app/api/jira/connect/route.ts
  ├── lib/jira/api.ts
  │   └── lib/jira/types.ts
  └── lib/jira/types.ts

app/api/jira/issues/route.ts
  ├── lib/jira/api.ts
  └── lib/jira/types.ts

hooks/use-jira-issues.ts
  └── lib/jira/types.ts

lib/jira/api.ts
  └── lib/jira/types.ts

lib/jira/utils.ts
  └── lib/jira/types.ts
```

## Technology Stack Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT LAYER                             │
│  Vercel / Docker / Cloud Platform                                │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     FRAMEWORK LAYER                              │
│  Next.js 15 (App Router, Server Components, API Routes)         │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     UI LIBRARIES                                 │
│  React 18 + Framer Motion + Radix UI + Lucide Icons             │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     STYLING LAYER                                │
│  Tailwind CSS 3 + CSS Variables (HSL) + Custom Animations       │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     STATE MANAGEMENT                             │
│  React Query (TanStack Query) + React Hooks                     │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     TYPE SYSTEM                                  │
│  TypeScript 5 (Strict Mode)                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     HTTP CLIENT                                  │
│  Axios + Custom Interceptors                                    │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL API                                 │
│  Jira REST API v3 (Atlassian Cloud)                             │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                             │
├─────────────────────────────────────────────────────────────────┤
│  - HTTPS Only                                                    │
│  - No API tokens in localStorage/sessionStorage                 │
│  - XSS protection (React escaping)                               │
│  - Input validation on forms                                     │
└─────────────────────────────────────────────────────────────────┘
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NEXT.JS SERVER                               │
├─────────────────────────────────────────────────────────────────┤
│  Environment Variables (Server-side only):                       │
│  - JIRA_DOMAIN                                                   │
│  - JIRA_EMAIL                                                    │
│  - JIRA_API_TOKEN                                                │
│                                                                  │
│  Security Measures:                                              │
│  - Environment variables never exposed to client                 │
│  - API routes validate requests                                  │
│  - JQL query sanitization                                        │
│  - Error messages don't leak sensitive info                      │
│  - Rate limiting (to implement)                                  │
└─────────────────────────────────────────────────────────────────┘
                              │ Basic Auth (Base64)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     JIRA API (Atlassian)                         │
├─────────────────────────────────────────────────────────────────┤
│  - OAuth 2.0 / API Token authentication                          │
│  - Rate limiting                                                 │
│  - Permission checks                                             │
│  - Audit logging                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Optimization Strategy

```
1. Server-Side Rendering (SSR)
   - Initial page load with data
   - Faster First Contentful Paint

2. Code Splitting
   - Automatic route-based splitting
   - Dynamic imports for heavy components

3. React Query Caching
   - Avoid redundant API calls
   - Background refetching
   - Stale-while-revalidate

4. Image Optimization
   - Next.js Image component
   - Lazy loading
   - Responsive images

5. CSS Optimization
   - Tailwind CSS purging
   - Critical CSS inline
   - Minimal runtime overhead

6. API Optimization
   - Parallel requests where possible
   - Request deduplication
   - Efficient JQL queries
   - Field selection (only fetch needed fields)

7. Bundle Optimization
   - Tree shaking
   - Minification
   - Compression (gzip/brotli)
```

## Error Handling Flow

```
Error Source → Handler → User Feedback

Jira API Error
  └→ Axios Interceptor
      └→ JiraClient error formatting
          └→ API Route error response
              └→ React Query onError
                  └→ Component error state
                      └→ Error message UI

Network Error
  └→ Axios network error
      └→ React Query retry logic
          └→ Toast notification

Validation Error
  └→ Form validation
      └→ Inline error message
          └→ Field highlight

Type Error (Development)
  └→ TypeScript compiler
      └→ IDE warning
          └→ Build failure
```

---

This architecture provides a solid foundation for building a scalable, maintainable Jira integration with clear separation of concerns and well-defined data flows.
