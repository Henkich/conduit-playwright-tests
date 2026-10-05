import { test, expect } from '../fixtures';
import { AUTH_FILE } from '../helpers/auth';

test.describe('Session', () => {
  test.use({ storageState: AUTH_FILE });

  test('user can log out', async ({ page, navbar }) => {
    await test.step('Opening main page', async () => {
      await page.goto('/#/');
      await expect(navbar.newArticleLink).toBeVisible();
    });
    await test.step('logout', async () => {
      await navbar.logout();
      await expect(page).toHaveURL(/\/#\/$/);
      await expect(navbar.loginLink).toBeVisible();
      await expect(navbar.signUpLink).toBeVisible();
      await expect(navbar.newArticleLink).not.toBeVisible();
    });
    await test.step('reload', async () => {
      await page.reload();
      await expect(page).toHaveURL(/\/#\/$/);
      await expect(navbar.loginLink).toBeVisible();
      await expect(navbar.signUpLink).toBeVisible();
      await expect(navbar.newArticleLink).not.toBeVisible();
    });
  });
});
