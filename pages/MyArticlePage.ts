import { type Page, type Locator } from '@playwright/test';

export class MyArticlePage {
  readonly page: Page;
  readonly heading: Locator;
  readonly deleteArticleMain: Locator;
  readonly editArticleMain: Locator;
  readonly bodyArticle: Locator;
  readonly articleMeta: Locator;
  readonly deleteArticle2nd: Locator;
  readonly editArticle2nd: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly commentSection: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1 });
    this.deleteArticleMain = page.getByRole('button', { name: 'Delete Article' }).first();
    this.editArticleMain = page.getByRole('button', { name: 'Edit Article' }).first();
    this.bodyArticle = page.locator('.article-content');
    this.articleMeta = page.locator('.article-meta');
    this.deleteArticle2nd = this.articleMeta.getByRole('button', { name: 'Delete Article' });
    this.editArticle2nd = this.articleMeta.getByRole('button', { name: 'Edit Article' });
    this.commentInput = page.getByRole('textbox', { name: 'Write a comment...' });
    this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
    this.commentSection = page.locator('.card');
  }

  async open(slug: string) {
    await this.page.goto(`/#/article/${slug}`);
  }

  async deleteArticle1() {
    await this.deleteArticleMain.click();
  }
  async deleteArticle2() {
    await this.deleteArticle2nd.click();
  }
  async editArticle1() {
    await this.editArticleMain.click();
  }
  async editArticle2() {
    await this.editArticle2nd.click();
  }
  async postComment() {
    await this.commentInput.fill('This is a comment');
    await this.postCommentButton.click();
  }
}
