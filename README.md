# Conduit Playwright Tests

[![Playwright Tests](https://github.com/Henkich/conduit-playwright-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/Henkich/conduit-playwright-tests/actions/workflows/playwright.yml)

End-to-end UI tests for [Conduit](https://github.com/Henkich/conduit-app), a RealWorld
Medium clone (React + Express + PostgreSQL), written with Playwright and TypeScript.

The application under test lives in a separate repository and runs locally in Docker.

## Tech stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model and custom Playwright fixtures
- Authentication via `storageState` (log in once in a setup project)
- Prettier, ESLint (`eslint-plugin-playwright`), `tsc` type checking
- GitHub Actions: on every pull request the app is started in Docker and the full suite runs

## What is covered

| Area     | Scenarios                                                                      |
| -------- | ------------------------------------------------------------------------------ |
| Login    | valid login, wrong password, unknown email, empty password (native validation) |
| Session  | session survives page reload, logout clears the session                        |
| Register | successful sign-up, already registered email                                   |
| Home     | logo and global feed are shown                                                 |

### Known application bugs

Tests describe the **expected** behaviour. A test that fails because of an application bug is
marked with `test.fail()` and a short description, so the suite stays green and the bug stays
visible in the report:

- **User enumeration on login**: an unknown email shows "Email not found", while a wrong password
  shows "Wrong email/password combination". Both cases should return the same message.

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
cp .env.example .env          # BASE_URL, defaults to http://localhost:3000
npm test
```

## Scripts

| Command             | What it does                                    |
| ------------------- | ----------------------------------------------- |
| `npm test`          | run all tests (setup project + chromium)        |
| `npm run test:ui`   | open Playwright UI mode                         |
| `npm run report`    | open the HTML report of the last run            |
| `npm run check`     | Prettier check + ESLint + TypeScript type check |
| `npm run format`    | format all files with Prettier                  |
| `npm run lint`      | run ESLint                                      |
| `npm run typecheck` | run `tsc`                                       |

## Project structure

```
tests/          test specs; auth.setup.ts logs in once and saves storageState
pages/          Page Objects: locators and user actions, no assertions
fixtures/       custom fixtures: page objects and a fresh API-created user per test
helpers/        API helpers (createUser) and auth state constants (AUTH_FILE, GUEST)
.github/        CI workflow
```

### Conventions

- Every `describe` declares its auth state explicitly:
  `test.use({ storageState: GUEST })` or `test.use({ storageState: AUTH_FILE })`.
- Test data is created per test through the API, so tests are independent and run in parallel.
- Login and session tests log in through the UI; other tests that need a user reuse `storageState`.
- Commits follow [Conventional Commits](https://www.conventionalcommits.org/); changes go through pull requests.
