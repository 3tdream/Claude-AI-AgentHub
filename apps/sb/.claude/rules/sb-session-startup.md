# SB Project Session Startup Rule

## Rule: Check Allowed Actions Rendering

**When:** Every time a new session starts on the SB project

**Action:** Verify that the "Allowed Actions" feature renders correctly in the agent settings/edit page.

### Steps to Verify

1. Start both projects with PM2:
   ```bash
   pm2 start "npx nodemon" --name "sb-api" --cwd "C:\Users\Ro050\Desktop\ai-projects\sb\sb-api-services-v2" --interpreter none
   pm2 start "npx vite" --name "sb-ui" --cwd "C:\Users\Ro050\Desktop\ai-projects\sb\sb-chat-ui" --interpreter none
   ```

2. Navigate to the UI at http://localhost:5173

3. Log in with Google OAuth

4. Go to any agent's settings/edit page:
   - Click on an agent/assistant
   - Navigate to Settings or Edit
   - Locate the "Allowed Actions" section

5. Verify the following renders correctly:
   - [ ] Allowed Actions section is visible
   - [ ] Action items display properly
   - [ ] Add/Remove action buttons work
   - [ ] Action toggles/checkboxes function correctly
   - [ ] No console errors related to allowed actions

### If Issues Found

- Document the issue with screenshots
- Check browser console for errors
- Review recent changes to:
  - `sb-chat-ui/src/components/` (agent settings components)
  - `sb-api-services-v2/src/routes/assistant.ts`
  - Related MobX/Zustand stores

### Related Files

- Frontend: `sb-chat-ui/src/components/assistant/`
- Backend: `sb-api-services-v2/src/routes/assistant.ts`
- Stores: Check both MobX and Zustand stores for assistant/agent state
