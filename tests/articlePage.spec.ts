import { test, expect } from '../fixtures';
import { createArticle } from '../helpers/api';
import { AUTH_FILE, GUEST } from '../helpers/auth';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';

test.describe('Own article', () => {
  test.use({ storageState: AUTH_FILE });

  test('shows all article tags', async ({ articlePage, myArticle }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.viewArticle);
    await allure.severity(allure.Severity.NORMAL);
    await articlePage.open(myArticle.slug);

    await expect(articlePage.tags).toHaveCount(myArticle.tagList.length);

    for (const tag of myArticle.tagList) {
      await expect(articlePage.tags.getByText(tag, { exact: true })).toBeVisible();
    }
  });

  test('author sees the article with edit and delete buttons', async ({
    articlePage,
    myArticle,
  }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.viewArticle);
    await allure.severity(allure.Severity.NORMAL);
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

  test('author can delete the article', async ({ articlePage, myArticle, page }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.deleteArticle);
    await allure.severity(allure.Severity.CRITICAL);
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

  test('article stays when the author cancels deletion', async ({
    page,
    myArticle,
    articlePage,
  }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.deleteArticle);
    await allure.severity(allure.Severity.NORMAL);
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

  test('author can open the prefilled editor', async ({
    page,
    articlePage,
    editorPage,
    myArticle,
  }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.editArticle);
    await allure.severity(allure.Severity.NORMAL);
    await articlePage.open(myArticle.slug);
    await articlePage.editArticleButton.click();

    await expect(page).toHaveURL(`/#/editor/${myArticle.slug}`);
    await expect(editorPage.titleInput).toHaveValue(myArticle.title);
    await expect(editorPage.bodyInput).toHaveValue(myArticle.body);
    await expect(editorPage.descriptionInput).toHaveValue(myArticle.description);
    await expect(editorPage.updateButton).toBeVisible();
  });
});

test.describe("Another author's article", () => {
  test.use({ storageState: AUTH_FILE });

  test('user sees follow and favorite instead of edit and delete', async ({
    user,
    articlePage,
    request,
    page,
  }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.viewArticle);
    await allure.severity(allure.Severity.NORMAL);
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

  test('user can follow the author', async ({ user, articlePage, request, page }) => {
    await allure.epic(EPIC.profiles);
    await allure.feature(FEATURE.follow);
    await allure.severity(allure.Severity.CRITICAL);
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);
    await articlePage.followButton.click();
    await expect(articlePage.followButton).toContainText(`Unfollow ${user.username} ( 1 )`);
    await expect(articlePage.followButton2nd).toContainText(`Unfollow ${user.username} ( 1 )`);

    await page.reload();
    await expect(articlePage.followButton).toContainText(`Unfollow ${user.username} ( 1 )`);
  });

  test('user can favorite the article', async ({ user, articlePage, request, page }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.favorites);
    await allure.severity(allure.Severity.CRITICAL);
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

  test('user can unfollow the author', async ({ user, articlePage, request, page }) => {
    await allure.epic(EPIC.profiles);
    await allure.feature(FEATURE.follow);
    await allure.severity(allure.Severity.NORMAL);
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

  test('user can unfavorite the article', async ({ user, articlePage, request, page }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.favorites);
    await allure.severity(allure.Severity.NORMAL);
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

test.describe('Article (guest)', () => {
  test.use({ storageState: GUEST });

  test('guest sees the article without edit, delete and comment controls', async ({
    page,
    user,
    articlePage,
    request,
  }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.viewArticle);
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);

    await expect(page).toHaveURL(`/#/article/${article.slug}`);

    await expect(articlePage.title).toContainText(`${article.title}`);
    await expect(articlePage.body).toContainText(`${article.body}`);
    await expect(articlePage.postCommentButton).toBeHidden();
    await expect(articlePage.commentInput).toBeHidden();
    await expect(articlePage.editArticleButton).toBeHidden();
    await expect(articlePage.deleteArticleButton).toBeHidden();
    await expect(articlePage.favoriteButton).toContainText(' 0 ');
    await expect(articlePage.favoriteButton).not.toHaveClass(/active/);
    await expect(articlePage.followButton).toContainText('Followers ( 0 )');
    await expect(articlePage.guestText).toBeVisible();
  });

  test('guest cannot follow the author', async ({ page, user, articlePage, request }) => {
    await allure.epic(EPIC.profiles);
    await allure.feature(FEATURE.follow);
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);
    await expect(articlePage.title).toContainText(article.title);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('You need to login first');
      await dialog.accept();
    });
    await articlePage.followButton.click();

    await expect(articlePage.followButton).toContainText(' Followers ( 0 ) ');
  });

  test('guest cannot favorite the article', async ({ page, user, articlePage, request }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.favorites);
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);
    await articlePage.open(article.slug);
    await expect(articlePage.title).toContainText(article.title);

    page.once('dialog', async (dialog) => {
      expect(dialog.message()).toBe('You need to login first');
      await dialog.accept();
    });
    await articlePage.favoriteButton.click();

    await expect(articlePage.favoriteButton).toContainText('( 0 )');
  });
});
