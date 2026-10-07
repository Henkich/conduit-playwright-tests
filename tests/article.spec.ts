import { test, expect } from '../fixtures';
import {
  generateArticleBody,
  generateArticleDescription,
  generateArticleName,
  generateArticleTags,
  uniqueId,
} from '../helpers/data';
import { AUTH_FILE, GUEST } from '../helpers/auth';

test.describe('Article', () => {
  test.use({ storageState: AUTH_FILE });

  test.beforeEach(async ({ editorPage }) => {
    await editorPage.open();
  });

  test('user open editor page and see all fields', async ({ editorPage }) => {
    await expect(editorPage.titleInput).toBeVisible();
    await expect(editorPage.descriptionInput).toBeVisible();
    await expect(editorPage.bodyInput).toBeVisible();
    await expect(editorPage.tagsInput).toBeVisible();
    await expect(editorPage.publishButton).toBeVisible();
  });

  test('user can publish article with valid data', async ({ editorPage, page }) => {
    const title = generateArticleName();
    await editorPage.publish(
      title,
      generateArticleDescription(),
      generateArticleBody(),
      generateArticleTags(),
    );
    await expect(page).toHaveURL(`/#/article/${title.toLowerCase()}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });

  test('user can publish article without tags', async ({ editorPage, page }) => {
    const title = generateArticleName();
    await editorPage.publish(title, generateArticleDescription(), generateArticleBody());
    await expect(page).toHaveURL(`/#/article/${title.toLowerCase()}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });

  test('user cannot publish article with empty title', async ({ editorPage, page }) => {
    await editorPage.publish('', generateArticleDescription(), generateArticleBody());

    const isMissing = await editorPage.titleInput.evaluate(
      (input: HTMLInputElement) => input.validity.valueMissing,
    );
    expect(isMissing).toBe(true);
    await expect(page).toHaveURL(/\/#\/editor$/);
  });

  test('2 articles with same title cannot be published', async ({ editorPage, page }) => {
    const title = generateArticleName();
    await editorPage.publish(title, generateArticleDescription(), generateArticleBody());
    await expect(page).toHaveURL(`/#/article/${title.toLowerCase()}`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();

    await editorPage.open();
    await editorPage.publish(title, generateArticleDescription(), generateArticleBody());

    await expect(editorPage.errorMessage).toBeVisible();
    await expect(editorPage.errorMessage).toContainText(/Title already exists/i);
    await expect(page).toHaveURL(/\/#\/editor$/);
  });

  test('article with non-english title can be published', async ({ editorPage, page }) => {
    const title = `Як козаки їхали в Тайланд${uniqueId()}`;
    await editorPage.publish(title, generateArticleDescription(), generateArticleBody());
    await expect(page).toHaveURL(/\/#\/article\//);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
  });

  test('articles with non-english different titles but same characters can be published', async ({
    editorPage,
    page,
  }) => {
    test.fail(true, 'Bug: different non-english characters are count as same characters');
    const id = uniqueId();
    const title1 = `Кіт${id}`;
    await editorPage.publish(title1, generateArticleDescription(), generateArticleBody());
    await expect(page).toHaveURL(/\/#\/article\//);
    await expect(page.getByRole('heading', { name: title1 })).toBeVisible();

    await editorPage.open();
    const title2 = `Пес${id}`;
    await editorPage.publish(title2, generateArticleDescription(), generateArticleBody());
    await expect(page).toHaveURL(/\/#\/article\//);
    await expect(page.getByRole('heading', { name: title2 })).toBeVisible();
  });
});

test.describe('Article (guest)', () => {
  test.use({ storageState: GUEST });

  test('guest cannot open editor page', async ({ editorPage, page }) => {
    await editorPage.open();

    await expect(page).toHaveURL(/\/#\/$/);
    await expect(editorPage.titleInput).toBeHidden();
  });
});
