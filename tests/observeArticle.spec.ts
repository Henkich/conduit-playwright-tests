import { test, expect } from '../fixtures';
import { AUTH_FILE, getAuthToken } from '../helpers/auth';
import { createArticle } from '../helpers/api';

test.describe('My Article', () => {
  test.use({ storageState: AUTH_FILE });

  test('Article page elements for own article by author', async ({
    articlePage,
    page,
    request,
  }) => {
    const article = await createArticle(request, getAuthToken());
    await articlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await expect(articlePage.heading).toHaveText(article.title);
    await expect(articlePage.deleteArticleMain).toBeVisible();
    await expect(articlePage.editArticleMain).toBeVisible();
    await expect(articlePage.bodyArticle).toHaveText(article.body);
    await expect(articlePage.postCommentButton).toBeVisible();
  });

  test('User can delete article', async ({ articlePage, page, request }) => {
    const article = await createArticle(request, getAuthToken());
    await articlePage.open(article.slug);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Want to delete the article?');
      await dialog.accept();
    });
    await articlePage.deleteArticleMain.click();

    await expect(page).toHaveURL(/\/#\/$/);

    await articlePage.open(article.slug);
    await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible();
  });

  test('User refuse to delete article', async ({ articlePage, page, request }) => {
    const article = await createArticle(request, getAuthToken());
    await articlePage.open(article.slug);
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Want to delete the article?');
      await dialog.dismiss();
    });
    await articlePage.deleteArticleMain.click();

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await expect(articlePage.heading).toHaveText(article.title);
    await expect(articlePage.deleteArticleMain).toBeVisible();
    await expect(articlePage.editArticleMain).toBeVisible();
  });

  test('User can open edit article page', async ({ articlePage, page, request, editorPage }) => {
    const article = await createArticle(request, getAuthToken());
    await articlePage.open(article.slug);

    await articlePage.editArticleMain.click();
    await expect(page).toHaveURL(`/#/editor/${article.slug}`);
    await expect(editorPage.titleInput).toHaveValue(article.title);
    await expect(editorPage.updateButton).toBeVisible();
  });

  test('User can delete article via bottom button', async ({ articlePage, page, request }) => {
    const article = await createArticle(request, getAuthToken());
    await articlePage.open(article.slug);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Want to delete the article?');
      await dialog.accept();
    });
    await articlePage.deleteArticle2nd.click();

    await expect(page).toHaveURL(/\/#\/$/);

    await articlePage.open(article.slug);
    await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible();
  });

  test('User can open edit article page via bottom button', async ({
    articlePage,
    page,
    request,
    editorPage,
  }) => {
    const article = await createArticle(request, getAuthToken());
    await articlePage.open(article.slug);

    await articlePage.editArticle2nd.click();
    await expect(page).toHaveURL(`/#/editor/${article.slug}`);
    await expect(editorPage.titleInput).toHaveValue(article.title);
    await expect(editorPage.updateButton).toBeVisible();
  });
});
