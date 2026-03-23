---
name: api-design
description: Quick single-feature API endpoint design — method, path, request/response shapes (use /architect for full system)
argument-hint: <feature to design API for>
---

API design for: $ARGUMENTS

Read existing routes in `app/api/` first to follow conventions.

For EACH endpoint:
```
[METHOD] /api/path
Request: { field: type }
Response 200: { field: type }
Response errors: 400 (reason), 404 (reason)
Auth: required (JWT) | public
Rate limit: N/min
```

Rules:
- RESTful conventions (GET=read, POST=create, PATCH=update, DELETE=remove)
- Consistent naming with existing project APIs
- Include pagination for list endpoints
- Include filtering/sorting where applicable
- No endpoint without error responses
