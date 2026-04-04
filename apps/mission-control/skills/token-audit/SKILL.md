---
name: token-audit
description: Check API token expiry dates and surface tokens that are expired or expiring soon
disable-model-invocation: true
argument-hint: warning threshold in days (default: 30)
---

Audit all configured API tokens for expiry and validity.

Steps:
1. Determine the warning threshold from $ARGUMENTS (default: 30 days)
2. Read token sources:
   - Parse `.env.local` in the project root for all keys ending in `_TOKEN`, `_API_KEY`, or `_SECRET`
   - GET http://localhost:3077/api/system/health — check if any token status is reported in the health payload
3. For each token found, attempt to determine expiry:
   - **GitHub tokens**: GET https://api.github.com/rate_limit with the token — check the `X-OAuth-Scopes` and `X-Token-Expiration` response headers
   - **Anthropic / OpenAI keys**: make a minimal authenticated request (e.g. list models) and check for 401 / expiry errors
   - **Other tokens**: note that expiry cannot be determined programmatically and flag for manual review
4. Classify each token:
   - ✅ **Valid** — confirmed working, expiry > threshold days away (or no expiry)
   - ⚠️ **Expiring Soon** — expiry within the warning threshold
   - ❌ **Expired / Invalid** — 401 response or past expiry date
   - ❓ **Unknown** — could not determine status (manual check required)
5. Display the audit table:
   - Columns: Token Name | Status | Expiry Date | Days Remaining | Action
   - Never print the token value — show only the first 6 characters followed by `…`
6. For each ⚠️ or ❌ token, provide the renewal URL or command
7. Summary line: "N/N tokens healthy — X expiring within <threshold> days, Y expired"
