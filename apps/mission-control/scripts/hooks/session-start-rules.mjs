#!/usr/bin/env node
// Session Start Rules — reminds Claude of key workflow rules at session start
// Trigger: SessionStart

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const MEMORY_DIR = join(process.env.HOME || process.env.USERPROFILE || '', '.claude', 'projects', 'C--Users-Ro050-Desktop-ai-projects', 'memory');

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  MISSION CONTROL — SESSION RULES (read before acting)');
  console.log('═══════════════════════════════════════════════════════');
  console.log('');

  // Read feedback memories
  try {
    const files = await readdir(MEMORY_DIR);
    const feedbacks = files.filter(f => f.startsWith('feedback_'));

    const rules = [];
    for (const f of feedbacks) {
      try {
        const content = await readFile(join(MEMORY_DIR, f), 'utf-8');
        // Extract first line after --- block (the rule name)
        const match = content.match(/name:\s*(.+)/);
        if (match) rules.push(match[1].trim());
      } catch { /* skip */ }
    }

    console.log('  TOP RULES:');
    console.log('  1. ALL tasks through MC system (/run or /api/command) — no direct edits');
    console.log('  2. Verify in BROWSER (Chrome DevTools) — not just curl');
    console.log('  3. Never say "done" without screenshot proof');
    console.log('  4. If system broken → fix system first, don\'t bypass');
    console.log('  5. Use skills: /status, /health, /deploy-check, /kb-search');
    console.log('');
    console.log('  FEEDBACK MEMORIES LOADED: ' + rules.length);
    rules.slice(0, 5).forEach(r => console.log('    • ' + r));
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
  } catch (err) {
    console.log('  Could not load memory files:', err.message);
  }

  // Clean session tracker
  try {
    const { unlink } = await import('fs/promises');
    await unlink('/tmp/mc-session-ran-command').catch(() => {});
  } catch { /* ignore */ }
}

main().catch(console.error);
