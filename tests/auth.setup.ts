// auth setup for tests that require an authenticated user
import { test as setup, expect } from '../fixtures';
import { AUTH_FILE } from '../helpers/auth';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';

setup('authenticate', async ({ page, loginPage, navbar, user }) => {
  await allure.epic(EPIC.auth);
  await allure.feature(FEATURE.login);
  await loginPage.open();
  await loginPage.login(user.email, user.password);
  await expect(navbar.userMenu).toHaveText(user.username);

  await page.context().storageState({ path: AUTH_FILE });
});
