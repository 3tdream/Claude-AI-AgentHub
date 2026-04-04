---
name: changelog
description: Auto-generate CHANGELOG.md from git commits — grouped by type, tagged with version
disable-model-invocation: true
argument-hint: version tag or commit range (e.g. v1.2.0 or HEAD~20..HEAD)
---

Generate or update CHANGELOG.md from git commit history.

Steps:
1. Determine the commit range from $ARGUMENTS:
   - If a version tag is given (e.g. v1.2.0), use the range from the previous tag to that tag
   - If a range is given (e.g. HEAD~20..HEAD), use it directly
   - If no argument, default to commits since the last git tag: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`
2. Collect commits in the range:
   - Run: `git log <range> --pretty=format:"%h %s" --no-merges`
3. Categorise each commit by conventional-commit prefix:
   - **feat:** → Features
   - **fix:** → Bug Fixes
   - **perf:** → Performance
   - **refactor:** → Refactoring
   - **docs:** → Documentation
   - **chore:** / **ci:** → Maintenance
   - **BREAKING CHANGE** in body → Breaking Changes (always listed first)
   - Uncategorised → Other Changes
4. Read the existing CHANGELOG.md (if present) to find where to insert the new section
5. Write the new version block in Keep-a-Changelog format:
   ```
   ## [<version>] - <YYYY-MM-DD>
   ### Breaking Changes
   ### Features
   ### Bug Fixes
   ...
   ```
6. Prepend the new block to CHANGELOG.md (or create the file if it does not exist)
7. Confirm: "CHANGELOG.md updated — N commits across X categories for <version>"
