import { test, expect } from '../fixtures';
import { GUEST } from '../helpers/auth';

test.describe('Home page', () => {
  test.use({ storageState: GUEST });

  test('Main Page has logo and Global Feed', async ({ homePage, navbar }) => {
    await homePage.open();

    await expect(navbar.conduitLogo).toBeVisible();
    await expect(homePage.globalFeedTab).toBeVisible();
  });

  test('MOCKED: Empty Articles list', { tag: '@mock' }, async ({ homePage, page }) => {
    await page.route('**/api/articles*', async (route) => {
      await route.fulfill({ json: { articles: [], articlesCount: 0 } });
    });
    await homePage.open();

    await expect(homePage.noArticlesMessage).toBeVisible();
  });

  test(
    'MOCKED: 500 error message when articles request fails',
    { tag: '@mock' },
    async ({ homePage, page }) => {
      await page.route('**/api/articles*', async (route) => {
        await route.fulfill({ status: 500, json: { errors: { body: ['Internal server error'] } } });
      });
      await homePage.open();

      await expect(homePage.noArticlesMessage).toBeVisible();
    },
  );

  test('MOCKED: Empty tags', { tag: '@mock' }, async ({ homePage, page }) => {
    await page.route('**/api/tags*', async (route) => {
      await route.fulfill({ json: { tags: [] } });
    });
    await homePage.open();

    await expect(homePage.noTagsMessages).toBeVisible();
  });

  test(
    'MOCKED: 500 error message when tags request fails',
    { tag: '@mock' },
    async ({ homePage, page }) => {
      await page.route('**/api/tags*', async (route) => {
        await route.fulfill({ status: 500, json: { errors: { body: ['Internal server error'] } } });
      });
      await homePage.open();

      await expect(homePage.noTagsMessages).toBeVisible();
    },
  );
});
