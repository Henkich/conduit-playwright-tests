---
paths:
  - 'tests/api/**/*.ts'
---

# API test rules

- Project `api`. Contract: `docs/realworld-openapi.yml` — check it before
  writing a test; don't guess fields or status codes.
- Auth header: `Authorization: Token <jwt>` (NOT Bearer).
- Token variants are tested once on `GET /api/user`; for other endpoints only
  "no token → 401".
- `PUT`: send only the field being changed.
- After an action, verify with a separate `GET`.
- Server returns tags in arbitrary order → `expect.arrayContaining` + `toHaveLength`.
- Don't use `myArticle` / `getAuthToken` in API tests (they depend on the
  browser state file) — create data via `helpers/api.ts`.
