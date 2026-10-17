import { test, expect } from '../../fixtures';
import { createArticle, createUser } from '../../helpers/api';

test.describe('GET /api/articles?author=', () => {
  test('User filter by the auther', async ({ request, user }) => {
    test.fail(true, 'BUG: articlesCount counts article-tag rows, not articles');
    const creator = await createUser(request);
    const article1 = await createArticle(request, creator.token);
    const article2 = await createArticle(request, creator.token);
    const response = await request.get(`/api/articles`, {
      headers: { Authorization: `Token ${user.token}` },
      params: { author: creator.username },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    const slugs = json.articles.map((a: { slug: string }) => a.slug);
    expect(slugs).toEqual(expect.arrayContaining([article1.slug, article2.slug]));
    expect(json.articles).toHaveLength(2);
    expect.soft(json.articlesCount).toBe(2);
  });
});
