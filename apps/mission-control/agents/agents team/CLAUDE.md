# Beauty CRM - AI-Powered Platform for Beauty Businesses

## Project Overview
AI CRM platform for beauty businesses and medical cosmetology clinics.
Scenario A (basic, 4990 RUB/mo) and Scenario B (medical, 9990 RUB/mo).

## Tech Stack
- Frontend: Next.js 14 on Vercel
- Backend: Node.js on Timeweb Cloud VPS
- DB: Supabase PostgreSQL (non-PII) + Timeweb PostgreSQL (PII, 152-FZ)
- AI: Claude Sonnet + GPT-5.1
- Auth: Telegram, phone, email
- Languages: RU / EN / HE

## Architecture
- Web pages = PRIMARY booking channel
- Telegram = SECONDARY (notifications)
- PII on Timeweb PostgreSQL only (152-FZ)
- Design system: Aura (#7C3AED primary, #06B6D4 secondary, Manrope/Inter)

## Subagents (.claude/agents/)
orchestrator, pm-agent, architect-agent, backend-agent, frontend-agent,
designer-agent, qa-agent, devops-agent, cyber-agent, research-agent

## Pipeline: PM -> Architect -> Frontend -> Designer -> Backend -> QA -> DevOps

## Constraints
- 152-FZ compliance, WCAG AA, mobile-first, 500+ shops scale
- 4 security blockers before production
- TypeScript strict, zod validation, no secrets in code
