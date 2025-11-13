# @workspace/design-tokens

Design system tokens for AI Projects monorepo - colors, spacing, typography, and more.

## Installation

This package is internal to the monorepo. Import it in your apps:

```typescript
import { colors, spacing, typography } from '@workspace/design-tokens';
// or import specific tokens
import { colors } from '@workspace/design-tokens/colors';
```

## Available Tokens

### Colors
- **Primary Scale**: Blue color scale (50-950)
- **Secondary Scale**: Purple color scale (50-950)
- **Neutral Scale**: Gray color scale (50-950)
- **Semantic Colors**: Success, Error, Warning, Info
- **Background Colors**: Light/Dark theme backgrounds
- **Text Colors**: Light/Dark theme text colors

### Spacing
- **Spacing Scale**: 0px to 24rem (Tailwind-compatible)
- **Border Radius**: From `none` to `full`
- **Breakpoints**: Responsive breakpoints (sm, md, lg, xl, 2xl)

### Typography
- **Font Families**: Sans, Serif, Mono, Display
- **Font Sizes**: xs to 9xl
- **Font Weights**: Thin to Black (100-900)
- **Line Heights**: None to Loose
- **Letter Spacing**: Tighter to Widest

## Usage Examples

```typescript
import { colors, spacing, typography, tokens } from '@workspace/design-tokens';

// Use individual tokens
const primaryColor = colors.primary[500]; // "#0ea5e9"
const padding = spacing[4]; // "1rem"
const headingFont = typography.fontFamily.display;

// Use all tokens
const allTokens = tokens;

// Use in Tailwind config
export default {
  theme: {
    extend: {
      colors: colors,
      spacing: spacing,
      fontFamily: typography.fontFamily,
    },
  },
};

// Use in CSS-in-JS
const styles = {
  color: colors.primary[600],
  padding: spacing[4],
  fontSize: typography.fontSize['2xl'],
  fontWeight: typography.fontWeight.semibold,
};
```

## Token Structure

### Color Tokens
```typescript
colors.primary[500]        // Main primary color
colors.semantic.success.main // Success color
colors.background.light    // Light background
colors.text.dark.primary   // Dark theme primary text
```

### Spacing Tokens
```typescript
spacing[4]          // 1rem
borderRadius.lg     // 0.5rem
breakpoints.md      // 768px
```

### Typography Tokens
```typescript
typography.fontFamily.sans    // Inter, ...
typography.fontSize.xl        // 1.25rem
typography.fontWeight.bold    // 700
typography.lineHeight.normal  // 1.5
```

## TypeScript Support

All tokens are fully typed for TypeScript autocomplete and type safety:

```typescript
import type { ColorTokens, SpacingTokens, TypographyTokens } from '@workspace/design-tokens';
```

## License

MIT
