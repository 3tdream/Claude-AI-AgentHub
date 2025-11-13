# AI Agents Library

This directory contains reusable AI agents and agent templates for various tasks across projects.

## Directory Structure

```
agents/
├── templates/          # Base agent templates
├── specialized/        # Task-specific agents
├── configs/           # Agent configurations
└── examples/          # Usage examples
```

## Agent Categories

### 🤖 General Purpose Agents
- Research agents
- Code generation agents
- Data analysis agents

### 📊 Specialized Agents
- Presentation generation agents
- Design system agents
- Testing and QA agents

### 🔧 Agent Templates
- Base agent architecture
- Prompt engineering templates
- Configuration templates

## Creating a New Agent

1. Choose a base template from `/templates`
2. Customize for your specific use case
3. Add configuration in `/configs`
4. Document usage in `/examples`

## Usage Example

```javascript
import { ResearchAgent } from '../_shared/agents/specialized/research-agent';

const agent = new ResearchAgent({
  model: 'gpt-4',
  temperature: 0.7
});

const results = await agent.research('topic');
```

## Best Practices

- Use clear, descriptive agent names
- Document inputs, outputs, and behaviors
- Include error handling
- Test thoroughly before sharing
- Version agents for breaking changes

## Contributing

When adding a new agent:
1. Create agent file in appropriate subdirectory
2. Add configuration example
3. Update this README
4. Add usage example

---

**Last Updated**: 2025-11-12
