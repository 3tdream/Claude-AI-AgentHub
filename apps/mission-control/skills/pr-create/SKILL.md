---
name: pr-create
description: Create a GitHub Pull Request with an auto-generated summary from branch diff
disable-model-invocation: true
argument-hint: target branch (default: main)
---

Create a GitHub Pull Request for the current branch.

Steps:
1. Determine the target branch from $ARGUMENTS (default to `main` if not provided)
2. Gather branch context:
   - Run: `git rev-parse --abbrev-ref HEAD` — current branch name
   - Run: `git log <target>..<current> --oneline --no-merges` — commits in this PR
   - Run: `git diff <target>...<current> --stat` — files changed summary
3. Build the PR title:
   - Use the most recent commit subject, or derive from branch name (e.g. `feat/add-dark-mode` → "feat: add dark mode")
4. Build the PR body using this template:
   ```
   ## Summary
   <1–3 sentence description of what this PR does>

   ## Changes
   <bullet list of key changes from commit log>

   ## Files Changed
   <git diff --stat output>

   ## Testing
   - [ ] Type check passes (`tsc --noEmit`)
   - [ ] Pages load without errors
   - [ ] No regressions in affected areas
   ```
5. Check for a GITHUB_TOKEN in environment or .env.local:
   - If found, create the PR via GitHub API:
     `POST https://api.github.com/repos/<owner>/<repo>/pulls`
     with title, body, head branch, and base branch
   - If not found, output the full `gh pr create` CLI command with the generated title and body pre-filled so the user can run it manually
6. Report the PR URL on success, or the exact CLI command to run on fallback
