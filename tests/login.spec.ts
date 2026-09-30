import { test, expect } from '@playwright/test';
import { createUser, generateEmail, type User } from '../helpers/api';
import { LoginPage } from '../pages/LoginPage';
import { Navbar } from '../pages/Navbar';



test.describe('Login', () => {
  let user: User;
  let loginPage: LoginPage;
  let navbar: Navbar;

  // Each test gets its own fresh user, created via API (fast, no UI clicks)
  test.beforeEach(async ({ page, request }) => {
    user = await createUser(request);
    loginPage = new LoginPage(page);
    navbar = new Navbar(page);
    await loginPage.open();
  });

  test('user can log in with valid credentials', async ({ page }) => {

    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(navbar.newArticleLink).toBeVisible();
    await expect(navbar.userMenu).toHaveText(user.username);
  });

  test('shows error for wrong password', async ({ page }) => {

    await loginPage.login(user.email, 'WrongPass1');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Wrong email/password combination');
    await expect(page).toHaveURL(/\/#\/login$/);
  });

  test('shows error for unknown email', async ({ page }) => {

    test.fail(true, 'BUG: different error for unknown email reveals registered emails (user enumeration)');


    await loginPage.login(generateEmail(), user.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Wrong email/password combination');
    await expect(page).toHaveURL(/\/#\/login$/);
  });

  test('empty password cannot be sent', async ({ page }) => {
    await loginPage.fillEmail(user.email);
    await loginPage.submitButton.click();

const isMissing = await loginPage.passwordInput.evaluate(
      (input: HTMLInputElement) => input.validity.valueMissing,
    );
    expect(isMissing).toBe(true);
    await expect(page).toHaveURL(/\/#\/login$/);
  });
}); 