---
name: color-scale
description: Generate a complete color scale from a single base color — 50 to 950 shades in HSL
argument-hint: <color> — e.g. "#E91E63", "pink", "hsl(340 82% 52%)"
---

Generate color scale from: $ARGUMENTS

Output a full scale (50-950) in HSL format:

```css
--color-50:  H S% 97%;   /* lightest */
--color-100: H S% 94%;
--color-200: H S% 86%;
--color-300: H S% 76%;
--color-400: H S% 64%;
--color-500: H S% 52%;   /* base */
--color-600: H S% 43%;
--color-700: H S% 35%;
--color-800: H S% 27%;
--color-900: H S% 20%;
--color-950: H S% 12%;   /* darkest */
```

Also provide:
- **Contrast pairs** — which shades work as text-on-background (WCAG AA)
- **Semantic mapping** — suggested use for primary, hover, active, disabled
- **Dark mode variants** — inverted scale for dark backgrounds
- **Tailwind usage** — how to use in classes

Convert any input format (hex, rgb, named color) to HSL first.
