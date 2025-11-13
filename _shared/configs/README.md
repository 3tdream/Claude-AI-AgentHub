# Shared Configurations

Common configuration files for linting, formatting, and build tools.

## Available Configurations

### ESLint (`eslint.config.js`)
Shared ESLint configuration for code quality and consistency.

**Usage:**
```javascript
// eslint.config.js in your project
import sharedConfig from '../_shared/configs/eslint.config.js';

export default {
  ...sharedConfig,
  // Add project-specific overrides
};
```

### Prettier (`prettier.config.js`)
Code formatting configuration.

**Usage:**
```javascript
// prettier.config.js in your project
import prettierConfig from '../_shared/configs/prettier.config.js';

export default prettierConfig;
```

### TypeScript (`tsconfig.base.json`)
Base TypeScript configuration.

**Usage:**
```json
// tsconfig.json in your project
{
  "extends": "../_shared/configs/tsconfig.base.json",
  "compilerOptions": {
    // Project-specific overrides
  }
}
```

### Tailwind CSS (`tailwind.config.js`)
Shared Tailwind configuration with design tokens.

**Usage:**
```javascript
// tailwind.config.js in your project
import sharedConfig from '../_shared/configs/tailwind.config.js';

export default {
  ...sharedConfig,
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
};
```

## Best Practices

1. **Extend, Don't Copy**: Always extend these configs rather than copying
2. **Minimal Overrides**: Only override what's absolutely necessary
3. **Document Changes**: If you override, document why
4. **Stay Updated**: Pull updates to shared configs regularly
5. **Consistency**: Use the same configs across all projects

---

**Last Updated**: 2025-11-12
