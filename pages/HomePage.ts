import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly noArticlesMessage: Locator;
  readonly noTagsMessages: Locator;
  readonly globalFeedTab: Locator;

  constructor(page: Page) {
    super(page);
    this.noArticlesMessage = page.getByText('Articles not available.');
    this.noTagsMessages = page.getByText('Tags list not available');
    this.globalFeedTab = page.getByRole('button', { name: 'Global Feed' });
  }

  async open() {
    await this.openBase('/#/');
  }
}
