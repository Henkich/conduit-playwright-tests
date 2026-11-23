import { test, expect } from '../fixtures';
import { generateArticleName, uniqueId } from '../helpers/data';
import { AUTH_FILE, GUEST } from '../helpers/auth';
import { createArticleData } from '../helpers/api';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';

test.describe('Article editor', () => {
  test.use({ storageState: AUTH_FILE });

  test.beforeEach(async ({ editorPage }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.createArticle);
    await editorPage.open();
  });

  test('editor shows all article fields', async ({ editorPage }) => {
    await allure.severity(allure.Severity.MINOR);
    await expect(editorPage.titleInput).toBeVisible();
    await expect(editorPage.descriptionInput).toBeVisible();
    await expect(editorPage.bodyInput).toBeVisible();
    await expect(editorPage.tagsInput).toBeVisible();
    await expect(editorPage.publishButton).toBeVisible();
  });

  test('user can publish an article', async ({ editorPage, page }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const article = createArticleData();

    const responsePromise = page.waitForResponse(
      (res) => res.url().endsWith('/api/articles') && res.request().method() === 'POST',
    );
    await editorPage.publish(article);

    const response = await responsePromise;
    const json = await response.json();

    await expect(page).toHaveURL(`/#/article/${json.article.slug}`);
    await expect(page.getByRole('heading', { name: article.title })).toBeVisible();
  });

  test('user can publish an article without tags', async ({ editorPage, page }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = createArticleData({ tagList: [] });

    const responsePromise = page.waitForResponse(
      (res) => res.url().endsWith('/api/articles') && res.request().method() === 'POST',
    );
    await editorPage.publish(article);

    const response = await responsePromise;
    const json = await response.json();

    await expect(page).toHaveURL(`/#/article/${json.article.slug}`);
    await expect(page.getByRole('heading', { name: article.title })).toBeVisible();
  });

  test('user cannot publish an article with an empty title', async ({ editorPage, page }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = createArticleData({ title: '' });
    await editorPage.publish(article);

    const isMissing = await editorPage.titleInput.evaluate(
      (input: HTMLInputElement) => input.validity.valueMissing,
    );
    expect(isMissing).toBe(true);
    await expect(page).toHaveURL(/\/#\/editor$/);
  });

  test('user cannot publish two articles with the same title', async ({ editorPage, page }) => {
    await allure.severity(allure.Severity.NORMAL);
    const title = generateArticleName();
    const article = createArticleData({ title: title });

    const responsePromise = page.waitForResponse(
      (res) => res.url().endsWith('/api/articles') && res.request().method() === 'POST',
    );
    await editorPage.publish(article);

    const response = await responsePromise;
    const json = await response.json();

    await expect(page).toHaveURL(`/#/article/${json.article.slug}`);
    await expect(page.getByRole('heading', { name: article.title })).toBeVisible();

    await editorPage.open();
    const articleDuplicated = createArticleData({ title: title });
    await editorPage.publish(articleDuplicated);

    await expect(editorPage.errorMessage).toBeVisible();
    await expect(editorPage.errorMessage).toContainText(/Title already exists/i);
    await expect(page).toHaveURL(/\/#\/editor$/);
  });

  test('user can publish an article with a non-latin title', async ({ editorPage, page }) => {
    await allure.severity(allure.Severity.NORMAL);
    const title = `Як козаки їхали в Тайланд${uniqueId()}`;
    const article = createArticleData({ title: title });
    const responsePromise = page.waitForResponse(
      (res) => res.url().endsWith('/api/articles') && res.request().method() === 'POST',
    );
    await editorPage.publish(article);
    const response = await responsePromise;
    const json = await response.json();

    await expect(page).toHaveURL(`/#/article/${json.article.slug}`);
    await expect(page.getByRole('heading', { name: article.title })).toBeVisible();
  });

  test('user can publish two different non-latin titles of the same length', async ({
    editorPage,
    page,
  }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: non-latin titles of the same length get the same slug');
    const id = uniqueId();
    const title1 = `Кіт${id}`;
    const article = createArticleData({ title: title1 });
    await editorPage.publish(article);
    await expect(page).toHaveURL(/\/#\/article\//);
    await expect(page.getByRole('heading', { name: article.title })).toBeVisible();

    await editorPage.open();
    const title2 = `Пес${id}`;
    const article2 = createArticleData({ title: title2 });
    await editorPage.publish(article2);

    await expect(page).toHaveURL(/\/#\/article\//);
    await expect(page.getByRole('heading', { name: article2.title })).toBeVisible();
  });
});

test.describe('Article editor (guest)', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.createArticle);
  });

  test('guest cannot open the editor', async ({ editorPage, page }) => {
    await allure.severity(allure.Severity.NORMAL);
    await editorPage.open();

    await expect(page).toHaveURL(/\/#\/$/);
    await expect(editorPage.titleInput).toBeHidden();
  });
});
