---
name: api-scaffold
description: Scaffold one new API endpoint file — route.ts with handler, types, validation (use /backend for full feature)
argument-hint: <METHOD /api/path> — e.g. "POST /api/loyalty/redeem"
---

Scaffold endpoint: $ARGUMENTS

1. Read existing routes in `app/api/` for project conventions
2. Create:

**Route file** (`app/api/.../route.ts`):
- Request validation (zod or manual)
- Business logic placeholder
- Proper error responses (400, 401, 404, 500)
- TypeScript types for request/response

**Type file** (if new types needed):
- Request interface
- Response interface
- Add to `types/`

Follow the project pattern:
- Agent Hub proxy + cached fallback (if calling external API)
- File-based storage in `data/` (if persisting data)
- Proper NextResponse usage

Output ready-to-use code files.
