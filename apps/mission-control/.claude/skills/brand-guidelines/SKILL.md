---
name: brand-guidelines
description: Brand identity document or brand consistency audit — "create" for new brand, "audit" to check violations
argument-hint: <"create" for new brand | "audit" to check consistency | brand-name>
---

Brand identity management for the project.

## Mode: CREATE (new brand guidelines)
When $ARGUMENTS contains "create" or a brand name:

1. Ask for or infer:
   - Brand name and industry
   - Primary color(s) or mood (e.g. "professional", "playful", "luxury")
   - Target audience

2. Generate brand guidelines:
   - **Color Palette**: primary, secondary, accent + semantic colors
   - **Typography**: heading font + body font (Google Fonts)
   - **Tone of Voice**: formal/casual, technical/friendly
   - **Logo Usage**: min size, clear space, background rules
   - **Component Style**: rounded vs sharp, shadows vs flat, dense vs spacious
   - **Do's and Don'ts**: specific examples

3. Output as structured markdown file + CSS tokens

## Mode: AUDIT (check brand consistency)
When $ARGUMENTS contains "audit":

1. Read `app/globals.css` for current tokens
2. Scan components in `components/` and `app/` for:
   - Hardcoded colors (not using CSS variables)
   - Inconsistent border-radius usage
   - Mixed font families
   - Inconsistent spacing patterns
   - Components not following the established pattern

3. Report:
   | Issue | File | Line | Expected | Found |
   - Count of violations by type
   - Severity: high (visible to user) / low (internal)

4. Suggest fixes for each violation

Rules:
- When creating, always generate WCAG 2.1 AA compliant palettes
- When auditing, read actual files — don't guess
- Respond in the same language as the user's input
