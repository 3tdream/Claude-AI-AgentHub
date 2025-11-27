# Secretutka - Personal Assistant CLI Bot

Personal assistant CLI bot for work session tracking with natural language and voice integration.

## Features

### ✅ Implemented (Phases 0-4)
- 📝 **Work session tracking** - Date, time, client, hourly rate, project, notes
- 💾 **JSON-based storage** - Local file storage with full CRUD operations
- 🔧 **Traditional CLI commands** - Add, list, delete, summary with rich formatting
- 🎯 **Action-based architecture** - Flexible targeting system (by ID, date, client, etc.)
- 🤖 **Natural language interface** - Powered by Claude AI (Anthropic)
- 🔄 **Text-to-action conversion** - Understands complex natural language requests
- 💰 **Payment status tracking** - Pending, paid, overdue, cancelled
- 📊 **Basic reports** - Monthly summaries with client/project breakdown

### 🚧 Planned (Phases 5-7)
- 🎤 **Voice command interface** - Speech-to-text integration
- 📈 **Advanced analytics** - Charts, visualizations, invoice generation
- 💱 **Multi-currency support** - Currency conversion
- 📤 **Export functionality** - PDF and CSV export

## Architecture

```
CLI Layer (src/cli/)
    ↓
NLP Layer (src/nlp/) ←→ Claude AI API
    ↓
Core Layer (src/core/) - Action Executor
    ↓
Storage Layer (src/storage/) - JSON File
```

### Project Structure
```
secretutka/
├── src/
│   ├── core/          # Action types & executor
│   ├── storage/       # JSON storage with validation
│   ├── nlp/           # Claude AI integration
│   ├── voice/         # (Future) Speech-to-text
│   └── cli/           # Commander.js interface
├── tests/             # 74 passing tests
└── data/              # worklog.json storage
```

## Development Phases

- ✅ Phase 0: Project setup
- ✅ Phase 1: JSON storage layer
- ✅ Phase 2: Basic CLI commands
- ✅ Phase 3: Agent actions & execution
- ✅ Phase 4: LLM integration
- ⏳ Phase 5: Natural language editing with confirmation flows
- ⏳ Phase 6: Voice pipeline
- ⏳ Phase 7: Reports & analytics

## Installation

```bash
cd apps/secretutka
pnpm install
```

## Configuration

### API Key Setup (Required for `agent` command)

Get your API key from: https://console.anthropic.com/

**Option 1 - Environment Variable:**
```bash
# macOS/Linux
export ANTHROPIC_API_KEY="your-api-key-here"

# Windows PowerShell
$env:ANTHROPIC_API_KEY="your-api-key-here"
```

**Option 2 - .env File:**
```env
# Create .env in apps/secretutka/
ANTHROPIC_API_KEY=your-api-key-here
```

## Usage

### Traditional CLI Commands

#### Add Work Session
```bash
secretutka add 2025-01-18 09:00 17:00 "Acme Corp" 75 "Website Redesign" \
  --currency USD \
  --notes "Initial design mockups" \
  --status pending
```

#### List Sessions
```bash
# All sessions for a month
secretutka list month 2025-01

# Filter by client
secretutka list month 2025-01 --client "Acme"

# Filter by payment status
secretutka list month 2025-01 --status paid
```

#### Show Summary
```bash
# Summary by client (default)
secretutka summary month 2025-01

# Summary by project
secretutka summary month 2025-01 --group-by project
```

#### Delete Session
```bash
# With confirmation
secretutka delete <entry-id>

# Skip confirmation
secretutka delete <entry-id> --yes
```

### Natural Language Interface 🚀

Use the `agent` command with natural language:

```bash
# Create entries
secretutka agent "Add today's work from 9am to 5pm for Acme Corp at $75/hour"
secretutka agent "Log 4 hours yesterday for Tech Inc at €100/hour on API development"

# Update entries
secretutka agent "Update my last entry for Acme and set the rate to $100"
secretutka agent "Mark all January entries for Tech Inc as paid"

# Query and reports
secretutka agent "Show me summary for January"
secretutka agent "List all entries for Acme Corp"
secretutka agent "How much did I earn from Tech Inc last month?"

# Complex multi-action requests
secretutka agent "Add morning session 9-12 for Client A at $75 and afternoon 1-5 for Client B at €100"
```

The agent will:
1. 🤖 Parse your natural language using Claude AI
2. 🔄 Convert to structured actions
3. ⚡ Execute the actions
4. ✅ Display formatted results

## Development

### Run Tests
```bash
# All tests
pnpm test

# Watch mode
pnpm test --watch

# Specific test file
pnpm test tests/storage.test.ts
```

**Test Coverage:** 74 tests passing
- Storage: 34 tests
- CLI: 14 tests
- Executor: 18 tests
- NLP: 8 tests

### Type Checking
```bash
pnpm typecheck
```

### Build
```bash
pnpm build
```

### Dev Mode
```bash
pnpm dev
```

## Action Types & Targeting

### Available Actions
- `create_entry` - Add new work session
- `update_entry` - Update existing entries
- `delete_entry` - Delete entries
- `mark_paid` / `mark_pending` / `mark_overdue` - Change payment status
- `show_summary` - Generate reports with grouping
- `list_entries` - List work sessions
- `get_entry` - Get a specific entry

### Flexible Targeting System
Actions support multiple targeting strategies:

```typescript
// Direct ID
{ id: "abc123" }

// Date-based
{ date: "2025-01-18" }
{ dateFrom: "2025-01-01", dateTo: "2025-01-31" }
{ month: "2025-01" }  // Auto-converts to date range

// Client/Project
{ clientName: "Acme" }  // Partial match
{ project: "Website" }

// Payment status
{ paymentStatus: "pending" }

// Special selectors
{ last: true }  // Most recent entry
{ lastForClient: "Acme Corp" }  // Most recent for specific client
```

## Data Storage

Work sessions are stored in `data/worklog.json`:

```json
{
  "entries": [
    {
      "id": "abc123",
      "date": "2025-01-18",
      "startTime": "09:00",
      "endTime": "17:00",
      "durationHours": 8,
      "clientName": "Acme Corp",
      "hourlyRate": 75,
      "currency": "USD",
      "project": "Website Redesign",
      "notes": "Initial design mockups",
      "paymentStatus": "pending",
      "createdAt": "2025-01-18T10:00:00.000Z",
      "updatedAt": "2025-01-18T10:00:00.000Z"
    }
  ]
}
```

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.7
- **CLI Framework**: Commander.js
- **LLM**: Anthropic Claude 3.5 Sonnet
- **Testing**: Vitest
- **UI**: Chalk (colors), Ora (spinners), Inquirer (prompts)
- **Storage**: JSON file-based

## License

MIT - Part of ai-projects monorepo
