import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { Navbar } from '../pages/Navbar';
import { createArticle, createUser, type User, type Article } from '../helpers/api';
import { EditorPage } from '../pages/EditorPage';
import { ArticlePage } from '../pages/ArticlePage';
import { getAuthToken } from '../helpers/auth';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  navbar: Navbar;
  user: User;
  editorPage: EditorPage;
  articlePage: ArticlePage;
  myArticle: Article;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  navbar: async ({ page }, use) => {
    await use(new Navbar(page));
  },
  editorPage: async ({ page }, use) => {
    await use(new EditorPage(page));
  },
  articlePage: async ({ page }, use) => {
    await use(new ArticlePage(page));
  },

  // Each test gets its own fresh user, created via API (fast, no UI clicks) when user is used
  user: async ({ request }, use) => {
    const user = await createUser(request);
    await use(user);
  },
  myArticle: async ({ request }, use) => {
    const token = getAuthToken();
    const article = await createArticle(request, token);
    await use(article);

    const response = await request.delete(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${token}` },
    });

    expect([200, 204, 404]).toContain(response.status());
  },
});

export { expect } from '@playwright/test';
