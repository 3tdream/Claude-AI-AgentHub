# ADR-016: Pipeline Summary API Design

**Status:** Accepted  
**Date:** 2025-01-15

## Context

Страница `/analytics` нуждается в KPI-плашках (`totalRuns`, `successRate`, `topAgent`, `lastRunDate`).  
Данные хранятся в `data/pipeline-analytics.json` — агрегированный файл, обновляемый pipeline runner.  
Нужен GET-эндпоинт, читающий файл и вычисляющий 4 метрики.

## Decision

Next.js Route Handler `GET /api/pipeline/summary`:
- Читает `data/pipeline-analytics.json` через `fs.readFile`
- Вычисляет метрики серверно
- Возвращает `{ data: { totalRuns, successRate, topAgent, lastRunDate } }`
- Без кэширования, без БД

## Auth

Эндпоинт требует аутентификации через `getServerSession()`. Возвращает 401 для неаутентифицированных запросов.

## Rationale

- Файл маленький (<5KB), чтение за <1ms — кэш не нужен
- Вычисления тривиальны (деление, сортировка) — нет смысла в pre-computation
- Паттерн совпадает с существующими route handlers в `app/api/pipeline/`
- Graceful degradation: ENOENT → нулевые значения, JSON parse error → 500 с диагностикой

## Business Logic

### successRate
```
completed = data.byStatus.completed ?? 0
failed = data.byStatus.failed ?? 0
denominator = completed + failed
if denominator === 0 → successRate = 0
else → Math.round((completed / denominator) * 10000) / 100
```

### topAgent
```
entries = Object.entries(data.agentStats ?? {})
if entries.length === 0 → null
sort by: avgScore DESC → runs DESC → name ASC
return entries[0].name
```

**Note on tiebreak:** `consolidation`, `designer`, `cyber-audit` all have `avgScore: 10`.  
Tiebreak by `runs`: `cyber-audit=3`, `consolidation=2`, `designer=2` → `topAgent = "cyber-audit"`.

### lastRunDate
```
data.lastUpdated ?? (await fs.stat(filePath)).mtime.toISOString() ?? null
```

**Note:** `data/pipeline-analytics.json` **does contain** `lastUpdated` at line 103.  
`fs.stat` fallback is used only if the field is absent (e.g., older file versions).

## Error Handling

| Condition | Response |
|-----------|----------|
| ENOENT (file missing) | 200 with zero values |
| SyntaxError (invalid JSON) | 500 `{ error, detail: "Invalid JSON in analytics data file" }` |
| Other fs errors (EACCES) | 500 generic |

## Impact

- New file: `app/api/pipeline/summary/route.ts`
- Frontend calls via `fetch('/api/pipeline/summary')`
- No DB changes, no schema migrations
