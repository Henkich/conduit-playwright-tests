import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly noArticlesMessage: Locator;
  readonly noTagsMessages: Locator;
  readonly globalFeedTab: Locator;
  readonly navPagination: Locator;
  readonly loadingArticles: Locator;

  constructor(page: Page) {
    super(page);
    this.noArticlesMessage = page.getByText('Articles not available.');
    this.noTagsMessages = page.getByText('Tags list not available');
    this.globalFeedTab = page.getByRole('button', { name: 'Global Feed' });
    this.navPagination = page.getByRole('navigation', { name: 'Pagination' });
    this.loadingArticles = page.getByText('Loading articles list...');
  }

  async open() {
    await this.openBase('/#/');
  }

  pageButton(pageNumber: number) {
    return this.navPagination.getByRole('button', { name: `Page ${pageNumber}`, exact: true });
  }
}
