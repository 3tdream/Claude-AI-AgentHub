/**
 * Design Token System
 * Centralized design values for consistency across the application
 * Based on modern presentation design best practices (2024-2025)
 */

export const tokens = {
  // ==========================================
  // SPACING SYSTEM (8px base unit)
  // ==========================================
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // ==========================================
  // TYPOGRAPHY SYSTEM
  // ==========================================
  typography: {
    // Font Families
    fontFamily: {
      display: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
      body: 'var(--font-inter), Inter, system-ui, -apple-system, sans-serif',
      mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    },

    // Font Sizes with Line Heights
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px / 16px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px / 20px
      base: ['1rem', { lineHeight: '1.5rem' }],     // 16px / 24px
      lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px / 28px
      xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px / 28px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px / 32px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px / 36px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }], // 36px / 40px
      '5xl': ['3rem', { lineHeight: '1' }],         // 48px / 48px
      '6xl': ['3.75rem', { lineHeight: '1' }],      // 60px / 60px
      '7xl': ['4.5rem', { lineHeight: '1' }],       // 72px / 72px
      '8xl': ['6rem', { lineHeight: '1' }],         // 96px / 96px
    },

    // Font Weights
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
      black: '900',
    },

    // Letter Spacing
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ==========================================
  // COLOR SYSTEM - Modern Teal-Cyan Palette
  // ==========================================
  colors: {
    // Primary Palette (Teal)
    primary: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',  // Main teal
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },

    // Secondary Palette (Cyan)
    secondary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',  // Main cyan
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344',
    },

    // Accent Colors
    accent: {
      purple: {
        500: '#8b5cf6',
        600: '#7c3aed',
      },
      pink: {
        500: '#ec4899',
        600: '#db2777',
      },
      amber: {
        500: '#f59e0b',
        600: '#d97706',
      },
    },

    // Semantic Colors
    success: {
      50: '#f0fdf4',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
    },
    warning: {
      50: '#fffbeb',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },

    // Neutral Grays (Slate)
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },

    // Special Colors
    white: '#ffffff',
    black: '#000000',
  },

  // ==========================================
  // GRADIENTS
  // ==========================================
  gradients: {
    primary: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
    primaryReverse: 'linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%)',
    primaryVertical: 'linear-gradient(180deg, #14b8a6 0%, #06b6d4 100%)',
    accent: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
    subtle: 'linear-gradient(135deg, #f0fdfa 0%, #ecfeff 100%)',
    dark: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  },

  // ==========================================
  // BORDER RADIUS
  // ==========================================
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    full: '9999px',
  },

  // ==========================================
  // SHADOWS
  // ==========================================
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',

    // Colored Shadows (for teal-cyan theme)
    'teal-glow': '0 10px 40px -10px rgba(20, 184, 166, 0.5)',
    'cyan-glow': '0 10px 40px -10px rgba(6, 182, 212, 0.5)',
  },

  // ==========================================
  // TRANSITIONS
  // ==========================================
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',

    // Easing Functions
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // ==========================================
  // Z-INDEX SCALE
  // ==========================================
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get color value by path (e.g., 'primary.500')
 */
export function getColor(path: string): string {
  const keys = path.split('.');
  let value: any = tokens.colors;

  for (const key of keys) {
    value = value?.[key];
  }

  return value || '';
}

/**
 * Get spacing value
 */
export function getSpacing(size: keyof typeof tokens.spacing): string {
  return tokens.spacing[size];
}

/**
 * Create a custom gradient
 */
export function createGradient(
  angle: number,
  ...colors: string[]
): string {
  const colorStops = colors.map((color, i) => {
    const percent = (i / (colors.length - 1)) * 100;
    return `${color} ${percent}%`;
  }).join(', ');

  return `linear-gradient(${angle}deg, ${colorStops})`;
}

export default tokens;
