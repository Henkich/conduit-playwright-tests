import { expect, type APIRequestContext } from '@playwright/test';
import {
  uniqueId,
  generateEmail,
  generateArticleBody,
  generateArticleDescription,
  generateArticleName,
  generateArticleTags,
} from './data';

export type User = {
  username: string;
  email: string;
  password: string;
  token: string;
};
export type Article = {
  title: string;
  body: string;
  description: string;
  slug: string;
  tagList: string[];
};

export function createArticleData(overrides: Partial<Omit<Article, 'slug'>> = {}) {
  const article = {
    title: generateArticleName(),
    body: generateArticleBody(),
    description: generateArticleDescription(),
    tagList: generateArticleTags(),
    ...overrides,
  };
  return article;
}

export async function createArticle(
  request: APIRequestContext,
  token: string,
  overrides: Partial<Omit<Article, 'slug'>> = {},
): Promise<Article> {
  const article = createArticleData(overrides);
  const response = await request.post('/api/articles', {
    headers: { Authorization: `Token ${token}` },
    data: { article },
  });
  expect(response.ok(), 'Article should be created').toBeTruthy();
  const json = await response.json();
  return { ...article, slug: json.article.slug };
}

export async function createUser(
  request: APIRequestContext,
  password: string = 'Passw0rd!',
): Promise<User> {
  const username = `user${uniqueId()}`;
  const user = {
    username,
    email: generateEmail(),
    password,
  };
  const response = await request.post('/api/users', { data: { user } });
  expect(response.ok(), 'user should be created via API').toBeTruthy();
  const json = await response.json();
  return { ...user, token: json.user.token };
}
