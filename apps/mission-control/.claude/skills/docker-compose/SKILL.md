---
name: docker-compose
description: Generate docker-compose.yml — app, database, redis, worker services
argument-hint: <services description> or "for current project"
---

Generate docker-compose.yml for: $ARGUMENTS

1. If "for current project" — read package.json, .env.example, existing Dockerfile
2. Generate complete docker-compose.yml:

```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment: [from .env]
    depends_on: [db, redis]

  db:
    image: postgres:16
    volumes: [persistent data]
    environment: [credentials]

  redis:
    image: redis:7-alpine
    # if caching/sessions needed
```

Include:
- Named volumes for data persistence
- Health checks for each service
- Network configuration
- Environment variables from .env.example
- Development overrides (hot reload, debug ports)

Also generate:
- `.dockerignore` file
- `Dockerfile` if not exists (multi-stage build)
