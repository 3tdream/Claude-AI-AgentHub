# Shared Resources Directory

This directory contains all shared resources, libraries, agents, and assets used across AI projects.

## Directory Structure

### 📦 `/agents`
Reusable AI agents and agent templates for various tasks.
- Agent architectures
- Prompt templates
- Agent configurations
- Custom agent implementations

**Usage**: Import and configure agents for your projects.

---

### 🎨 `/design-system`
Complete design system with tokens, components, and guidelines.

#### `/design-system/tokens`
Design tokens (colors, typography, spacing, etc.) in multiple formats.
- JSON, CSS variables, SCSS variables
- Light/dark theme definitions
- Brand colors and semantic colors

#### `/design-system/components`
Reusable UI components ready to be integrated.
- React components
- Web components
- Component documentation

#### `/design-system/guidelines`
Design documentation and usage guidelines.
- Component usage guides
- Design principles
- Accessibility guidelines

---

### 📚 `/libs`
Technology libraries and package configurations.
- Centralized node_modules
- Shared package.json
- Library inventory and documentation

---

### 🏗️ `/templates`
Project templates and boilerplates.
- Next.js starter templates
- React app templates
- Backend API templates
- Full-stack templates

---

### 🛠️ `/utils`
Shared utility functions and helper modules.
- Common utilities
- API helpers
- Data transformers
- Validation functions

---

### ⚙️ `/configs`
Shared configuration files.
- ESLint configurations
- Prettier configurations
- TypeScript configurations
- Tailwind configurations
- Vite/Webpack configurations

---

### 🖼️ `/assets`
Shared static assets.

#### `/assets/images`
Common images, logos, and graphics.

#### `/assets/fonts`
Shared font files.

#### `/assets/icons`
Icon libraries and SVG collections.

---

### 📖 `/docs`
Shared documentation and guides.
- Best practices
- Setup guides
- Architecture documentation
- API documentation

---

## How to Use

### Importing from Shared Resources

#### In Your Projects:
```javascript
// Import shared utilities
import { formatDate, validateEmail } from '../_shared/utils';

// Import design tokens
import tokens from '../_shared/design-system/tokens/design-tokens.json';

// Import shared components
import { Button, Card } from '../_shared/design-system/components';
```

#### Using Shared Configs:
```json
// In your .eslintrc.json
{
  "extends": "../_shared/configs/.eslintrc.json"
}
```

### Adding New Shared Resources

1. Place the resource in the appropriate directory
2. Update this README with details
3. Document usage examples
4. Update relevant project references

---

## Best Practices

1. **Keep it DRY**: Don't duplicate code - if it's used in 2+ projects, put it here
2. **Document Everything**: Add clear documentation for all shared resources
3. **Version Control**: Track changes to shared resources carefully
4. **Test Thoroughly**: Ensure shared code works across all projects
5. **Semantic Versioning**: Consider versioning for breaking changes

---

## Maintenance

**Last Updated**: 2025-11-12
**Maintainer**: AI Projects Team
**Location**: `C:\Users\Ro050\Desktop\ai-projects\_shared`

---

## Quick Links

- [Library Inventory](./libs/LIBRARY_INVENTORY.md)
- [Design System Documentation](./design-system/README.md)
- [Agent Templates](./agents/README.md)
- [Utility Functions](./utils/README.md)
