# CLAUDE.md — conduit-playwright-tests

## Середовище

Windows, PowerShell, VS Code (розширення Playwright, REST Client), Node 22 LTS, npm 10,
Git 2.49, Docker Desktop + Compose. gh CLI авторизовано (акаунт Henkich):
`gh pr create` у папці репозиторію.

```
C:\TestProject\
├── conduit-playwright-tests\  ← цей репозиторій (GitHub: Henkich/conduit-playwright-tests)
└── conduit-app\               ← тестований застосунок (GitHub: Henkich/conduit-app)
```

Обидва репозиторії публічні (CI скачує conduit-app без токена).

## Tests

Before planning or writing tests, read `.claude/rules/testing.md`
(and `.claude/rules/api-tests.md` for API tests).

## Тестований застосунок (conduit-app)

RealWorld / Conduit, клон Medium: JWT, CRUD статей, коментарі, підписки, REST API.
Код з TonyMckes/conduit-realworld-example-app (upstream-коміт 5e127d8).
React/Vite + Express + Sequelize + Postgres у Docker Compose.

### Команди (з C:\TestProject\conduit-app)

- Старт: `docker compose up -d --build --wait`
- Стоп: `docker compose down` (дані в volume pgdata зберігаються)
- Скидання БД: `docker compose down -v`
- Логи: `docker compose logs -f backend` — перше місце, куди дивитися при 500
- Статус: `docker compose ps`

### Адреси

- Frontend: http://localhost:3000 (nginx; `/api/*` проксується на backend)
- API: http://localhost:3001/api
- Postgres назовні не відкритий

### Особливості, важливі для тестів

- HashRouter: URL сторінок `/#/login`, `/#/editor`, `/#/article/<slug>`
- Авторизація в API: заголовок `Authorization: Token <jwt>` (НЕ Bearer, з пробілом)
- API stateless: логін лише видає токен, кожен запит передає його сам
- Сідів немає: база порожня, тести створюють свої дані
- Контракт API: `docs/realworld-openapi.yml` (офіційна специфікація RealWorld)

## Домовленості

## Прогрес

Що зроблено, на чому зупинились, що далі, порядок читання мануалу — в окремому файлі.
Сюди (CLAUDE.md) пишемо лише правила й довідку, а поточний стан і плани — у PROGRESS.md.

@PROGRESS.md
