import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { Navbar } from '../pages/Navbar';
import { createUser, type User } from '../helpers/api';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  navbar: Navbar;
  user: User;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new Navbar(page));
  },
  // Each test gets its own fresh user, created via API (fast, no UI clicks) when user is used
  user: async ({ request }, use) => {
    const user = await createUser(request);
    await use(user);
  },
});

export { expect } from '@playwright/test';
