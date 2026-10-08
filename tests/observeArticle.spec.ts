import { test, expect } from '../fixtures';
import { AUTH_FILE, getAuthToken } from '../helpers/auth';
import { createArticle } from '../helpers/api';

test.describe('My Article', () => {
  test.use({ storageState: AUTH_FILE });

  test('Article page elements for own article by author', async ({
    myArticlePage,
    page,
    request,
  }) => {
    const article = await createArticle(request, getAuthToken());
    await myArticlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await expect(myArticlePage.heading).toHaveText(article.title);
    await expect(myArticlePage.deleteArticleMain).toBeVisible();
    await expect(myArticlePage.editArticleMain).toBeVisible();
    await expect(myArticlePage.bodyArticle).toHaveText(article.body);
    await expect(myArticlePage.postCommentButton).toBeVisible();
  });

  test('User can delete article', async ({ myArticlePage, page, request }) => {
    const article = await createArticle(request, getAuthToken());
    await myArticlePage.open(article.slug);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Want to delete the article?');
      await dialog.accept();
    });
    await myArticlePage.deleteArticleMain.click();

    await expect(page).toHaveURL(/\/#\/$/);

    await myArticlePage.open(article.slug);
    await expect(page.getByRole('heading', { name: 'Not Found' })).toBeVisible();
  });

  test('User refuse to delete article', async ({ myArticlePage, page, request }) => {
    const article = await createArticle(request, getAuthToken());
    await myArticlePage.open(article.slug);
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Want to delete the article?');
      await dialog.dismiss();
    });
    await myArticlePage.deleteArticleMain.click();

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await expect(myArticlePage.heading).toHaveText(article.title);
    await expect(myArticlePage.deleteArticleMain).toBeVisible();
    await expect(myArticlePage.editArticleMain).toBeVisible();
  });

  test('User can open edit article page', async ({ myArticlePage, page, request, editorPage }) => {
    const article = await createArticle(request, getAuthToken());
    await myArticlePage.open(article.slug);

    await myArticlePage.editArticleMain.click();
    await expect(page).toHaveURL(`/#/editor/${article.slug}`);
    await expect(editorPage.titleInput).toHaveValue(article.title);
    await expect(editorPage.updateButton).toBeVisible();
  });
});
