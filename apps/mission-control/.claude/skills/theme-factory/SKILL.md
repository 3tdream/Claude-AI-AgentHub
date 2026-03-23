---
name: theme-factory
description: Generate complete CSS theme from description — "dark mode", "beauty clinic pink" → full :root variables
argument-hint: <theme description> — e.g. "dark mode", "beauty clinic pink", "corporate blue"
---

Generate a complete theme based on: $ARGUMENTS

## Steps:

1. **Read current theme** in `app/globals.css` — understand existing tokens
2. **Generate new theme** with all required tokens:

### Color Palette (HSL format)
```css
--background: H S% L%;
--foreground: H S% L%;
--primary: H S% L%;
--primary-foreground: H S% L%;
--secondary: H S% L%;
--accent: H S% L%;
--muted: H S% L%;
--muted-foreground: H S% L%;
--destructive: H S% L%;
--border: H S% L%;
--ring: H S% L%;
--card: H S% L%;
--card-foreground: H S% L%;
--popover: H S% L%;
--popover-foreground: H S% L%;
```

### Typography
- Font family (Google Fonts import if needed)
- Font sizes (keep existing scale unless requested otherwise)
- Font weights for headings/body

### Component Tokens
- Border radius scale
- Shadow definitions
- Transition durations
- Focus ring styles

### Status Colors
- Success, warning, error, info — adapted to theme

3. **Contrast check** — verify WCAG 2.1 AA compliance:
   - Text on background: ratio >= 4.5:1
   - Large text on background: ratio >= 3:1
   - Interactive elements: ratio >= 3:1

4. **Output** as a CSS block ready to add to `globals.css`
   - Include both `:root` (light) and `.dark` variants
   - Include Google Fonts @import if new fonts used

Rules:
- All colors in HSL (not hex) for Tailwind compatibility
- Maintain existing token names — only change values
- Test contrast ratios before outputting
- Respond in the same language as the user's input
