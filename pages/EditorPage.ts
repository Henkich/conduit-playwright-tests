import { type Page, type Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class EditorPage extends BasePage {
  readonly titleInput: Locator;
  readonly descriptionInput: Locator;
  readonly bodyInput: Locator;
  readonly tagsInput: Locator;
  readonly publishButton: Locator;
  readonly errorMessage: Locator;
  readonly updateButton: Locator;

  constructor(page: Page) {
    super(page);
    this.titleInput = page.getByPlaceholder('Article Title');
    this.descriptionInput = page.getByPlaceholder("What's this article about?");
    this.bodyInput = page.getByPlaceholder('Write your article (in markdown)');
    this.tagsInput = page.getByPlaceholder('Enter tags');
    this.publishButton = page.getByRole('button', { name: 'Publish Article' });
    this.errorMessage = page.locator('.error-messages');
    this.updateButton = page.getByRole('button', { name: 'Update Article' });
  }

  async open() {
    await this.openBase('/#/editor');
  }

  async publish(title: string, description: string, body: string, tags?: string) {
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.bodyInput.fill(body);
    if (tags) {
      await this.tagsInput.fill(tags);
    }
    await this.publishButton.click();
  }
}
