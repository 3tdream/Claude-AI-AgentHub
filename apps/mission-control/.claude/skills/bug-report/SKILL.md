---
name: bug-report
description: Create structured bug report — steps to reproduce, expected vs actual, severity, root cause
argument-hint: <bug description>
---

Bug report for: $ARGUMENTS

**Title:** [concise, searchable title]

**Severity:** Critical / High / Medium / Low
**Priority:** P0 / P1 / P2

**Environment:**
- Browser/OS (if UI bug)
- API endpoint (if backend bug)
- Relevant config

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Trigger step]

**Expected Result:** What should happen

**Actual Result:** What actually happens

**Screenshots/Logs:** [if applicable — read error logs]

**Root Cause Analysis:**
- Read the relevant code
- Identify the exact line/function causing the issue
- Explain WHY it fails

**Suggested Fix:**
- File: path
- Change: description
- Impact: what else might be affected

**Regression Risk:** What could break if we fix this?
