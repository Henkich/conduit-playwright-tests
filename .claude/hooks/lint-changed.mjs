// After Claude edits a .ts/.mjs file, run ESLint on it.
// Lint errors   → exit 2: message goes to Claude, it must fix them.
// ESLint crash  → exit 1: message shown to the user only, Claude isn't misled.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const file = JSON.parse(input).tool_input?.file_path ?? '';

if (!/\.(ts|mjs)$/.test(file) || !existsSync(file)) process.exit(0);

const result = spawnSync(`npx eslint --no-warn-ignored "${file}"`, {
  encoding: 'utf8',
  shell: true,
});

if (result.status === 1) {
  console.error(`ESLint errors in ${file}:\n${result.stdout}`);
  process.exit(2);
}
if (result.status !== 0) {
  console.error(`ESLint failed to run on ${file}:\n${result.stdout}${result.stderr}`);
  process.exit(1);
}
process.exit(0);
