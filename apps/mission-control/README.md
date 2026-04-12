# Mission Control

AI Agent Management Platform — orchestrate, monitor, and optimize multi-agent pipelines.

## Quick Start

### Option A: Docker (recommended)

```bash
# 1. Clone and enter the project
cd apps/mission-control

# 2. Configure environment
bash scripts/setup-env.sh

# 3. Run
docker compose up -d

# 4. Open
open http://localhost:3077/setup
```

### Option B: Manual

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
bash scripts/setup-env.sh
# or copy manually:
cp .env.example .env.local

# 3. Start dev server
npm run dev

# 4. Open
open http://localhost:3077/setup
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BASE_URL` | Yes | App URL (default: `http://localhost:3077`) |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for pipeline execution |
| `OPENAI_API_KEY` | No | OpenAI API key (Smart Router) |
| `JIRA_BASE_URL` | No | Jira instance URL |
| `JIRA_EMAIL` | No | Jira account email |
| `JIRA_API_TOKEN` | No | Jira API token |

## Project Structure

```
app/              Next.js 15 App Router pages
  (shell)/        Main layout with sidebar
  api/            API routes
components/       React components
data/             File-based storage (JSON)
lib/              Utilities, stores, types
scripts/          CLI tools and setup
types/            TypeScript type definitions
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server on port 3077 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `bash scripts/setup-env.sh` | Interactive env setup |

## Docker

```bash
docker compose up -d        # Start
docker compose down          # Stop
docker compose logs -f       # Logs
docker compose up -d --build # Rebuild after changes
```

Data persists in the `mc-data` Docker volume. Health check runs every 30s at `/api/health`.

## Tech Stack

- Next.js 15.5 (App Router, standalone output)
- React 19, TypeScript 5
- Tailwind CSS 4
- Radix UI + Lucide icons
- SWR for data fetching
- Zustand for state management
- File-based JSON storage
