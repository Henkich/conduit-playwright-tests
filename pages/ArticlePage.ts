import { type Page, type Locator } from '@playwright/test';

export class ArticlePage {
  readonly page: Page;
  readonly title: Locator;
  readonly body: Locator;
  readonly tags: Locator;
  readonly deleteArticleButton: Locator;
  readonly editArticleButton: Locator;
  readonly commentInput: Locator;
  readonly postCommentButton: Locator;
  readonly deleteArticleButton2nd: Locator;
  readonly editArticleButton2nd: Locator;
  readonly followButton: Locator;
  readonly favoriteButton: Locator;
  readonly followButton2nd: Locator;
  readonly favoriteButton2nd: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page.getByRole('heading', { level: 1 });
    this.body = page.locator('.article-content');
    const banner = page.locator('.banner');
    this.deleteArticleButton = banner.getByRole('button', { name: 'Delete Article' });
    this.editArticleButton = banner.getByRole('button', { name: 'Edit Article' });
    this.commentInput = page.getByPlaceholder('Write a comment...');
    this.postCommentButton = page.getByRole('button', { name: 'Post Comment' });
    const tags = page.locator('.tag-list');
    this.tags = tags.getByRole('listitem');
    const articleActions = page.locator('.article-actions');
    this.deleteArticleButton2nd = articleActions.getByRole('button', { name: 'Delete Article' });
    this.editArticleButton2nd = articleActions.getByRole('button', { name: 'Edit Article' });
    this.followButton = banner.getByRole('button', { name: /follow/i });
    this.favoriteButton = banner.getByRole('button', { name: /favorite/i });
    this.followButton2nd = articleActions.getByRole('button', { name: /follow/i });
    this.favoriteButton2nd = articleActions.getByRole('button', { name: /favorite/i });
  }
  async open(slug: string) {
    await this.page.goto(`/#/article/${slug}`);
  }
}
