import { type Page, type Locator } from '@playwright/test';

export class RegisterPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly usernameInput: Locator;
  readonly signupButton: Locator;
  readonly errorMessage: Locator;
  readonly signInLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Sign up' });
    this.emailInput = page.getByPlaceholder('Email');
    this.passwordInput = page.getByPlaceholder('Password');
    this.usernameInput = page.getByPlaceholder('Your Name');
    this.signupButton = page.getByRole('button', { name: 'Sign up' });
    this.errorMessage = page.locator('.error-messages');
    this.signInLink = page.getByRole('link', { name: 'Sign in to your account' });
  }

  async open() {
    await this.page.goto('/#/register');
  }

  async register(email: string, password: string, username: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.usernameInput.fill(username);
    await this.signupButton.click();
  }
}
