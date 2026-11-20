import { test, expect } from '../../fixtures';
import { createArticle, createUser } from '../../helpers/api';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../../helpers/allure';

test.describe('GET /api/articles/feed', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.feed);
  });

  test('Follow Author, Article in your feed', async ({ user, request }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const article = await createArticle(request, user.token);
    const followerUser = await createUser(request);
    const response = await request.post(`/api/profiles/${user.username}/follow`, {
      headers: { Authorization: `Token ${followerUser.token}` },
    });
    expect(response.status()).toBe(200);

    const getArticles = await request.get(`/api/articles/feed`, {
      headers: { Authorization: `Token ${followerUser.token}` },
    });
    expect(getArticles.status()).toBe(200);
    const json = await getArticles.json();
    expect(json.articles).toHaveLength(1);
    expect(json).toMatchObject({
      articles: [
        {
          ...article,
          tagList: expect.arrayContaining(article.tagList),
          author: {
            username: user.username,
            bio: null,
            image: null,
            following: true,
            followersCount: 1,
          },
          favorited: false,
          favoritesCount: 0,
        },
      ],
    });
    expect(json.articles[0].tagList).toHaveLength(article.tagList.length);
  });

  test('Not followed authors articles arent in feed', async ({ user, request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const followedAuthor = await createUser(request);
    await createArticle(request, followedAuthor.token);
    const otherAuthor = await createUser(request);
    await createArticle(request, otherAuthor.token);

    const response = await request.post(`/api/profiles/${followedAuthor.username}/follow`, {
      headers: { Authorization: `Token ${user.token}` },
    });
    expect(response.status()).toBe(200);

    const getArticles = await request.get(`/api/articles/feed`, {
      headers: { Authorization: `Token ${user.token}` },
    });
    expect(getArticles.status()).toBe(200);
    const json = await getArticles.json();
    expect(json.articles).toHaveLength(1);
    expect(
      json.articles.every(
        (article: { author: { username: string } }) =>
          article.author.username === followedAuthor.username,
      ),
    ).toBe(true);
  });

  test('Feed articles for not logged in user', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.get(`/api/articles/feed`, {});
    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.errors).toBeDefined();
  });
});
