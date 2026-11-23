import { test, expect } from '../../fixtures';
import { createArticle, createUser } from '../../helpers/api';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../../helpers/allure';

test.describe('POST/DELETE /api/articles/:slug/favorite', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.favorites);
  });

  test('favorites an article', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const article = await createArticle(request, user.token);
    const reader = await createUser(request);
    const response = await request.post(`/api/articles/${article.slug}/favorite`, {
      headers: { Authorization: `Token ${reader.token}` },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        ...article,
        tagList: expect.arrayContaining(article.tagList),
        favorited: true,
        favoritesCount: 1,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
    expect(json.article.tagList).toHaveLength(article.tagList.length);

    const getResponse = await request.get(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${reader.token}` },
    });
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();

    expect(getJson.article).toMatchObject({
      favorited: true,
      favoritesCount: 1,
    });

    // favorited is per viewer, favoritesCount is shared
    const guestResponse = await request.get(`/api/articles/${article.slug}`);
    expect(guestResponse.status()).toBe(200);
    expect((await guestResponse.json()).article).toMatchObject({
      favorited: false,
      favoritesCount: 1,
    });
  });

  test('unfavorites an article', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);
    const reader = await createUser(request);
    const response = await request.post(`/api/articles/${article.slug}/favorite`, {
      headers: { Authorization: `Token ${reader.token}` },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json.article.favorited).toBe(true);

    const unfavoriteResponse = await request.delete(`/api/articles/${article.slug}/favorite`, {
      headers: { Authorization: `Token ${reader.token}` },
    });
    expect(unfavoriteResponse.status()).toBe(200);
    const unfavoriteJson = await unfavoriteResponse.json();

    expect(unfavoriteJson).toMatchObject({
      article: {
        ...article,
        tagList: expect.arrayContaining(article.tagList),
        favorited: false,
        favoritesCount: 0,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
    expect(unfavoriteJson.article.tagList).toHaveLength(article.tagList.length);

    const getResponse = await request.get(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${reader.token}` },
    });
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();

    expect(getJson.article).toMatchObject({
      favorited: false,
      favoritesCount: 0,
    });
  });
});
