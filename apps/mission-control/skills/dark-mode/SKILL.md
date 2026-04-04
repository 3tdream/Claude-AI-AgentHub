---
name: dark-mode
description: Toggle Mission Control UI theme between dark mode and light mode
disable-model-invocation: true
argument-hint: "on, off, or toggle (default: toggle)"
---

Switch the Mission Control UI theme between dark and light mode.

Steps:
1. Determine the desired action from $ARGUMENTS:
   - `on` → force dark mode
   - `off` → force light mode
   - `toggle` or no argument → flip the current setting
2. Read the current theme setting:
   - GET http://localhost:3077/api/settings — look for a `theme` or `darkMode` field in the response
   - If the endpoint is unavailable, check `data/settings.json` directly for the same field
3. Determine the new value:
   - If action is `toggle`, flip the current value (dark → light, light → dark)
   - If action is `on`, set to `dark`
   - If action is `off`, set to `light`
4. Apply the change:
   - PATCH http://localhost:3077/api/settings with body `{ "theme": "<new-value>" }`
   - If the API is unavailable, update `data/settings.json` directly with the new theme value
5. Confirm the change:
   - Re-fetch the setting and verify it reflects the new value
   - Report: "Theme switched to **<dark/light> mode** ✅"
6. Remind the user:
   - The change takes effect immediately in the browser — a hard refresh (Ctrl+Shift+R) may be needed if the UI does not update automatically
   - To make this permanent across restarts, ensure `data/settings.json` is persisted and not overwritten by deployments
