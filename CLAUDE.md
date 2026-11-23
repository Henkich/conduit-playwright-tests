# CLAUDE.md — conduit-playwright-tests

## Environment

Windows, PowerShell, VS Code (Playwright and REST Client extensions), Node 22 LTS, npm 10,
Git 2.49, Docker Desktop + Compose. gh CLI is authenticated (account Henkich):
run `gh pr create` from the repository folder.

```
C:\TestProject\
├── conduit-playwright-tests\  ← this repository (GitHub: Henkich/conduit-playwright-tests)
└── conduit-app\               ← application under test (GitHub: Henkich/conduit-app)
```

Both repositories are public (CI checks out conduit-app without a token).

## Tests

Before planning or writing tests, read `.claude/rules/testing.md`
(and `.claude/rules/api-tests.md` for API tests).

## Application under test (conduit-app)

RealWorld / Conduit, a Medium clone: JWT, article CRUD, comments, follows, REST API.
Code from TonyMckes/conduit-realworld-example-app (upstream commit 5e127d8).
React/Vite + Express + Sequelize + Postgres in Docker Compose.

### Commands (from C:\TestProject\conduit-app)

- Start: `docker compose up -d --build --wait`
- Stop: `docker compose down` (data is kept in the pgdata volume)
- Reset the DB: `docker compose down -v`
- Logs: `docker compose logs -f backend` — the first place to look on a 500
- Status: `docker compose ps`

### URLs

- Frontend: http://localhost:3000 (nginx; `/api/*` is proxied to the backend)
- API: http://localhost:3001/api
- Postgres is not exposed outside Docker

### App specifics that matter for tests

- HashRouter: page URLs are `/#/login`, `/#/editor`, `/#/article/<slug>`
- API auth: header `Authorization: Token <jwt>` (NOT Bearer, with a space)
- The API is stateless: login only issues a token, every request sends it itself
- No seed data: the DB starts empty, tests create their own data
- API contract: `docs/realworld-openapi.yml` (the official RealWorld spec)

## Progress

Learning progress: PROGRESS.md (local, not in git) — use /progress to read
or update it. Don't read it unless asked.

@PROGRESS.md
