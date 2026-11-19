import { test, expect } from '../fixtures';
import { GUEST } from '../helpers/auth';
import { createUserData } from '../helpers/api';

test.describe('Register', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async ({ registerPage }) => {
    await registerPage.open();
  });

  test('user can register with valid credentials', async ({ page, registerPage, navbar }) => {
    const user = createUserData();
    await registerPage.register(user.email, user.password, user.username);
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(navbar.newArticleLink).toBeVisible();
    await expect(navbar.userMenu).toHaveText(user.username);
  });

  test('shows error for existing email', async ({ page, user, registerPage }) => {
    await registerPage.register(user.email, user.password, user.username);

    await expect(page).toHaveURL(/\/#\/register$/);
    await expect(registerPage.errorMessage).toBeVisible();
    await expect(registerPage.errorMessage).toContainText(/email already exists/i);
  });
});
