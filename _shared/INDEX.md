# Shared Resources Index

> Central hub for all reusable code, configurations, and assets across AI projects

**Location**: `C:\Users\Ro050\Desktop\ai-projects\_shared`
**Created**: 2025-11-12

---

## 📂 Quick Navigation

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| [**agents/**](./agents/README.md) | AI agents & templates | Templates, specialized agents, configs |
| [**design-system/**](./design-system/README.md) | Design tokens & components | colors.json, typography.json, spacing.json |
| [**libs/**](./libs/LIBRARY_INVENTORY.md) | Shared libraries | package.json, LIBRARY_INVENTORY.md |
| [**templates/**](./templates/README.md) | Project starters | Next.js, React templates |
| [**utils/**](./utils/README.md) | Utility functions | index.js, helpers |
| [**configs/**](./configs/README.md) | Shared configs | ESLint, Prettier, TypeScript |
| [**assets/**](#) | Static files | Images, fonts, icons |
| [**docs/**](./docs/GETTING_STARTED.md) | Documentation | Getting started guide |

---

## 🚀 Quick Start

### Import Utilities
```javascript
import { formatDate, validateEmail } from '../_shared/utils';
```

### Use Design Tokens
```javascript
import tokens from '../_shared/design-system/tokens/colors.json';
```

### Extend Configurations
```json
{
  "extends": "../_shared/configs/tsconfig.base.json"
}
```

### Start from Template
```bash
cp -r _shared/templates/nextjs-template my-project
```

---

## 📊 Statistics

- **Total Directories**: 26
- **Documentation Files**: 10+
- **Design Tokens**: 3 (colors, typography, spacing)
- **Config Files**: 4 (ESLint, Prettier, TypeScript, Tailwind)
- **Shared Libraries**: 60+ packages

---

## 🎯 What's Inside

### 🤖 AI Agents (`/agents`)
- Agent templates and base architectures
- Specialized agents (research, code generation, etc.)
- Configuration files for agent customization
- Usage examples and documentation

### 🎨 Design System (`/design-system`)
- **Tokens**: Colors, typography, spacing, border radius
- **Components**: Reusable UI components (coming soon)
- **Guidelines**: Design principles and best practices

### 📚 Libraries (`/libs`)
- 60+ npm packages for frontend, backend, AI/ML
- React, Next.js, TypeScript, Three.js
- State management, testing, utilities
- See [LIBRARY_INVENTORY.md](./libs/LIBRARY_INVENTORY.md)

### 🏗️ Templates (`/templates`)
- Next.js + TypeScript + Tailwind
- React + Vite
- Express API
- Full-stack applications

### 🛠️ Utilities (`/utils`)
- Date/time helpers
- String manipulation
- Validation functions
- API helpers
- Common utilities (debounce, throttle, etc.)

### ⚙️ Configurations (`/configs`)
- **ESLint**: Code quality rules
- **Prettier**: Code formatting
- **TypeScript**: Base TS configuration
- **Tailwind**: CSS framework config

### 🖼️ Assets (`/assets`)
- **Images**: Shared images and graphics
- **Fonts**: Web fonts and typography files
- **Icons**: Icon libraries and SVG collections

### 📖 Documentation (`/docs`)
- Getting started guide
- Best practices
- Usage examples
- Architecture documentation

---

## 📋 Common Tasks

### Adding New Utilities
1. Create file in appropriate `/utils` subdirectory
2. Export from `/utils/index.js`
3. Add documentation
4. Update `/utils/README.md`

### Adding New Components
1. Create in `/design-system/components`
2. Include TypeScript types and styles
3. Document props and usage
4. Export from component index

### Creating New Templates
1. Create directory in `/templates`
2. Set up project structure
3. Add README with instructions
4. Test initialization process

### Updating Configurations
1. Modify config file in `/configs`
2. Test across projects
3. Document changes
4. Update version if needed

---

## 🔗 External Resources

- [Design Tokens Specification](https://design-tokens.github.io/community-group/)
- [Component Design Patterns](https://www.patterns.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [AI Agent Patterns](https://www.anthropic.com/research)

---

## 📝 Maintenance

### Regular Updates
- Review and update dependencies monthly
- Remove unused resources quarterly
- Update documentation as needed
- Sync design tokens with design team

### Version Control
- All changes tracked in git
- Use semantic versioning for breaking changes
- Document major updates in CHANGELOG

### Quality Checks
- Lint all shared code
- Test utilities across projects
- Validate design tokens
- Review security updates

---

## 🤝 Contributing

1. **Check existing resources** before creating new ones
2. **Follow naming conventions** for consistency
3. **Document thoroughly** with examples
4. **Test across projects** before committing
5. **Update indexes** when adding resources

---

## 📞 Need Help?

- Read the [Getting Started Guide](./docs/GETTING_STARTED.md)
- Check category-specific README files
- Review example code in templates
- Look at existing projects for reference

---

**Last Updated**: 2025-11-12
**Status**: ✅ Active and maintained
