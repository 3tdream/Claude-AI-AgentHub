---
name: figma
description: Figma to code workflow — extract design from Figma URL, adapt to project stack, generate components
argument-hint: <figma-url> or "inspect <component-name>"
---

Convert Figma designs to production code using the Figma MCP integration.

## When given a Figma URL:

1. **Extract design context:**
   - Parse fileKey and nodeId from URL
   - Call `get_design_context` with fileKey and nodeId
   - Call `get_screenshot` for visual reference

2. **Analyze the design:**
   - Identify components, layout patterns, colors, typography
   - Map Figma tokens to existing project tokens in `app/globals.css`
   - Note any new tokens needed

3. **Adapt to project stack:**
   - Convert to Next.js 15 + React 19 + Tailwind CSS 4
   - Use existing Radix UI components where applicable
   - Map colors to HSL CSS variables
   - Use Lucide icons instead of custom SVGs where possible

4. **Generate code:**
   - Component files in `components/`
   - Page files in `app/(shell)/` if full page
   - CSS additions to `globals.css` if new tokens needed
   - TypeScript interfaces for props

## When asked to "inspect":
- Use `get_metadata` to analyze component structure
- Report: layers, auto-layout settings, design tokens used
- Suggest how to implement with existing project components

Rules:
- Always check existing components before creating new ones
- Preserve Figma's responsive behavior (auto-layout → flex/grid)
- Match spacing exactly (round to 4px grid)
- If Code Connect mappings exist — use them directly
- Respond in the same language as the user's input

URL parsing:
- figma.com/design/:fileKey/:fileName?node-id=:nodeId → convert "-" to ":" in nodeId
- figma.com/board/:fileKey → FigJam, use get_figjam
