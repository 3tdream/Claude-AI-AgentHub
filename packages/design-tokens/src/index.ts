/**
 * @workspace/design-tokens
 * Design system tokens for AI Projects monorepo
 */

export { colors, type ColorTokens } from './colors';
export { spacing, borderRadius, breakpoints, type SpacingTokens } from './spacing';
export { typography, type TypographyTokens } from './typography';

// Re-export all tokens as a single object
import { colors } from './colors';
import { spacing, borderRadius, breakpoints } from './spacing';
import { typography } from './typography';

export const tokens = {
  colors,
  spacing,
  borderRadius,
  breakpoints,
  typography,
} as const;

export type DesignTokens = typeof tokens;
