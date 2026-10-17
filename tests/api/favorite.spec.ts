import { test, expect } from '../../fixtures';
import { createArticle, createUser } from '../../helpers/api';

test.describe('POST /api/articles/:slug/favorite', () => {
  test('User add an Article to the Favorite', async ({ request, user }) => {
    const article = await createArticle(request, user.token);
    const adderFavorite = await createUser(request);
    const response = await request.post(`/api/articles/${article.slug}/favorite`, {
      headers: { Authorization: `Token ${adderFavorite.token}` },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
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

    const getAfterFav = await request.get(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${adderFavorite.token}` },
    });
    expect(getAfterFav.status()).toBe(200);
    const json2 = await getAfterFav.json();

    expect(json2).toMatchObject({
      article: {
        title: article.title,
        description: article.description,
        body: article.body,
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

    // favorited is per viewer, favoritesCount is shared
    const asGuest = await request.get(`/api/articles/${article.slug}`);
    expect(asGuest.status()).toBe(200);
    expect((await asGuest.json()).article).toMatchObject({
      favorited: false,
      favoritesCount: 1,
    });
  });

  test('User unfavorite Article', async ({ request, user }) => {
    const article = await createArticle(request, user.token);
    const adderFavorite = await createUser(request);
    const response = await request.post(`/api/articles/${article.slug}/favorite`, {
      headers: { Authorization: `Token ${adderFavorite.token}` },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: expect.arrayContaining(article.tagList),
        favorited: true,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
    expect(json.article.tagList).toHaveLength(article.tagList.length);

    const responseUNfavorite = await request.delete(`/api/articles/${article.slug}/favorite`, {
      headers: { Authorization: `Token ${adderFavorite.token}` },
    });
    expect(responseUNfavorite.status()).toBe(200);
    const jsonunfav = await responseUNfavorite.json();

    expect(jsonunfav).toMatchObject({
      article: {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
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

    const getAfterUnFav = await request.get(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${adderFavorite.token}` },
    });
    expect(getAfterUnFav.status()).toBe(200);
    const json2 = await getAfterUnFav.json();

    expect(json2).toMatchObject({
      article: {
        title: article.title,
        description: article.description,
        body: article.body,
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
  });
});
