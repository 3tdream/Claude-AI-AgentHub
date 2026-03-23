---
name: animation
description: Add Framer Motion animations — page transitions, component enter/exit, hover effects, micro-interactions
argument-hint: <component or page> <animation type> — e.g. "SlotBar slide-in"
---

Add animation to: $ARGUMENTS

Animation types:
- **fade-in** — opacity 0→1
- **slide-in** — from left/right/top/bottom
- **scale** — grow from 0.95→1
- **stagger** — children animate one by one
- **spring** — bouncy physics-based
- **hover** — scale/shadow on hover
- **exit** — animate out before unmount
- **layout** — smooth layout shifts (AnimatePresence)
- **scroll** — trigger on scroll into view

1. Read the target component
2. Add Framer Motion imports and wrappers
3. Keep animations subtle and professional:
   - Duration: 0.2-0.5s for UI, 0.5-1s for page transitions
   - Easing: easeOut for enter, easeIn for exit
   - No flashy animations unless requested

Rules:
- Add `"use client"` if not already present
- Use `motion.div` wrappers, don't restructure the component
- `AnimatePresence` for conditional rendering
- `layout` prop for smooth reflows
- Respect `prefers-reduced-motion`
