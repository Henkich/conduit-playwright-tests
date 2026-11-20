import { test, expect } from '../fixtures';
import { createArticle, createArticleData } from '../helpers/api';
import { GUEST } from '../helpers/auth';
import { generateArticleName, generateTag, generateUsername } from '../helpers/data';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';

test.describe('Home page', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
  });

  test('Main Page has logo and Global Feed', async ({ homePage, navbar }) => {
    await allure.feature(FEATURE.articleList);
    await allure.severity(allure.Severity.MINOR);
    await homePage.open();

    await expect(navbar.conduitLogo).toBeVisible();
    await expect(homePage.globalFeedTab).toBeVisible();
  });

  test('MOCKED: Empty Articles list', { tag: '@mock' }, async ({ homePage, page }) => {
    await allure.feature(FEATURE.articleList);
    await allure.severity(allure.Severity.NORMAL);
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
      await allure.feature(FEATURE.articleList);
      await allure.severity(allure.Severity.NORMAL);
      await page.route('**/api/articles*', async (route) => {
        await route.fulfill({ status: 500, json: { errors: { body: ['Internal server error'] } } });
      });
      await homePage.open();

      await expect(homePage.noArticlesMessage).toBeVisible();
    },
  );

  test('MOCKED: Empty tags', { tag: '@mock' }, async ({ homePage, page }) => {
    await allure.feature(FEATURE.tags);
    await allure.severity(allure.Severity.NORMAL);
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
      await allure.feature(FEATURE.tags);
      await allure.severity(allure.Severity.NORMAL);
      await page.route('**/api/tags*', async (route) => {
        await route.fulfill({ status: 500, json: { errors: { body: ['Internal server error'] } } });
      });
      await homePage.open();

      await expect(homePage.noTagsMessages).toBeVisible();
    },
  );

  test('MOCKED: Network abort with tags request', { tag: '@mock' }, async ({ homePage, page }) => {
    await allure.feature(FEATURE.tags);
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: Full empty page');
    await page.route('**/api/tags*', async (route) => {
      await route.abort();
    });
    await homePage.open();

    await expect(homePage.noTagsMessages).toBeVisible();
  });

  test(
    'MOCKED: Network abort with Articles request',
    { tag: '@mock' },
    async ({ homePage, page }) => {
      await allure.feature(FEATURE.articleList);
      await allure.severity(allure.Severity.NORMAL);
      test.fail(true, 'BUG: Full empty page');
      await page.route('**/api/articles*', async (route) => {
        await route.abort();
      });
      await homePage.open();

      await expect(homePage.noArticlesMessage).toBeVisible();
    },
  );

  test(
    'MOCKED: Pagination respond articles amount',
    { tag: '@mock' },
    async ({ homePage, page, user, request }) => {
      await allure.feature(FEATURE.articleList);
      await allure.severity(allure.Severity.NORMAL);
      await createArticle(request, user.token);

      await page.route('**/api/articles*', async (route) => {
        const response = await route.fetch();
        const json = await response.json();

        await route.fulfill({ response, json: { ...json, articlesCount: 6 } });
      });
      await homePage.open();

      await expect(homePage.navPagination).toBeVisible();
      await expect(homePage.pageButton(2)).toBeVisible();
      await expect(homePage.pageButton(3)).toHaveCount(0);
    },
  );

  test(
    'MOCKED: Loader is shown while articles are loading',
    { tag: '@mock' },
    async ({ homePage, page }) => {
      await allure.feature(FEATURE.articleList);
      await allure.severity(allure.Severity.MINOR);
      await page.route('**/api/articles*', async (route) => {
        await new Promise((resolve) => {
          setTimeout(resolve, 1500);
        });
        await route.fulfill({ json: { articles: [], articlesCount: 0 } });
      });
      await homePage.open();

      await expect(homePage.loadingArticles).toBeVisible();
      await expect(homePage.loadingArticles).toBeHidden();
      await expect(homePage.noArticlesMessage).toBeVisible();
    },
  );

  test(
    "MOCKED: Real possible valid article's data",
    { tag: '@mock' },
    async ({ homePage, page }) => {
      await allure.feature(FEATURE.articleList);
      await allure.severity(allure.Severity.NORMAL);
      const { body, ...articleData } = createArticleData();
      const article = {
        slug: generateArticleName(),
        ...articleData,
        createdAt: '2026-11-18T12:00:43.239Z',
        updatedAt: '2026-11-18T12:00:43.259Z',
        favorited: false,
        favoritesCount: 42,
        author: {
          username: generateUsername(),
          bio: null,
          image: null,
          following: false,
        },
      };
      await page.route('**/api/articles*', async (route) => {
        await route.fulfill({ json: { articles: [article], articlesCount: 1 } });
      });
      await homePage.open();

      await expect(homePage.authorUsername).toHaveText(article.author.username);
      await expect(homePage.articleDescription).toHaveText(article.description);
      await expect(homePage.articleTitle).toHaveText(article.title);
      await expect(homePage.articleLikes).toContainText(`${article.favoritesCount}`);
      await expect(homePage.articleDate).toHaveText('November 18, 2026');
      await expect(homePage.articleTags).toHaveText(article.tagList);
    },
  );

  test(
    'MOCKED: Click on popular tag sends request with this tag',
    { tag: '@mock' },
    async ({ homePage, page }) => {
      await allure.feature(FEATURE.tags);
      await allure.severity(allure.Severity.NORMAL);
      const tag = generateTag();
      await page.route('**/api/tags*', async (route) => {
        await route.fulfill({ json: { tags: [tag] } });
      });
      await homePage.open();

      const requestPromise = page.waitForRequest('**/api/articles?tag=*');
      await homePage.popularTag(tag).click();
      const tagRequest = await requestPromise;
      expect(new URL(tagRequest.url()).searchParams.get('tag')).toBe(tag);
    },
  );

  test('Corresponded Article appears after click on the tag', async ({
    homePage,
    page,
    user,
    request,
  }) => {
    await allure.feature(FEATURE.tags);
    await allure.severity(allure.Severity.CRITICAL);
    const article = await createArticle(request, user.token);
    const tag = article.tagList[0];
    await page.route('**/api/tags*', async (route) => {
      await route.fulfill({ json: { tags: [tag] } });
    });
    await homePage.open();
    await expect(homePage.loadingArticles).toBeHidden();
    await homePage.popularTag(tag).click();

    await expect(homePage.articleTitle).toHaveText([article.title]);
    await expect(homePage.feedTag(tag)).toBeVisible();
    await expect(homePage.feedTag(tag)).toHaveClass(/active/);
  });
});
