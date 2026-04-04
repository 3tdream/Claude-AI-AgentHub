---
name: agent-router
description: Route a direct task to the best agent by specialization — matches intent to agent capabilities
disable-model-invocation: true
argument-hint: task description to route
---

Route a task to the most suitable agent based on specialization.

Steps:
1. Take the task description from $ARGUMENTS
2. Fetch the current agent roster:
   - GET http://localhost:3077/api/agents — list of all agents with their roles and capabilities
3. Analyze the task against each agent's specialization:
   - Match keywords and intent to agent descriptions and tags
   - Consider agent availability/status (prefer agents with status: active)
   - If multiple agents match, rank by specificity of match
4. Display the routing recommendation:
   - **Best Match**: agent name, role, and why it was chosen
   - **Confidence**: High / Medium / Low based on how well the task aligns
   - **Alternatives**: up to 2 runner-up agents with brief reasoning
5. If the task is ambiguous:
   - List the top 3 candidate agents and ask the user to confirm before routing
6. If no agent clearly matches:
   - Suggest breaking the task into sub-tasks that map to existing specializations
   - Flag if a new agent type may be needed and recommend adding it via agent-config
7. Output a ready-to-use instruction block the user can paste directly into the chosen agent's chat
