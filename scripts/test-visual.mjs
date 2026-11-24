// Runs @visual tests inside the official Playwright Docker image, so screenshots
// render the same on every machine and in CI (baselines are Linux-only).
// Usage: node scripts/test-visual.mjs [extra playwright args, e.g. --update-snapshots]
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

// The image must match the installed Playwright version: browsers differ between releases
const { version } = JSON.parse(
  readFileSync(new URL('../node_modules/@playwright/test/package.json', import.meta.url), 'utf8'),
);
const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const extraArgs = process.argv.slice(2).join(' ');

const result = spawnSync(
  'docker',
  [
    'run',
    '--rm',
    '--ipc=host',
    // Reach the app published on the host machine (works on Docker Desktop and on Linux)
    '--add-host=host.docker.internal:host-gateway',
    '-e',
    'BASE_URL=http://host.docker.internal:3000',
    '-e',
    'CI',
    // Separate report folder, so the main test run's report is not overwritten
    '-e',
    'PLAYWRIGHT_HTML_OUTPUT_DIR=playwright-report-visual',
    '-v',
    `${process.cwd()}:/work`,
    // Linux node_modules in an anonymous volume, the host's node_modules stay untouched
    '-v',
    '/work/node_modules',
    '-w',
    '/work',
    image,
    'sh',
    '-c',
    `npm ci --no-audit --no-fund && npx playwright test --grep @visual ${extraArgs}`,
  ],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
