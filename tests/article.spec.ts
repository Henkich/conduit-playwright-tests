import { test, expect } from '../fixtures';
import {
  generateArticleBody,
  generateArticleDescription,
  generateArticleName,
  generateArticleTags,
} from '../helpers/data';
import { AUTH_FILE } from '../helpers/auth';

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
});
