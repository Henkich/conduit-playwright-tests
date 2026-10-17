import { test, expect } from '../../fixtures';
import {
  generateArticleName,
  generateArticleBody,
  generateArticleDescription,
  generateArticleTags,
  generateTag,
} from '../../helpers/data';
import { createArticle, createUser } from '../../helpers/api';

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

    expect(json.errors).toBeDefined();
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
  });

  test('Create Article with same existed title', async ({ request, user }) => {
    const article = await createArticle(request, user.token);
    const title = article.title;
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

  test('Create Article without Login', async ({ request }) => {
    const title = generateArticleName();
    const description = generateArticleDescription();
    const body = generateArticleBody();
    const tags = generateArticleTags();
    const response = await request.post(`/api/articles/`, {
      data: {
        article: {
          title: title,
          description: description,
          body: body,
          tagList: tags,
        },
      },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('Create Article without required field', async ({ request, user }) => {
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

test.describe('GET /api/articles/:slug', () => {
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

  test('Receive unexisted  Article', async ({ request }) => {
    const unesixtedSlug = generateArticleName();
    const response = await request.get(`/api/articles/${unesixtedSlug}`, {});

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

    const getAfterPost = await request.get(`/api/articles/${article.slug}`);
    expect(getAfterPost.status()).toBe(200);
    const json2 = await getAfterPost.json();

    expect(json2).toMatchObject({
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
    const getAfterPost = await request.get(`/api/articles/${newSlug}`);
    expect(getAfterPost.status()).toBe(200);
    const json2 = await getAfterPost.json();

    expect(json2).toMatchObject({
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

    const getArticle = await request.get(`/api/articles/${article.slug}`);
    expect(getArticle.status()).toBe(200);
    const json2 = await getArticle.json();
    expect(json2).toMatchObject({
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
  });

  test('User tries to edit not esixted article', async ({ request, user }) => {
    const unexistedArticle = generateArticleName();
    const newBody = generateArticleBody();
    const response = await request.put(`/api/articles/${unexistedArticle.toLowerCase()}`, {
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
