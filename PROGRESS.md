# PROGRESS — conduit-playwright-tests

Журнал навчання: що зроблено, на чому зупинились, що далі. Правила роботи — у CLAUDE.md.

## На чому зупинились

П.6 частина 2 змерджено (PR #16, squash). Рефакторинг `BasePage` змерджено (PR #17).

- **Спершу:** локальний `main` відстає від GitHub (немає merge PR #17) →
  `git switch main`, `git pull --prune`, `git branch -d refactor/base-page`.
- **Далі:** нова гілка під стрічку `GET /api/articles/feed` (підписка → стаття в стрічці,
  статей тих, на кого не підписаний, немає). Потім решта ➖ з чек-листа або п.7 (моки).
- Фабрика: `createArticleData(overrides)` + `createArticle(request, token, overrides)`.
- Вправи з TS — у `C:\TestProject\ts-practice\`, запуск `npx tsx файл.ts` (не в репозиторії).
  Вправи в `tests/` чи в корені репо ламають `tsc` / лінт / CI (у Node немає `prompt`/`alert`).

## Рішення й нотатки з останніх сесій

- `CLAUDE.md` і `PROGRESS.md` тепер лежать у корені репозиторію, але **не закомічені**
  (як і `.claude/`, `api.http`). Вирішити: комітити чи додати в `.gitignore`.
- Git-правила й атрибуція Claude — у `.claude/rules/git.md` (код повністю користувача →
  без атрибуції; змішано → перелічити, що писав Claude).
- ESLint: `no-unused-vars` з `ignoreRestSiblings: true` — для `const { tagList, ...rest } = obj`.
- `npm audit fix --force` не запускати (може оновити пакети на несумісні версії).
  Команди: `npm run check` / `lint` / `typecheck`; `npm ci` — перевстановити залежності.
- CI: крок «Install Playwright browsers» раз завис на 10+ хв (збій завантаження, не код) →
  прогін падає по `timeout-minutes: 20`. Перезапуск: `gh run rerun <ID>` або в браузері
  Summary прогону → Re-run jobs.
- У браузері кнопки Re-run / Merge видно лише під акаунтом **Henkich** (не RomanPavelchak);
  `gh` у терміналі авторизований як Henkich.
- `BasePage.openBase(path)` поки лише обгортає `page.goto` — лишили «на виріст».

## Чек-лист п.6 частина 2

⭐ дуже потрібно · ➖ за бажанням

| Кейс                                                                                    |     | Стан      |
| --------------------------------------------------------------------------------------- | --- | --------- |
| Профілі: GET, 404, follow / unfollow, без токена                                        | ⭐  | ✅        |
| Статті POST: автор, без токена, порожнє поле, дубль, без tagList, tagList не масив      | ⭐  | ✅        |
| Статті GET: 200, 404                                                                    | ⭐  | ✅        |
| Статті PUT: body, title → новий slug, чужий 403 + незмінна, без токена, 404             | ⭐  | ✅        |
| Статті DELETE: автор (204/200, `expect.soft` + `test.fail`), чужий 403, без токена, 404 | ⭐  | ✅        |
| Обране: додати, прибрати, favorited per viewer / favoritesCount спільний                | ⭐  | ✅        |
| Список: фільтр `?author=` (баг articlesCount)                                           | ⭐  | ✅        |
| Список: фільтр `?tag=`                                                                  | ⭐  | ✅        |
| Стрічка `GET /api/articles/feed`: підписка → стаття в стрічці, чужих немає              | ⭐  | ⬜        |
| Обране без токена; `?favorited=`; пагінація; feed без токена                            | ➖  | ⬜        |
| Коментарі; `GET /api/tags`; PUT title на зайнятий (баг slug)                            | ➖  | ⬜        |
| README: нові баги (articlesCount, tagList рядком, без tagList → 500, DELETE → 200)      | ⭐  | ✅        |
| PR + merge **squash**                                                                   | ⭐  | ✅ PR #16 |

Нотатки до п.6: сервер повертає теги в довільному порядку → `expect.arrayContaining` +
`toHaveLength`; у PUT відправляємо лише поле, що змінюємо; після дії — GET для перевірки;
`myArticle` / `getAuthToken` в API-тестах не використовуємо (файл стану браузера).

## Порядок читання мануалу

Мануал: https://claude.ai/artifact/Dnu5LTkEVA7Y5TqeG98GCi. Перед кожною новою темою —
20–30 хв відповідного розділу, потім код.

| Перед чим                           | Що прочитати                                       |
| ----------------------------------- | -------------------------------------------------- |
| Фільтр за тегом, стрічка, решта API | TypeScript → Об'єкти й масиви, Функції             |
| П.7 моки мережі                     | Playwright → Діалоги, баги, моки; Очікування       |
| П.8 faker і фабрики                 | TypeScript → Власні типи, Generics (utility types) |
| П.9 флакі                           | Playwright → Паралельність і CI; Конфіг і дебаг    |
| Підготовка до співбесіди            | фільтр «часто питають», потім Live coding і SQL    |

## Зроблено

- Етапи 1–3: репозиторій, Conduit у Docker, перші UI-тести й Page Objects
- П.1 фікстури (PR #4) · п.2 `storageState` (PR #5) · п.3 Prettier / ESLint / tsc / `.env` (PR #6) ·
  п.4 CI на GitHub Actions (PR #7)
- П.5 статті (PR #11–13): редактор, сторінка статті для автора / чужого користувача / гостя,
  `createArticle`, `getAuthToken`, фікстура `myArticle`
- П.6 частина 1 (PR #14): project `api`, специфікація в `docs/`, `tests/api/users.spec.ts`
- README прибрано (PR #15)
- П.6 частина 2 (PR #16): профілі, статті CRUD, обране, фільтри списку, фабрика статей
- Рефакторинг (PR #17): `BasePage` (спільне `page`, `protected openBase`) для сторінок

## Код

- Page Objects: `LoginPage`, `RegisterPage`, `EditorPage`, `ArticlePage` (усі `extends BasePage`),
  `Navbar` (окремий компонент з `root`)
- Хелпери: `helpers/api.ts` (`createUser` → з `token`; `createArticleData(overrides)` і
  `createArticle(request, token, overrides)` → з `slug` і `tagList`), `helpers/data.ts` (генератори, `generateArticleTags` → 2–4 теги),
  `helpers/auth.ts` (`AUTH_FILE`, `GUEST`, `getAuthToken`)
- Фікстури (`fixtures/index.ts`): page objects, `user` (новий через API), `myArticle`
- API-тести: `users`, `profile`, `article`, `favorite`, `articles-list` у `tests/api/`
- Знайдені баги — у README, розділ «Known application bugs»
- `api.http` (REST Client) — локальна чернетка, не в git
- Шпаргалки: https://claude.ai/artifact/Dnu5LTkEVA7Y5TqeG98GCi (мануал Playwright + TS,
  API, SQL, live coding, співбесіда), https://claude.ai/artifact/JNCNwasqC96njky83nuFu1
  (createUser vs createArticle)

## Відкладено

- Коментарі — окремий компонент і окремі тести
- Хелпери favorite / follow через API — коли знадобляться кільком тестам
- Баги зі slug: `updateArticle` перегенеровує slug без перевірки унікальності; однакову
  назву не може використати інший автор
- Флакі (→ п.9, `trace: 'retain-on-failure'`): заголовок статті після публікації через UI в
  `article.spec.ts` інколи не з'являється за 5 с (на CI проходить з retry); API
  `GET /api/articles/:slug` раз дав 500 — у логах бекенду рідкісне
  `TypeError: toAppend.hasFollower is not a function` (helpers.js:32), схоже на гонку
- Дрібниці в `articlePage.spec.ts` на розсуд користувача: стиль назв тестів,
  `' 0 '` → `'( 0 )'`, `guestText` без `.row`, `descriptionInput` → `toHaveValue`

## План

1. ✅ Фікстури, `test.step`
2. ✅ `storageState` через setup-проєкт
3. ✅ Гігієна: `.env`, ESLint, Prettier, `tsc`
4. ✅ CI (GitHub Actions)
5. ✅ Створення статті, сторінка статті, баг зі slug
6. API-тести за специфікацією RealWorld — у процесі
7. Моки мережі (`page.route`): помилки сервера, порожні стани
8. Тестові дані: faker, фабрики
9. Flaky-тести: причини, `--repeat-each`, retries, trace viewer
10. Allure
11. Бонус: visual, accessibility (axe), k6
