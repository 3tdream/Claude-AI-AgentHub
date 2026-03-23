---
name: kb-update
description: Add a pattern to Knowledge Base — failure-patterns, success-patterns, architecture-patterns, security-playbook
disable-model-invocation: true
argument-hint: <type> <description> — e.g. failure "Architect wrote SQL instead of ERD"
---

Add a new pattern to the Knowledge Base.

Parse arguments: first word = pattern type, rest = description.
Types: failure, success, architecture, security

File locations:
- failure → `agents/agents team/knowledge-base/failure-patterns.json`
- success → `projects/mission-control/knowledge-base/success-patterns.json`
- architecture → `agents/agents team/knowledge-base/architecture-patterns.json`
- security → `agents/agents team/knowledge-base/security-playbook.json`

Steps:
1. Read the target JSON file
2. Parse the existing patterns array
3. Create a new entry with:
   - `id`: next sequential number
   - `pattern`: the description from arguments
   - `root_cause`: ask user or infer from context
   - `fix`: ask user or infer from context
   - `date_added`: today's date
   - `severity`: "high" | "medium" | "low"
4. Add to the array and write back
5. Confirm what was added

DO NOT add duplicate patterns — check existing entries first.
