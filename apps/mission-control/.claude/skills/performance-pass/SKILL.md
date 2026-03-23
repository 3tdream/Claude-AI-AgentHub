---
name: performance-pass
description: Performance optimization scan — bundle size, N+1 queries, lazy loading, memoization, image optimization
disable-model-invocation: true
argument-hint: [page or component] or empty for full project
---

Performance optimization pass for: $ARGUMENTS (or full project)

## Frontend Performance:

### Bundle Size
- Large imports: `import X from 'big-library'` → `import { X } from 'big-library'`
- Dynamic imports missing: heavy components without `next/dynamic` or `React.lazy`
- CSS-in-JS at runtime vs Tailwind (build-time)

### Rendering
- Components re-rendering unnecessarily (missing `React.memo`, `useMemo`, `useCallback`)
- Lists without `key` prop or with index as key
- Layout shifts (images without dimensions, dynamic content without skeleton)

### Data Fetching
- Waterfall fetches (sequential when could be parallel)
- Missing SWR/cache for repeated API calls
- Over-fetching (loading full objects when only need ID+name)
- N+1 patterns in server components

### Images
- Images without `next/image` optimization
- Missing `priority` on above-fold images
- No WebP/AVIF format usage
- Missing `sizes` prop for responsive images

## Backend Performance:

### Database
- Missing indexes for common query patterns
- N+1 query patterns (loop with individual queries)
- No connection pooling

### API
- No response caching headers
- Large payloads without pagination
- Missing compression (gzip/brotli)

## Report:
| # | Issue | File | Impact | Fix | Effort |
Impact: HIGH (visible to user) → MEDIUM → LOW (marginal)

Estimated performance improvement for each fix.
