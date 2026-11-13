---
paths:
  - 'tests/**/*.ts'
  - 'pages/**/*.ts'
  - 'helpers/**/*.ts'
  - 'fixtures/**/*.ts'
---

# Test rules

## Architecture

- Layers: test ("what we check") → Page Object / helper ("how") → Playwright.
- Page Object: locators and actions, NO `expect`. One class per page/component,
  covering all its states. Add a method only when it hides something,
  not to wrap a single line.
- Locators: `getByRole` → `getByPlaceholder` / `getByText` → `locator`.
  Distinguish identical elements by container (`.banner`, `.article-actions`),
  not by `first()` / `nth()`.
- Files by feature: guest and logged-in scenarios of one feature live in one
  file, in two `describe` blocks.
- Auth state: every `describe` starts with
  `test.use({ storageState: GUEST | AUTH_FILE })` (`helpers/auth.ts`,
  snapshot from `tests/auth.setup.ts`).

## Isolation and data

- Every test creates its own data with generated values; never rely on data
  from another test or on existing DB state.
- Tests are independent and can run in any order / in parallel. A dependency
  between steps is allowed only when the sequence IS the subject of the test
  (then use `test.step` inside one test, not several dependent tests).
- Setup via API; use the UI only where the UI itself is under test.

## No false greens

- Every test must be able to fail. When writing a new kind of test, break the
  expectation once and confirm the test goes red.
- Never change an expected value, remove an assertion or add retries/waits just
  to make a test pass. Find the root cause; if it's an app bug, report it.
- Known app bugs: the test describes CORRECT behavior +
  `test.fail(true, 'BUG: ...')`. Never assert the buggy behavior as expected.
- A `test.fail` test contains only the assertion that fails because of
  the bug. The main behavior is checked in a separate test without `test.fail`.
- No assertions inside `if` / `try-catch`; every `expect` is awaited
  (web-first assertions).

## What to assert

- One behavior per test; assert what the test is about, not everything visible.
- After a state-changing action, verify the resulting state (e.g. via API GET),
  not just the response or a toast.

## Coverage scope

- API: the contract in depth — success, auth (no token → 401), validation,
  not found, permissions (other user → 403).
- UI: happy path + critical negative cases of the user flow. Don't repeat in UI
  what API tests already cover (validation matrices, every status code).
- Readability over cleverness: a test should read as a scenario.

## Anti-patterns (never)

- `page.waitForTimeout()`, `{ force: true }`, `networkidle`
- `test.only` in commits; `test.skip` without a reason
- Shared mutable state between tests; hardcoded test data that can collide
- Conditional logic in tests
