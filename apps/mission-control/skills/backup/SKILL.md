---
name: backup
description: Snapshot the Mission Control data directory into a timestamped archive
disable-model-invocation: true
argument-hint: destination path (default: ./backups)
---

Create a timestamped snapshot of the Mission Control data directory.

Steps:
1. Determine the destination from $ARGUMENTS (default: `./backups` relative to project root)
2. Confirm the source directory exists:
   - Check that `./data` exists in the project root
   - List top-level contents: `ls -lh data/` — note total size
3. Create the destination directory if it does not exist:
   - Run: `mkdir -p <destination>`
4. Generate the archive filename:
   - Format: `mc-backup-YYYY-MM-DD-HHmmss.tar.gz`
   - Example: `mc-backup-2025-01-15-143022.tar.gz`
5. Create the compressed archive:
   - Run: `tar -czf <destination>/<filename> data/`
   - Exclude any large transient files: `--exclude=data/cache --exclude=data/*.log`
6. Verify the archive:
   - Run: `tar -tzf <destination>/<filename> | wc -l` — confirm file count > 0
   - Run: `ls -lh <destination>/<filename>` — show final archive size
7. Report the result:
   - **Archive**: full path to the created file
   - **Size**: compressed archive size
   - **Files**: number of files archived
   - **Duration**: time taken
8. Optionally remind the user to copy the archive off-server (S3, external drive, etc.) for a true off-site backup
