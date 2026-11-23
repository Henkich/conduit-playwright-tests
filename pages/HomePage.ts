import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly noArticlesMessage: Locator;
  readonly noTagsMessage: Locator;
  readonly globalFeedTab: Locator;
  readonly navPagination: Locator;
  readonly loadingArticles: Locator;
  readonly authorUsername: Locator;
  readonly articleTitle: Locator;
  readonly articleDescription: Locator;
  readonly articleTags: Locator;
  readonly articleDate: Locator;
  readonly articleLikes: Locator;

  constructor(page: Page) {
    super(page);
    this.noArticlesMessage = page.getByText('Articles not available.');
    this.noTagsMessage = page.getByText('Tags list not available');
    this.globalFeedTab = page.getByRole('button', { name: 'Global Feed' });
    this.navPagination = page.getByRole('navigation', { name: 'Pagination' });
    this.loadingArticles = page.getByText('Loading articles list...');
    const articlePreview = page.locator('.article-preview');
    this.authorUsername = articlePreview.locator('.author');
    this.articleTitle = articlePreview.getByRole('heading');
    this.articleDescription = articlePreview.getByRole('paragraph');
    this.articleTags = articlePreview.getByRole('listitem');
    this.articleDate = articlePreview.locator('.date');
    this.articleLikes = articlePreview.getByRole('button');
  }

  async open() {
    await this.openBase('/#/');
  }

  pageButton(pageNumber: number) {
    return this.navPagination.getByRole('button', { name: `Page ${pageNumber}`, exact: true });
  }

  popularTag(tag: string) {
    const sidebar = this.page.locator('.sidebar');
    return sidebar.getByRole('button', { name: tag, exact: true });
  }

  feedTag(tag: string) {
    const container = this.page.locator('.feed-toggle');
    return container.getByRole('button', { name: tag });
  }
}
