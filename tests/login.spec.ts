// Login tests
import { test, expect } from '../fixtures';
import { generateEmail } from '../helpers/api';
import { GUEST } from '../helpers/auth';

test.describe('Login', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('user can log in with valid credentials', async ({ page, navbar, user, loginPage }) => {
    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(navbar.newArticleLink).toBeVisible();
    await expect(navbar.userMenu).toHaveText(user.username);
  });

  test('shows error for wrong password', async ({ page, loginPage, user }) => {
    await loginPage.login(user.email, 'WrongPass1');

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Wrong email/password combination');
    await expect(page).toHaveURL(/\/#\/login$/);
  });

  test('shows error for unknown email', async ({ page, loginPage, user }) => {
    test.fail(
      true,
      'BUG: different error for unknown email reveals registered emails (user enumeration)',
    );

    await loginPage.login(generateEmail(), user.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Wrong email/password combination');
    await expect(page).toHaveURL(/\/#\/login$/);
  });

  test('empty password cannot be sent', async ({ page, loginPage }) => {
    await loginPage.fillEmail(generateEmail());
    await loginPage.submitButton.click();

    const isMissing = await loginPage.passwordInput.evaluate(
      (input: HTMLInputElement) => input.validity.valueMissing,
    );
    expect(isMissing).toBe(true);
    await expect(page).toHaveURL(/\/#\/login$/);
  });

  test('keeps user logged in after page reload', async ({ page, user, loginPage, navbar }) => {
    await loginPage.login(user.email, user.password);
    await expect(page).toHaveURL(/\/#\/$/);

    await page.reload();
    await expect(page).toHaveURL(/\/#\/$/);
    await expect(navbar.newArticleLink).toBeVisible();
    await expect(navbar.userMenu).toHaveText(user.username);
  });
});
