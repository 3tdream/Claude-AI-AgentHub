---
name: edge-cases
description: Brainstorm edge cases — boundary values, race conditions, null inputs, concurrent access for a specific component
argument-hint: <component or feature>
---

Edge case analysis for: $ARGUMENTS

1. Read the target code first
2. Identify edge cases by category:

**INPUT BOUNDARIES:**
- Empty string / null / undefined
- Max length strings (what happens at 10K chars?)
- Negative numbers / zero / MAX_SAFE_INTEGER
- Special characters: `<script>`, SQL injection, unicode, emoji
- Array with 0 items / 1 item / 10000 items

**STATE TRANSITIONS:**
- Double-click submit
- Navigate away during async operation
- Stale data after long idle
- Component unmount during fetch

**RACE CONDITIONS:**
- Two users editing same resource
- Rapid sequential API calls
- WebSocket reconnection during update

**ERROR CASCADES:**
- API returns 500 — does UI recover?
- Database timeout — does it retry or crash?
- Third-party service down — graceful degradation?

**PERMISSIONS:**
- Accessing resource after permission revoked
- URL manipulation to bypass UI restrictions

For each edge case: describe scenario, current behavior (read code), recommended handling.
