import { type Page } from '@playwright/test';
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  protected async openBase(path: string) {
    await this.page.goto(path);
  }
}
