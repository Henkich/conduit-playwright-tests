import { test, expect } from '../fixtures';
import { GUEST } from '../helpers/auth';
import { createUserData } from '../helpers/api';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';

test.describe('Register', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async ({ registerPage }) => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.registration);
    await registerPage.open();
  });

  test('user can register with valid credentials', async ({ page, registerPage, navbar }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const user = createUserData();
    await registerPage.register(user.email, user.password, user.username);
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(navbar.newArticleLink).toBeVisible();
    await expect(navbar.userMenu).toHaveText(user.username);
  });

  test('shows error for existing email', async ({ page, user, registerPage }) => {
    await allure.severity(allure.Severity.NORMAL);
    await registerPage.register(user.email, user.password, user.username);

    await expect(page).toHaveURL(/\/#\/register$/);
    await expect(registerPage.errorMessage).toBeVisible();
    await expect(registerPage.errorMessage).toContainText(/email already exists/i);
  });
});
