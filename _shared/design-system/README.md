# Design System

A comprehensive design system for consistent UI/UX across all AI projects.

## Overview

This design system provides:
- Design tokens (colors, typography, spacing)
- Reusable UI components
- Design guidelines and best practices
- Accessibility standards

## Directory Structure

```
design-system/
├── tokens/              # Design tokens
│   ├── colors.json
│   ├── typography.json
│   ├── spacing.json
│   └── design-tokens.css
├── components/          # UI components
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   └── ...
└── guidelines/          # Documentation
    ├── accessibility.md
    ├── component-usage.md
    └── design-principles.md
```

## Design Tokens

### Colors
- Primary brand colors
- Secondary colors
- Semantic colors (success, error, warning, info)
- Neutral colors
- Light/dark theme variants

### Typography
- Font families
- Font sizes
- Font weights
- Line heights
- Letter spacing

### Spacing
- Margin and padding scales
- Grid system
- Layout spacing

## Using Design Tokens

### In CSS/SCSS:
```css
@import '../_shared/design-system/tokens/design-tokens.css';

.button {
  background: var(--color-primary);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
}
```

### In JavaScript/React:
```javascript
import tokens from '../_shared/design-system/tokens/design-tokens.json';

const styles = {
  color: tokens.colors.primary,
  padding: tokens.spacing.md
};
```

## Components

All components follow:
- Atomic design principles
- Accessibility (WCAG 2.1 AA)
- Responsive design
- Theme support (light/dark)

### Component Usage:
```jsx
import { Button, Card } from '../_shared/design-system/components';

<Button variant="primary" size="lg">
  Click me
</Button>
```

## Design Principles

1. **Consistency**: Use design tokens consistently
2. **Accessibility**: WCAG 2.1 AA minimum
3. **Responsiveness**: Mobile-first approach
4. **Performance**: Optimized components
5. **Modularity**: Composable, reusable components

## Adding New Components

1. Create component folder in `/components`
2. Include component file, styles, and tests
3. Document props and usage
4. Add to component index
5. Update this README

## Theme Customization

Customize themes by modifying token files:
- `tokens/colors.json` for color schemes
- `tokens/typography.json` for fonts
- `tokens/spacing.json` for spacing scales

---

**Last Updated**: 2025-11-12
