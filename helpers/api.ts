import { expect, type APIRequestContext } from '@playwright/test';
import {
  generateEmail,
  generateArticleBody,
  generateArticleDescription,
  generateArticleName,
  generateArticleTags,
  generateUsername,
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
  await expect(response, 'article should be created via API').toBeOK();
  const json = await response.json();
  return { ...article, slug: json.article.slug };
}

export function createUserData(overrides: Partial<Omit<User, 'token'>> = {}) {
  const user = {
    username: generateUsername(),
    email: generateEmail(),
    password: 'Passw0rd!',
    ...overrides,
  };
  return user;
}

export async function createUser(
  request: APIRequestContext,
  overrides: Partial<Omit<User, 'token'>> = {},
): Promise<User> {
  const user = createUserData(overrides);
  const response = await request.post('/api/users', { data: { user } });
  await expect(response, 'user should be created via API').toBeOK();
  const json = await response.json();
  return { ...user, token: json.user.token };
}
