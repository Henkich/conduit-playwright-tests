import { test, expect } from '../fixtures';
import { AUTH_FILE } from '../helpers/auth';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';

test.describe('Session', () => {
  test.use({ storageState: AUTH_FILE });

  test.beforeEach(async () => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.session);
  });

  test('user can log out', async ({ page, navbar }) => {
    await allure.severity(allure.Severity.CRITICAL);

    await test.step('Open the home page', async () => {
      await page.goto('/#/');
      await expect(navbar.newArticleLink).toBeVisible();
    });

    await test.step('Log out', async () => {
      await navbar.logout();
      await expect(page).toHaveURL(/\/#\/$/);
      await expect(navbar.loginLink).toBeVisible();
      await expect(navbar.signUpLink).toBeVisible();
      await expect(navbar.newArticleLink).toBeHidden();
    });

    await test.step('Reload the page', async () => {
      await page.reload();
      await expect(page).toHaveURL(/\/#\/$/);
      await expect(navbar.loginLink).toBeVisible();
      await expect(navbar.signUpLink).toBeVisible();
      await expect(navbar.newArticleLink).toBeHidden();
    });
  });
});
