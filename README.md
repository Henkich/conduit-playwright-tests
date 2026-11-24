# Conduit Playwright Tests

[![Playwright Tests](https://github.com/Henkich/conduit-playwright-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/Henkich/conduit-playwright-tests/actions/workflows/playwright.yml)

UI and API tests for [Conduit](https://github.com/Henkich/conduit-app), a RealWorld
Medium clone (React + Express + PostgreSQL), written with Playwright and TypeScript.
The application under test lives in a separate repository and runs locally in Docker.

## Tech stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model and custom fixtures
- API tests checked against the [RealWorld OpenAPI spec](docs/realworld-openapi.yml)
- Network mocking (`page.route`), accessibility checks with [axe](https://github.com/dequelabs/axe-core)
- Allure and Playwright HTML reports
- Prettier, ESLint (`eslint-plugin-playwright`), `tsc`
- GitHub Actions

## Getting started

### Prerequisites

- Node.js 22
- Docker Desktop

### 1. Start the application

```bash
git clone https://github.com/Henkich/conduit-app.git
cd conduit-app
cp .env.example .env          # set POSTGRES_PASSWORD and JWT_KEY
docker compose up -d --build --wait
```

Frontend: http://localhost:3000, API: http://localhost:3001/api

### 2. Install and run the tests

```bash
git clone https://github.com/Henkich/conduit-playwright-tests.git
cd conduit-playwright-tests
npm ci
npx playwright install chromium
cp .env.example .env          # BASE_URL (UI) and API_URL (API tests)
npm test
```

## Scripts

| Command                      | What it does                                    |
| ---------------------------- | ----------------------------------------------- |
| `npm test`                   | run all tests except visual                     |
| `npm run test:api`           | run only API tests                              |
| `npm run test:visual`        | run visual tests in the Playwright Docker image |
| `npm run test:visual:update` | regenerate visual baselines (check them!)       |
| `npm run test:ui`            | open Playwright UI mode                         |
| `npm run check`              | Prettier check + ESLint + TypeScript type check |
| `npm run format`             | format all files with Prettier                  |
| `npm run report`             | open the HTML report of the last run            |
| `npm run allure:generate`    | build the Allure report from the last run       |
| `npm run allure:open`        | open the Allure report                          |

Run a subset by tag: `npx playwright test --grep @mock` (mocked network) or `--grep @a11y`
(accessibility).

Visual tests (`@visual`) compare screenshots with committed baselines. Rendering differs between
operating systems, so the baselines are Linux-only and the tests always run in the official
Playwright Docker image (Docker must be running), locally and in CI.

## Project structure

```
tests/          UI specs; auth.setup.ts logs in once and saves storageState
tests/api/      API specs (no browser)
pages/          Page Objects: locators and user actions, no assertions
fixtures/       custom fixtures: page objects, an API-created user and article
helpers/        API helpers, test data generators, auth state, Allure labels
docs/           RealWorld OpenAPI spec used as the API contract
.github/        CI workflow
```

Playwright projects: `setup` (login), `chromium` (UI tests, depend on `setup`), `api`.

## Conventions

- Every `describe` declares its auth state: `test.use({ storageState: GUEST })` or
  `test.use({ storageState: AUTH_FILE })`.
- Each test creates its own data through the API, so tests are independent and run in parallel.
- Tests describe the expected behaviour. A test that fails because of a known application bug is
  marked with `test.fail(true, 'BUG: ...')`: the suite stays green, and the test turns red once
  the bug is fixed.
- Changes go through pull requests; commits follow
  [Conventional Commits](https://www.conventionalcommits.org/).

## CI

Every push to `main` and every pull request: code checks, then the app is started in Docker and
the full suite runs, then the visual tests run in the Playwright Docker image. The Playwright HTML
reports (main and visual) and the Allure report are uploaded as workflow artifacts.
