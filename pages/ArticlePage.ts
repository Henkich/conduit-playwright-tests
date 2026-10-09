import { type Page, type Locator } from '@playwright/test';

export class ArticlePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly deleteArticleMain: Locator;
  readonly editArticleMain: Locator;
  readonly bodyArticle: Locator;
  readonly articleActions: Locator;
  readonly deleteArticle2nd: Locator;
  readonly editArticle2nd: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly commentSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    const banner = page.locator('.banner');
    this.deleteArticleMain = banner.getByRole('button', { name: 'Delete Article' });
    this.editArticleMain = banner.getByRole('button', { name: 'Edit Article' });
    this.bodyArticle = page.locator('.article-content');
    this.articleActions = page.locator('.article-actions');
    this.deleteArticle2nd = this.articleActions.getByRole('button', { name: 'Delete Article' });
    this.editArticle2nd = this.articleActions.getByRole('button', { name: 'Edit Article' });
    this.commentInput = page.getByRole('textbox', { name: 'Write a comment...' });
    this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
    this.commentSection = page.locator('.card');
  }

  async open(slug: string) {
    await this.page.goto(`/#/article/${slug}`);
  }

  async postComment() {
    await this.commentInput.fill('This is a comment');
    await this.postCommentButton.click();
  }
}
