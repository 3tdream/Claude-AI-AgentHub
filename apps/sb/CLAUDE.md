# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a **monorepo** containing two main projects:

```
/sb
├── sb-api-services-v2/    # Backend API service (Node.js/TypeScript/Express)
└── sb-chat-ui/            # Frontend web application (React/Vite/TypeScript)
```

Both projects have their own detailed CLAUDE.md files with project-specific guidance. **Always consult the project-specific CLAUDE.md when working within that project.**

## Working with the Monorepo

### Navigation
- **API Backend**: `/Users/avi/dev/avio/sb/sb-api-services-v2/CLAUDE.md`
- **Chat UI Frontend**: `/Users/avi/dev/avio/sb/sb-chat-ui/CLAUDE.md`

### Common Commands

**Backend (sb-api-services-v2):**
```bash
cd sb-api-services-v2
npm run dev              # Start development server with nodemon
npm run build            # TypeScript compilation
npm test                 # Run Jest tests
npm run lint             # ESLint
```

**Frontend (sb-chat-ui):**
```bash
cd sb-chat-ui
npm run dev              # Start Vite dev server (localhost:3000)
npm run build            # TypeScript + Vite production build
npm run preview          # Preview production build
npm run lint             # ESLint
```

## Architecture Overview

### Backend (sb-api-services-v2)
- **Framework**: Express.js with TypeScript (CommonJS)
- **Database**: MongoDB with Mongoose
- **AI Integration**: OpenAI, Anthropic, Google (via Vercel AI SDK v5)
- **Real-time**: WebSocket (Socket.io) + Pusher
- **Authentication**: JWT tokens + API keys
- **Key Features**:
  - AI Assistant management with RAG and function calling
  - Multi-provider AI integration (OpenAI, Anthropic, Google, AWS Bedrock)
  - Integrations framework (JIRA, Linear, Notion, etc.)
  - Cost tracking system for AI usage
  - Prompt version control with AI-generated change descriptions
  - MCP (Model Context Protocol) server implementation
  - File management with scope-based storage (temporary, session, agent, team, company)

### Frontend (sb-chat-ui)
- **Framework**: React 18 + Vite
- **State Management**: Hybrid architecture
  - **Zustand** (new): Session, chat, audio, screen share stores
  - **MobX State Tree** (legacy): Business entities (assistants, companies, users, teams)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Icons**: Lucide React
- **Real-time**: Pusher for live chat updates
- **i18n**: React-i18next (English/Hebrew with RTL support)
- **Key Features**:
  - AI chat interface with streaming responses
  - Teams management for organizing assistants
  - Screen sharing workspace with automatic screenshots
  - AI cost tracking dashboard
  - Drag & drop file uploads

## Development Workflow

### Full Stack Development
When working on features that span both frontend and backend:

1. **Start Backend**: `cd sb-api-services-v2 && npm run dev` (runs on port 5000)
2. **Start Frontend**: `cd sb-chat-ui && npm run dev` (runs on port 3000, proxies `/api` to backend)
3. Frontend Vite dev server automatically proxies API requests to `http://localhost:5000`

### Backend-Only Development
Use testing utilities in `sb-api-services-v2/tests/integration/ai-agent/testing-utils/`:
- `list-assistants.js` - List all assistants
- `get-assistant-details.js <id>` - Read assistant configuration
- `execute.js <id> "message"` - Test stateless execution
- `update-assistant-prompt.js <id>` - Update prompts (supports file input)

### API Documentation
- Backend routes are defined in `sb-api-services-v2/src/routes/`
- Frontend proxies `/api` requests during development
- Production API runs at `api.singularitybridge.net`

## Key Integration Points

### Authentication Flow
1. User authenticates via Google OAuth (frontend)
2. Backend issues JWT token stored in localStorage
3. All API requests include `Authorization: Bearer <token>` header
4. Middleware validates token and company access

### Session Management
- Sessions link users to assistants for chat conversations
- `useSessionStore` (Zustand) manages active session state
- Backend tracks session history and messages
- Real-time updates via Pusher

### AI Assistant Execution
Two execution modes:
1. **Session-based**: `/api/assistant/user-input` (stateful, maintains context)
2. **Stateless**: `/api/assistant/:id/execute` (one-off requests, no session)

### Cost Tracking
- Automatically logs AI usage costs to MongoDB
- Tracks: tokens, cost, duration, model, provider
- Frontend dashboard at `/admin/costs` with filtering and charts

## Deployment

### Backend Infrastructure
- **Provider**: Hetzner Cloud (Germany)
- **Server**: CX32 (4 vCPU Intel, 8GB RAM, 80GB NVMe)
- **Deployment**: Coolify (self-hosted PaaS)
- **Domain**: api.singularitybridge.net (HTTPS)
- **Auto-deploy**: GitHub push triggers build
- **Build**: Multi-stage Dockerfile (Node 21-slim)

### Frontend
- Vite production build (`npm run build`)
- Static assets served via CDN or web server

## Important Notes

### Git Workflow
- **Never commit without user approval**
- Keep commit messages short and human-like (no AI tool mentions)
- Don't run `npm run dev` automatically - user runs manually

### Code Style
- **Frontend**: Use Tailwind CSS + shadcn/ui, avoid gradients
- **Icons**: Lucide icons only
- **Fonts**: Google Fonts only
- **Both projects**: Remove unused imports, use `_paramName` for intentionally unused parameters

### State Management (Frontend)
- **New features**: Use Zustand stores
- **Existing entities**: MobX State Tree (don't migrate unless required)
- Follow patterns in `useSessionStore.ts` and `chatStore.ts`

### Testing
- Backend has Jest tests in `tests/` directory
- Use integration testing utilities for AI assistant testing
- Frontend currently has no test scripts (tests happen during build)

## Windows Development (IMPORTANT)

When running the sb project on Windows, **always check and fix these issues**:

### Windows ESM Dynamic Import Fix
On Windows, ESM dynamic imports fail with raw paths like `C:\...`. The fix is to use `pathToFileURL` from Node's `url` module. Check these files have the fix:
- `sb-api-services-v2/src/services/discovery.service.ts`
- `sb-api-services-v2/src/integrations/actions/loaders.ts`

If you see this error in API logs, the fix is missing:
```
ERR_UNSUPPORTED_ESM_URL_SCHEME: On Windows, absolute paths must be valid file:// URLs
```

### PM2 on Windows
Use direct bin paths instead of npm:
```bash
# Start API
cd sb-api-services-v2 && pm2 start node_modules/nodemon/bin/nodemon.js --name "sb-api" -- --exec tsx src/index.ts

# Start UI
cd sb-chat-ui && pm2 start node_modules/vite/bin/vite.js --name "sb-ui"
```

## Common Gotchas

1. **Frontend flexbox overflow**: Add `min-w-0` to flex containers to allow shrinking
2. **Google OAuth IPv6**: Backend forces IPv6 for Google APIs due to Hetzner IP blocking
3. **Assistant endpoint**: Use singular `/assistant/` not `/assistants/`
4. **File uploads**: Require `title` field in FormData
5. **Screen share workspace**: Needs active session to function
6. **TypeScript memory**: Build uses `NODE_OPTIONS='--max-old-space-size=2048'`
7. **Windows ESM imports**: Use `pathToFileURL()` for dynamic imports on Windows

## Project-Specific Documentation

For detailed architecture, API endpoints, component structure, and domain-specific patterns, **always read the CLAUDE.md file in the specific project directory you're working in**:

- **Backend**: `sb-api-services-v2/CLAUDE.md`
- **Frontend**: `sb-chat-ui/CLAUDE.md`
