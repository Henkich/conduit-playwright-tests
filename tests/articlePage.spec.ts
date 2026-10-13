import { test, expect } from '../fixtures';
import { createArticle } from '../helpers/api';
import { AUTH_FILE } from '../helpers/auth';

test.describe('MyArticle', () => {
  test.use({ storageState: AUTH_FILE });

  test('Articles elements are visible after creating own article', async ({
    articlePage,
    myArticle,
  }) => {
    await articlePage.open(myArticle.slug);

    await expect(articlePage.title).toHaveText(myArticle.title);
    await expect(articlePage.body).toContainText(myArticle.body);
    await expect(articlePage.deleteArticleButton).toBeVisible();
    await expect(articlePage.editArticleButton).toBeVisible();
    await expect(articlePage.deleteArticleButton2nd).toBeVisible();
    await expect(articlePage.editArticleButton2nd).toBeVisible();
    await expect(articlePage.postCommentButton).toBeVisible();
    await expect(articlePage.commentInput).toBeVisible();
  });

  test('User can delete own article', async ({ articlePage, myArticle, page }) => {
    await articlePage.open(myArticle.slug);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Want to delete the article?');
      await dialog.accept();
    });
    await articlePage.deleteArticleButton.click();

    await expect(page).toHaveURL('/#/');
    await articlePage.open(myArticle.slug);
    await expect(page).toHaveURL('/#/not-found');
    await expect(page.getByRole('heading', { name: '404 Not Found' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Go to home page' })).toBeVisible();
  });

  test('User dismiss deleting own Article', async ({ page, myArticle, articlePage }) => {
    await articlePage.open(myArticle.slug);
    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Want to delete the article?');
      await dialog.dismiss();
    });
    await articlePage.deleteArticleButton.click();

    await expect(page).toHaveURL(`/#/article/${myArticle.slug}`);
    await expect(articlePage.title).toContainText(myArticle.title);
    await expect(articlePage.deleteArticleButton).toBeVisible();
    await expect(articlePage.editArticleButton).toBeVisible();
  });

  test('User can open edit page for own article', async ({
    page,
    articlePage,
    editorPage,
    myArticle,
  }) => {
    await articlePage.open(myArticle.slug);
    await articlePage.editArticleButton.click();

    await expect(page).toHaveURL(`/#/editor/${myArticle.slug}`);
    await expect(editorPage.titleInput).toHaveValue(myArticle.title);
    await expect(editorPage.bodyInput).toHaveValue(myArticle.body);
    await expect(editorPage.descriptionInput).toHaveValue(myArticle.description);
    await expect(editorPage.updateButton).toBeVisible();
  });
});

test.describe('Another Author Article', () => {
  test.use({ storageState: AUTH_FILE });

  test('Article of another Author', async ({ user, articlePage, request, page }) => {
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await expect(articlePage.title).toContainText(article.title);
    await expect(articlePage.body).toContainText(article.body);
    await expect(articlePage.favoriteButton).toBeVisible();
    await expect(articlePage.followButton).toBeVisible();
    await expect(articlePage.postCommentButton).toBeEnabled();
    await expect(articlePage.deleteArticleButton).toBeHidden();
    await expect(articlePage.editArticleButton).toBeHidden();
  });

  test('Follow Author of the article', async ({ user, articlePage, request, page }) => {
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await articlePage.followButton.click();
    await expect(articlePage.followButton).toContainText(`Unfollow ${user.username} ( 1 )`);
    await expect(articlePage.followButton2nd).toContainText(`Unfollow ${user.username} ( 1 )`);

    await page.reload();
    await expect(articlePage.followButton).toContainText(`Unfollow ${user.username} ( 1 )`);
  });

  test('Add to Favorite the Article', async ({ user, articlePage, request, page }) => {
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);
    await expect(page).toHaveURL(`/#/article/${article.slug}`);

    await articlePage.favoriteButton.click();
    await expect(articlePage.favoriteButton).toContainText(' 1 ');
    await expect(articlePage.favoriteButton).toHaveClass(/active/);
    await expect(articlePage.favoriteButton2nd).toHaveClass(/active/);
    await expect(articlePage.favoriteButton2nd).toContainText(' 1 ');

    await page.reload();
    await expect(articlePage.favoriteButton).toContainText(' 1 ');
    await expect(articlePage.favoriteButton).toHaveClass(/active/);
  });

  test('Unfollow Author of the article', async ({ user, articlePage, request, page }) => {
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await articlePage.followButton.click();
    await expect(articlePage.followButton).toContainText(`Unfollow ${user.username} ( 1 )`);
    await expect(articlePage.followButton2nd).toContainText(`Unfollow ${user.username} ( 1 )`);

    await articlePage.followButton.click();
    await expect(articlePage.followButton).toContainText(`Follow ${user.username} ( 0 )`);
    await expect(articlePage.followButton).not.toContainText('Unfollow');
    await expect(articlePage.followButton2nd).toContainText(`Follow ${user.username} ( 0 )`);
    await expect(articlePage.followButton2nd).not.toContainText('Unfollow');

    await page.reload();
    await expect(articlePage.followButton).toContainText(`Follow ${user.username} ( 0 )`);
    await expect(articlePage.followButton).not.toContainText('Unfollow');
  });

  test('Unfavorite the article', async ({ user, articlePage, request, page }) => {
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await articlePage.favoriteButton.click();
    await expect(articlePage.favoriteButton).toContainText(' 1 ');
    await expect(articlePage.favoriteButton).toHaveClass(/active/);

    await articlePage.favoriteButton.click();
    await expect(articlePage.favoriteButton).toContainText(' 0 ');
    await expect(articlePage.favoriteButton).not.toHaveClass(/active/);

    await page.reload();
    await expect(articlePage.favoriteButton).toContainText(' 0 ');
    await expect(articlePage.favoriteButton).not.toHaveClass(/active/);
  });
});
