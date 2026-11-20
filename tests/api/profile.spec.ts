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

  test('Return user profile from unauthorized user', async ({ request, user }) => {
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

  test('Return unexisted user profile from unauthorized user', async ({ request }) => {
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

  test('Follow the user', async ({ request, user }) => {
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
    const response2 = await request.get(`/api/profiles/${user.username}`, {
      headers: { Authorization: `Token ${follower.token}` },
    });
    expect(response2.status()).toBe(200);
    const json2 = await response2.json();

    expect(json2).toMatchObject({
      profile: {
        username: user.username,
        following: true,
        bio: null,
        image: null,
      },
    });
  });

  test('UnFollow the user', async ({ request, user }) => {
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
    const response2 = await request.delete(`/api/profiles/${user.username}/follow`, {
      headers: { Authorization: `Token ${follower.token}` },
    });
    expect(response2.status()).toBe(200);
    const json2 = await response2.json();

    expect(json2).toMatchObject({
      profile: {
        username: user.username,
        following: false,
        bio: null,
        image: null,
        followersCount: 0,
      },
    });
  });

  test('Follow the user without login', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.post(`/api/profiles/${user.username}/follow`);

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});
