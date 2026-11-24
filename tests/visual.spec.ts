import { test, expect } from '../fixtures';
import { GUEST } from '../helpers/auth';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';

test.describe('Login page visual', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async ({ loginPage }) => {
    await allure.epic(EPIC.auth);
    await loginPage.open();
    await allure.feature(FEATURE.login);
  });

  test('Screenshot match the baseline', { tag: '@visual' }, async ({ page, loginPage }) => {
    await allure.severity(allure.Severity.NORMAL);

    await expect(loginPage.passwordInput).toBeVisible();
    await expect(page).toHaveScreenshot('login.png');
  });
});

test.describe('Home page visual', () => {
  test.use({ storageState: GUEST });

  test('Screenshot match the baseline', { tag: '@visual' }, async ({ page, homePage }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.articleList);
    await allure.severity(allure.Severity.NORMAL);

    const article = {
      slug: 'visual-check-slug',
      title: 'visual-check-title',
      description: 'visual-check-description',
      tagList: ['oneTag', 'twoTag', '3tag'],
      createdAt: '2026-11-18T12:00:43.239Z',
      updatedAt: '2026-11-18T12:00:43.259Z',
      favorited: false,
      favoritesCount: 42,
      author: {
        username: 'visual-check-username',
        bio: null,
        image: null,
        following: false,
      },
    };
    await page.route('**/api/articles*', async (route) => {
      await route.fulfill({ json: { articles: [article], articlesCount: 1 } });
    });

    const tags = ['oneTag', 'twoTag', '3tag'];
    await page.route('**/api/tags*', async (route) => {
      await route.fulfill({ json: { tags: tags } });
    });

    await homePage.open();

    await expect(homePage.articleTitle).toHaveText(article.title);
    await expect(homePage.popularTags).toHaveText(tags);

    await expect(page).toHaveScreenshot('home.png');
  });
});
