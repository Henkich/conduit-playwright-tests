import { test, expect } from '../../fixtures';
import { generateArticleName, generateArticleBody, generateArticleTags } from '../../helpers/data';
import { createArticle, createUser, createArticleData } from '../../helpers/api';

test.describe('POST /api/articles', () => {
  test('Create Article', async ({ request, user }) => {
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

  test('Create Article, taglist isnt array', async ({ request, user }) => {
    test.fail(true, 'BUG: server accepts tagList in non-array type');
    const article = { ...createArticleData(), tagList: generateArticleTags().toString() };

    const response = await request.post('/api/articles', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article,
      },
    });

    expect(response.status()).toBe(422);
  });

  test('Create Article without Tags', async ({ request, user }) => {
    test.fail(true, 'BUG: 500 error instead of 201 without tags');
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

  test('Status after Creating Article with same existed title', async ({ request, user }) => {
    test.fail(true, 'BUG: 422 status is returned instead of 409');
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

  test('Creating Article with same existed title with errors, original is ok', async ({
    request,
    user,
  }) => {
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
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: expect.arrayContaining(article.tagList),
        favorited: false,
      },
    });
    expect(originalJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('Create Article without Login', async ({ request }) => {
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

  test('Create Article without required field', async ({ request, user }) => {
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
  test('Receive created Article', async ({ request, user }) => {
    const article = await createArticle(request, user.token);
    const response = await request.get(`/api/articles/${article.slug}`);

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        title: article.title,
        description: article.description,
        body: article.body,
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

  test('Receive unexisted  Article', async ({ request }) => {
    const nonExistentSlug = generateArticleName();
    const response = await request.get(`/api/articles/${nonExistentSlug}`);

    expect(response.status()).toBe(404);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test.describe('PUT /api/articles/:slug', () => {
  test('Author change Body of article', async ({ request, user }) => {
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
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: newBody,
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

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();

    expect(getJson).toMatchObject({
      article: {
        title: article.title,
        description: article.description,
        body: newBody,
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
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('Author change Title of article, slug changed too', async ({ request, user }) => {
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
        slug: expect.any(String),
        title: newTitle,
        description: article.description,
        body: article.body,
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

    const newSlug = json.article.slug;
    expect(newSlug).toBe(newTitle.toLowerCase());
    const getResponse = await request.get(`/api/articles/${newSlug}`);
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();

    expect(getJson).toMatchObject({
      article: {
        slug: newSlug,
        title: newTitle,
        description: article.description,
        body: article.body,
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
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('Not owner tries to edit the article', async ({ request, user }) => {
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
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
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
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('Not logged in User tries to edit the article', async ({ request, user }) => {
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
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
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
    expect(getJson.article.tagList).toHaveLength(article.tagList.length);
  });

  test('User tries to edit not esixted article', async ({ request, user }) => {
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
  test('Author delete the owned article', async ({ request, user }) => {
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

  test('Status after deleting', async ({ request, user }) => {
    test.fail(true, 'BUG: status 200 instead of 204 after delete');
    const article = await createArticle(request, user.token);

    const response = await request.delete(`/api/articles/${article.slug}`, {
      headers: { Authorization: `Token ${user.token}` },
    });

    expect(response.status()).toBe(204);
  });

  test('Not owner tries to delete the article', async ({ request, user }) => {
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

  test('Not logged in User tries to delete the article', async ({ request, user }) => {
    const article = await createArticle(request, user.token);

    const response = await request.delete(`/api/articles/${article.slug}`);

    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.errors).toBeDefined();

    const getResponse = await request.get(`/api/articles/${article.slug}`);
    expect(getResponse.status()).toBe(200);
  });

  test('User tries to delete not existed article', async ({ request, user }) => {
    const response = await request.delete(`/api/articles/${generateArticleName().toLowerCase()}`, {
      headers: { Authorization: `Token ${user.token}` },
    });

    expect(response.status()).toBe(404);
    const json = await response.json();
    expect(json.errors).toBeDefined();
  });
});
