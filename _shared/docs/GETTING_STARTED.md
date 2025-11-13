# Getting Started with Shared Resources

Welcome to the AI Projects shared resources directory! This guide will help you understand and use the shared resources effectively.

## Overview

The `_shared` directory contains reusable code, configurations, and assets used across all AI projects. This centralized approach ensures:

- **Consistency** across all projects
- **Reduced duplication** of code and assets
- **Easier maintenance** and updates
- **Faster development** with ready-to-use components

## Directory Structure

```
_shared/
├── agents/           # AI agents and templates
├── design-system/    # Design tokens, components, guidelines
├── libs/             # Shared libraries and packages
├── templates/        # Project starter templates
├── utils/            # Common utility functions
├── configs/          # Shared configuration files
├── assets/           # Images, fonts, icons
└── docs/             # Documentation
```

## Quick Start

### 1. Using Shared Utilities

```javascript
// In your project file
import { formatDate, validateEmail, debounce } from '../_shared/utils';

const date = formatDate(new Date(), 'YYYY-MM-DD');
const isValid = validateEmail('user@example.com');
```

### 2. Using Design Tokens

```javascript
// Import design tokens
import tokens from '../_shared/design-system/tokens/colors.json';

const primaryColor = tokens.colors.primary['500'];
```

```css
/* Or use CSS variables */
@import '../_shared/design-system/tokens/design-tokens.css';

.button {
  background: var(--color-primary-500);
}
```

### 3. Using Shared Configurations

```json
// tsconfig.json
{
  "extends": "../_shared/configs/tsconfig.base.json",
  "compilerOptions": {
    // Your overrides
  }
}
```

### 4. Using Project Templates

```bash
# Copy a template to start a new project
cp -r _shared/templates/nextjs-template my-new-project
cd my-new-project
npm install
npm run dev
```

### 5. Using AI Agents

```javascript
import { ResearchAgent } from '../_shared/agents/specialized/research-agent';

const agent = new ResearchAgent({
  model: 'gpt-4',
  temperature: 0.7
});

const results = await agent.research('topic');
```

## Best Practices

### 1. Don't Duplicate Code
If you're using the same code in 2+ projects, move it to `_shared/utils/`.

### 2. Use Relative Imports
Always import from shared resources using relative paths:
```javascript
import { utility } from '../_shared/utils';
```

### 3. Extend, Don't Copy
Extend shared configurations instead of copying them:
```javascript
import sharedConfig from '../_shared/configs/eslint.config.js';
export default { ...sharedConfig };
```

### 4. Document Your Additions
When adding to shared resources:
- Update relevant README files
- Add usage examples
- Document any dependencies

### 5. Keep It Clean
- Remove unused shared code
- Update outdated resources
- Maintain consistent naming conventions

## Common Workflows

### Creating a New Project

1. **Choose a template** from `_shared/templates/`
2. **Copy the template** to your project location
3. **Install dependencies**: `npm install`
4. **Configure environment** variables
5. **Import shared resources** as needed
6. **Start developing**!

### Adding a New Shared Utility

1. Create utility in appropriate category folder
2. Export from `_shared/utils/index.js`
3. Add JSDoc documentation
4. Write tests if applicable
5. Update `_shared/utils/README.md`

### Creating a Shared Component

1. Create component in `_shared/design-system/components/`
2. Include styles and TypeScript types
3. Add usage documentation
4. Export from component index
5. Update design system README

### Using Shared Libraries

All libraries are installed in `_shared/libs/node_modules/`. Reference the `LIBRARY_INVENTORY.md` for available packages.

## Troubleshooting

### Import Path Issues
Make sure your relative paths are correct based on your project location.

### Module Not Found
Ensure dependencies are installed in `_shared/libs/` by running `npm install` there.

### Type Errors
Check that TypeScript configurations extend the base config properly.

## Resources

- [Shared Utilities Documentation](../utils/README.md)
- [Design System Guide](../design-system/README.md)
- [AI Agents Guide](../agents/README.md)
- [Configuration Guide](../configs/README.md)
- [Template Documentation](../templates/README.md)

## Need Help?

- Check the README in each subdirectory
- Review example code in templates
- Look at existing projects for reference
- Update documentation as you learn!

---

**Last Updated**: 2025-11-12
