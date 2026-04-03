---
name: agent-config
description: Update an agent's configuration via Agent Hub API
disable-model-invocation: true
argument-hint: [agent-name] [field] [value]
---

Update a specific field on an agent's configuration.

Steps:
1. Parse $ARGUMENTS to extract: agent name, field name, new value
   - Example: `agent-config pm maxTokens 30000`
   - Example: `agent-config backend model gpt-5.1`
2. GET http://localhost:3077/api/agent-hub/agents to list all agents
3. Find the agent by name (case-insensitive partial match)
   - If no match found, show available agent names and ask user to clarify
   - If multiple matches, list them and ask user to pick one
4. Show the agent's current config for the specified field
5. Ask the user to confirm the change: `{agent.name}.{field}: {oldValue} -> {newValue}`
6. On confirmation, PATCH http://localhost:3077/api/agent-hub/agents/{id} with body: `{ "{field}": {value} }`
7. Show the updated agent configuration
8. If no field/value provided, just show the agent's full current config
