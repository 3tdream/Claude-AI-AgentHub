---
name: api-test
description: Generate API test cases — happy path, validation, errors, edge cases
argument-hint: <endpoint> — e.g. "POST /api/loyalty/config"
---

Generate test cases for: $ARGUMENTS

1. Read the route handler to understand the API
2. Generate tests:

### Happy Path
- Valid request → expected response
- All required fields provided
- Proper status code (200/201)

### Validation
- Missing required fields → 400
- Invalid types → 400
- Empty strings → 400
- Boundary values (min/max)

### Authorization
- No auth token → 401
- Invalid token → 401
- Wrong role → 403

### Error Cases
- Resource not found → 404
- Conflict/duplicate → 409
- Server error handling → 500

### Edge Cases
- Unicode in string fields
- Very long strings
- Concurrent requests
- Empty arrays/objects

Output as test file using project conventions (check for existing test patterns).
