// Blocks dangerous git operations before Claude runs them.
// Exit code 2 = block the command; the stderr message is shown to Claude.
import { execSync } from 'node:child_process';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const cmd = JSON.parse(input).tool_input?.command ?? '';

const PROTECTED_BRANCHES = ['main', 'master'];
// "main" as a separate word: "origin main", "HEAD:main" — but not "test/main-page"
const TARGETS_PROTECTED = /(^|[\s:])(main|master)(\s|$)/;

function block(reason) {
  console.error(`Blocked by guard-git hook: ${reason}`);
  process.exit(2);
}

function currentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

if (!/\bgit\b/.test(cmd)) process.exit(0);

if (/\bgit\s+push\b/.test(cmd)) {
  if (/\s(--force\S*|-f)(\s|$)/.test(cmd)) block('force push is not allowed');
  if (/\s--delete(\s|$)|\s:\S/.test(cmd)) block('deleting remote branches is not allowed');
  if (TARGETS_PROTECTED.test(cmd)) block('pushing to main is not allowed — use a PR');
  if (PROTECTED_BRANCHES.includes(currentBranch()))
    block('you are on main — create a branch and open a PR');
}

if (/\bgit\s+commit\b/.test(cmd) && PROTECTED_BRANCHES.includes(currentBranch())) {
  block('committing directly to main is not allowed — create a branch first');
}

process.exit(0);
