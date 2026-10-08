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
};

export type Article = {
  title: string;
  description: string;
  body: string;
  slug: string;
};
export async function createArticle(request: APIRequestContext, token: string): Promise<Article> {
  const article = {
    title: generateArticleName(),
    description: generateArticleDescription(),
    body: generateArticleBody(),
  };
  const response = await request.post('/api/articles', {
    data: { article: { ...article, tagList: [] } },
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  expect(response.ok(), 'article should be created via API').toBeTruthy();
  const json = await response.json();
  return { ...article, slug: json.article.slug };
}

export async function createUser(
  request: APIRequestContext,
  password: string = 'Passw0rd!',
): Promise<User> {
  const username = `user${uniqueId()}`;
  const user: User = {
    username,
    email: generateEmail(),
    password,
  };
  const response = await request.post('/api/users', { data: { user } });
  expect(response.ok(), 'user should be created via API').toBeTruthy();
  return user;
}
