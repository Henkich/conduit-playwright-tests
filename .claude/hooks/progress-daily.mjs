// SessionStart: once per day, inject "На чому зупинились" from PROGRESS.md
// into Claude's context. Later sessions the same day get nothing.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const progressFile = join(dir, 'PROGRESS.md');
const stampFile = join(dir, '.claude', '.progress-last-shown');
const today = new Date().toLocaleDateString('sv'); // YYYY-MM-DD, local time

if (!existsSync(progressFile)) process.exit(0);
if (existsSync(stampFile) && readFileSync(stampFile, 'utf8').trim() === today) process.exit(0);

const text = readFileSync(progressFile, 'utf8');
const match = text.match(/## На чому зупинились\s*\n([\s\S]*?)(?=\n## |$)/);
if (!match) process.exit(0);

console.log(
  `First session today. From PROGRESS.md, section "На чому зупинились":\n\n` +
    `${match[1].trim()}\n\n` +
    `In your first reply, briefly (2–3 lines) remind the user where we stopped and ` +
    `the next step, then handle their message. Don't start the next step unless asked.`,
);
writeFileSync(stampFile, today);
process.exit(0);
