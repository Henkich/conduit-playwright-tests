import { test, expect } from '../../fixtures';
import {
  generateArticleName,
  generateArticleBody,
  generateArticleDescription,
  generateArticleTags,
  generateTag,
} from '../../helpers/data';
import { createArticle } from '../../helpers/api';

test.describe('POST /api/articles', () => {
  test('Create Article', async ({ request, user }) => {
    const title = generateArticleName();
    const description = generateArticleDescription();
    const body = generateArticleBody();
    const tags = generateArticleTags();
    const response = await request.post(`/api/articles/`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          title: title,
          description: description,
          body: body,
          tagList: tags,
        },
      },
    });

    expect(response.status()).toBe(201);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        title: title,
        description: description,
        body: body,
        tagList: tags,
        favorited: false,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
  });

  test('Create Article, taglist isnt array', async ({ request, user }) => {
    test.fail(true, 'server aceept tagList in non-array type');
    const title = generateArticleName();
    const description = generateArticleDescription();
    const body = generateArticleBody();
    const tags = generateTag();
    const response = await request.post(`/api/articles/`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          title: title,
          description: description,
          body: body,
          tagList: tags,
        },
      },
    });

    expect(response.status()).toBe(422);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        title: title,
        description: description,
        body: body,
        tagList: tags,
        favorited: false,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
  });

  test('Create Article without Tags', async ({ request, user }) => {
    test.fail(true, '500 error insead of 201 without tags');
    const title = generateArticleName();
    const description = generateArticleDescription();
    const body = generateArticleBody();
    const response = await request.post(`/api/articles/`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          title: title,
          description: description,
          body: body,
          tagList: [''],
        },
      },
    });

    expect(response.status()).toBe(500);
    const json = await response.json();

    expect(json).toMatchObject({
      article: {
        title: title,
        description: description,
        body: body,
        tagList: [''],
        favorited: false,
        author: {
          username: user.username,
          bio: null,
          image: null,
          following: false,
        },
      },
    });
  });

  test('Create Article with same existed title', async ({ request, user, myArticle }) => {
    const title = myArticle.title;
    const description = generateArticleDescription();
    const body = generateArticleBody();
    const tags = generateArticleTags();
    const response = await request.post(`/api/articles/`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          title: title,
          description: description,
          body: body,
          tagList: tags,
        },
      },
    });

    expect(response.status()).toBe(422);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test('Create Article without Login', async ({ request, user }) => {
  test.fail(true, '201 accepted instead of 409 error');
  const title = generateArticleName();
  const description = generateArticleDescription();
  const body = generateArticleBody();
  const tags = generateArticleTags();
  const response = await request.post(`/api/articles/`, {
    headers: { Authorization: `Token ${user.token}` },
    data: {
      article: {
        title: title,
        description: description,
        body: body,
        tagList: tags,
      },
    },
  });

  expect(response.status()).toBe(409);
  const json = await response.json();

  expect(json.errors).toBeDefined();
});

test.describe('POST /api/articles', () => {
  test('Create Article without required field', async ({ request, user }) => {
    const title = generateArticleName();
    const description = generateArticleDescription();
    const body = generateArticleBody();
    const tags = generateArticleTags();
    const response = await request.post(`/api/articles/`, {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        article: {
          title: '',
          description: description,
          body: body,
          tagList: tags,
        },
      },
    });

    expect(response.status()).toBe(422);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test.describe('GET /api/articles:slug', () => {
  test('Receive created Article', async ({ request, user }) => {
    const article = await createArticle(request, user.token);
    const response = await request.get(`/api/articles/${article.slug}`, {});

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
});
