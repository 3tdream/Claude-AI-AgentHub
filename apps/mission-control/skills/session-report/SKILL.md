---
name: session-report
description: Summarize current coding session — commits, files changed, features built
disable-model-invocation: true
---

Generate a summary of the current coding session.

Steps:
1. Gather session data:
   - Run: `git log --oneline HEAD~20..HEAD` to see recent commits
   - Run: `git diff --stat HEAD~20` to count files changed and lines added/removed
   - Run: `git diff --name-status HEAD~20` to list new, modified, and deleted files
2. Analyze the commits:
   - Group by type: feat, fix, refactor, docs, style, perf, test, chore
   - Identify the main features or changes
3. Display the session report:
   - **Commits**: total count and list (short hash + message)
   - **Files Changed**: total count, lines added, lines removed
   - **New Files Created**: list of files with status "A" (added)
   - **Summary**: 3-5 bullet points of what was accomplished
     - Features built
     - Bugs fixed
     - Refactoring done
     - Tests added
4. If fewer than 20 commits exist, adjust the range to show all available commits
