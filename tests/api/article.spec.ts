import { test, expect } from '../../fixtures';
import { generateArticleName, generateArticleBody, generateArticleTags } from '../../helpers/data';
import { createArticle, createUser, createArticleData } from '../../helpers/api';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../../helpers/allure';

test.describe('POST /api/articles', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.createArticle);
  });

  test('creates an article', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const article = createArticleData();
    const response = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article,
      },
    });

    expect(response.status()).toBe(201);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        ...article,
        tagList: expect.arrayContaining(article.tagList),
        favorited: false,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
    expect(json.article.tagList).toHaveLength(article.tagList.length);
  });

  test('returns 422 for a non-array tagList', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: a string tagList is accepted');
    const article = { ...createArticleData(), tagList: generateArticleTags().toString() };

    const response = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article,
      },
    });

    expect(response.status()).toBe(422);
  });

  test('creates an article without tagList', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 500 instead of 201 without tagList');
    const { tagList, ...article } = createArticleData();
    const response = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article,
      },
    });

    expect(response.status()).toBe(201);

    // uncomment after fix
    /* const json = await response.json();

    expect(json).toMatchObject({
      article: {
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: [],
        favorited: false,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
*/
  });

  test('returns 409 for a duplicate title', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 422 instead of 409');
    const article = await createArticle(request, user.token);
    const articleDupl = createArticleData({ title: article.title });
    const response = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: articleDupl,
      },
    });

    expect(response.status()).toBe(409);
  });

  test('rejects a duplicate title and keeps the original article', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);
    const articleDupl = createArticleData({ title: article.title });
    const response = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: articleDupl,
      },
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
    expect(response.status()).toBeLessThan(500);
    const json = await response.json();

    expect(json.errors).toBeDefined();

    const originalResponse = await request.get(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${user.token}` },
    });

    await expect(originalResponse).toBeOK();
    const originalJson = await originalResponse.json();

    expect(originalJson).toMatchObject({
      article: {
        ...article,
        tagList: expect.arrayContaining(article.tagList),
      },
    });
    expect(originalJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('returns 401 without token', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = createArticleData();
    const response = await request.post('/api/articles', {
      data: {
        article,
      },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('returns 422 for an empty title', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = createArticleData({ title: '' });
    const response = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article,
      },
    });

    expect(response.status()).toBe(422);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test.describe('GET /api/articles/:slug', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.viewArticle);
  });

  test('returns an article by slug', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const article = await createArticle(request, user.token);
    const response = await request.get(`/api/articles/${article.slug}`);

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        ...article,
        tagList: expect.arrayContaining(article.tagList),
        favorited: false,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
    expect(json.article.tagList).toHaveLength(article.tagList.length);
  });

  test('returns 404 for an unknown slug', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const nonExistentSlug = generateArticleName();
    const response = await request.get(`/api/articles/${nonExistentSlug}`);

    expect(response.status()).toBe(404);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test.describe('PUT /api/articles/:slug', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.editArticle);
  });

  test('author updates the body', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const article = await createArticle(request, user.token);
    const newBody = generateArticleBody();
    const response = await request.put(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          body: newBody,
        },
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        ...article,
        body: newBody,
        tagList: expect.arrayContaining(article.tagList),
      },
    });
    expect(json.article.tagList).toHaveLength(article.tagList.length);

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();

    expect(getJson).toMatchObject({
      article: {
        ...article,
        body: newBody,
        tagList: expect.arrayContaining(article.tagList),
      },
    });
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('author updates the title and gets a new slug', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);
    const newTitle = generateArticleName();
    const response = await request.put(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          title: newTitle,
        },
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        ...article,
        slug: expect.any(String),
        title: newTitle,
        tagList: expect.arrayContaining(article.tagList),
      },
    });
    expect(json.article.tagList).toHaveLength(article.tagList.length);

    const newSlug = json.article.slug;
    expect(newSlug).toBe(newTitle.toLowerCase());
    const getResponse = await request.get(`/api/articles/${newSlug}`);
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();

    expect(getJson).toMatchObject({
      article: {
        ...article,
        slug: newSlug,
        title: newTitle,
        tagList: expect.arrayContaining(article.tagList),
      },
    });
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('returns 403 for another user and keeps the article', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const editor = await createUser(request);
    const article = await createArticle(request, user.token);
    const newBody = generateArticleBody();
    const response = await request.put(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${editor.token}` },
      data: {
        article: {
          body: newBody,
        },
      },
    });

    expect(response.status()).toBe(403);
    const json = await response.json();

    expect(json.errors).toBeDefined();

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();
    expect(getJson).toMatchObject({
      article: {
        ...article,
        tagList: expect.arrayContaining(article.tagList),
      },
    });
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('returns 401 without token and keeps the article', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);
    const newBody = generateArticleBody();
    const response = await request.put(`/api/articles/${article.slug}`, {
      data: {
        article: {
          body: newBody,
        },
      },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();
    expect(getJson).toMatchObject({
      article: {
        ...article,
        tagList: expect.arrayContaining(article.tagList),
      },
    });
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('returns 404 for an unknown slug', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const nonExistentSlug = generateArticleName();
    const newBody = generateArticleBody();
    const response = await request.put(`/api/articles/${nonExistentSlug.toLowerCase()}`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          body: newBody,
        },
      },
    });

    expect(response.status()).toBe(404);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test.describe('DELETE /api/articles/:slug', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.deleteArticle);
  });

  test('author deletes the article', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const article = await createArticle(request, user.token);

    const response = await request.delete(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${user.token}` },
    });

    await expect(response).toBeOK();

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(404);
    const getJson = await getResponse.json();
    expect(getJson.errors).toBeDefined();
  });

  test('returns 204 after delete', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 200 instead of 204');
    const article = await createArticle(request, user.token);

    const response = await request.delete(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${user.token}` },
    });

    expect(response.status()).toBe(204);
  });

  test('returns 403 for another user and keeps the article', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const stranger = await createUser(request);
    const article = await createArticle(request, user.token);

    const response = await request.delete(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${stranger.token}` },
    });

    expect(response.status()).toBe(403);
    const json = await response.json();
    expect(json.errors).toBeDefined();

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(200);
  });

  test('returns 401 without token and keeps the article', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const article = await createArticle(request, user.token);

    const response = await request.delete(`/api/articles/${article.slug}`);

    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.errors).toBeDefined();

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(200);
  });

  test('returns 404 for an unknown slug', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.delete(`/api/articles/${generateArticleName().toLowerCase()}`, {
      headers: { Authorization: `Token ${user.token}` },
    });

    expect(response.status()).toBe(404);
    const json = await response.json();
    expect(json.errors).toBeDefined();
  });
});
