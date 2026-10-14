import { expect, type APIRequestContext } from '@playwright/test';
import {
  uniqueId,
  generateEmail,
  generateArticleBody,
  generateArticleDescription,
  generateArticleName,
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
};

export async function createArticle(request: APIRequestContext, token: string): Promise<Article> {
  const article = {
    title: generateArticleName(),
    body: generateArticleBody(),
    description: generateArticleDescription(),
  };
  const response = await request.post('/api/articles', {
    headers: { Authorization: `Token ${token}` },
    data: { article: { ...article, tagList: [] } },
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
