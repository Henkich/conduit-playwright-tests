import { type Page, type Locator } from '@playwright/test';

export class Navbar {
  readonly page: Page;
  readonly root: Locator;
  readonly loginLink: Locator;
  readonly signUpLink: Locator;
  readonly newArticleLink: Locator;
  readonly userMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.root = page.getByRole('navigation');
    this.loginLink = this.root.getByRole('link', { name: 'Login' });
    this.signUpLink = this.root.getByRole('link', { name: 'Sign up' });
    this.newArticleLink = this.root.getByRole('link', { name: 'New Article' });
    this.userMenu = this.root.locator('.dropdown-toggle');
    this.logoutLink = this.root.getByRole('link', { name: 'Logout' });
  }

  async logout() {
    await this.userMenu.click();
    await this.logoutLink.click();
  }
}
