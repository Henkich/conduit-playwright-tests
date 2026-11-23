import { test, expect } from '../../fixtures';
import { createUser } from '../../helpers/api';
import { generateUsername } from '../../helpers/data';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../../helpers/allure';

test.describe('GET /api/profiles/:username', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.profiles);
    await allure.feature(FEATURE.profile);
  });

  test('returns a profile without token', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const response = await request.get(`/api/profiles/${user.username}`);

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      profile: {
        username: user.username,
        following: false,
        bio: null,
        image: null,
      },
    });
  });

  test('returns 404 for an unknown username', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.get(`/api/profiles/${generateUsername()}`);

    expect(response.status()).toBe(404);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test.describe('POST/DELETE /api/profiles/:username/follow', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.profiles);
    await allure.feature(FEATURE.follow);
  });

  test('follows a user', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const follower = await createUser(request);
    const response = await request.post(`/api/profiles/${user.username}/follow`, {
      headers: { Authorization: `Token ${follower.token}` },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      profile: {
        username: user.username,
        following: true,
        bio: null,
        image: null,
        followersCount: 1,
      },
    });
    const getResponse = await request.get(`/api/profiles/${user.username}`, {
      headers: { Authorization: `Token ${follower.token}` },
    });
    expect(getResponse.status()).toBe(200);
    const getJson = await getResponse.json();

    expect(getJson).toMatchObject({
      profile: {
        username: user.username,
        following: true,
        bio: null,
        image: null,
      },
    });
  });

  test('unfollows a user', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const follower = await createUser(request);
    const response = await request.post(`/api/profiles/${user.username}/follow`, {
      headers: { Authorization: `Token ${follower.token}` },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toMatchObject({
      profile: {
        username: user.username,
        following: true,
        bio: null,
        image: null,
        followersCount: 1,
      },
    });
    const unfollowResponse = await request.delete(`/api/profiles/${user.username}/follow`, {
      headers: { Authorization: `Token ${follower.token}` },
    });
    expect(unfollowResponse.status()).toBe(200);
    const unfollowJson = await unfollowResponse.json();

    expect(unfollowJson).toMatchObject({
      profile: {
        username: user.username,
        following: false,
        bio: null,
        image: null,
        followersCount: 0,
      },
    });
  });

  test('returns 401 without token', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.post(`/api/profiles/${user.username}/follow`);

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});
