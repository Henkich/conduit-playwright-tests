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

### Архітектура тестів

- Шари: тест («що перевіряємо») → Page Object / хелпер («як») → Playwright
- Page Object: локатори й дії, **без** `expect`. Один клас на сторінку/компонент з усіма
  станами. Метод — лише коли щось ховає, а не обгортає один рядок
- Локатори: `getByRole` → `getByPlaceholder` / `getByText` → `locator`. Однакові елементи
  розрізняємо контейнером (`.banner`, `.article-actions`), а не `first()`/`nth()`
- Кожен тест створює свої дані; підготовка через API, UI лише там, де його й тестуємо
- Стан авторизації: кожен `describe` першим рядком задає
  `test.use({ storageState: GUEST | AUTH_FILE })` (`helpers/auth.ts`, знімок — `tests/auth.setup.ts`)
- Файли за функціоналом: гостьові й залогінені сценарії однієї фічі — один файл, два `describe`
- API-тести (`tests/api/`, project `api`): варіанти токена перевірено один раз на
  `GET /api/user`; для інших ендпоінтів — лише «без токена → 401»
- Відомі баги: тест описує правильну поведінку + `test.fail(true, 'BUG: ...')`
- `test.only` ніколи не комітимо

## Прогрес

Що зроблено, на чому зупинились, що далі, порядок читання мануалу — в окремому файлі.
Сюди (CLAUDE.md) пишемо лише правила й довідку, а поточний стан і плани — у PROGRESS.md.

@PROGRESS.md
