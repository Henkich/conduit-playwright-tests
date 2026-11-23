import { test, expect } from '../../fixtures';
import { createUserData } from '../../helpers/api';
import { generateEmail, generateUsername } from '../../helpers/data';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../../helpers/allure';

test.describe('POST /api/users/login', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.login);
  });

  test('logs in with valid credentials', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const response = await request.post('/api/users/login', {
      data: { user: { email: user.email, password: user.password } },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toEqual({
      user: {
        username: user.username,
        email: user.email,
        token: expect.any(String),
        bio: null,
        image: null,
      },
    });
  });

  // Same response as for a wrong password, so the API doesn't reveal which emails are registered
  test('returns the same error for an unknown email as for a wrong password', async ({
    request,
    user,
  }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 404 "Email not found sign in first" (user enumeration)');
    const response = await request.post('/api/users/login', {
      data: { user: { email: generateEmail(), password: user.password } },
    });

    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({
      errors: { body: ['Wrong email/password combination'] },
    });
  });

  test('returns 401 for a wrong password', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 422 instead of 401');
    const response = await request.post('/api/users/login', {
      data: { user: { email: user.email, password: '14d' } },
    });
    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.errors).toBeDefined();

    expect(json).toEqual({
      errors: { body: ['Wrong email/password combination'] },
    });
  });
});

test.describe('GET /api/user', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.session);
  });

  test('returns the current user for a valid token', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const response = await request.get('/api/user', {
      headers: { Authorization: `Token ${user.token}` },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toEqual({
      user: {
        username: user.username,
        email: user.email,
        token: expect.any(String),
        bio: null,
        image: null,
      },
    });
  });

  test('returns 401 without token', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.get('/api/user');

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json).toEqual({
      errors: {
        body: ['You need to login first!'],
      },
    });
  });

  test('returns 401 for a forged token', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 500 instead of 401');
    const response = await request.get('/api/user', {
      headers: { Authorization: `Token 345gj03430f304v3408g034f34f34yg34f34` },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('returns 401 for a malformed Authorization header', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 500 instead of 401');
    const response = await request.get('/api/user', {
      headers: { Authorization: `Token${user.token}` },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();
    expect(json.errors).toBeDefined();
  });
});

test.describe('POST /api/users', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.registration);
  });

  test('registers a new user', async ({ request }) => {
    await allure.severity(allure.Severity.CRITICAL);
    const newUser = createUserData();
    const response = await request.post('/api/users', {
      data: {
        user: newUser,
      },
    });

    expect(response.status()).toBe(201);
    const json = await response.json();

    expect(json).toEqual({
      user: {
        username: newUser.username,
        email: newUser.email,
        token: expect.any(String),
        bio: null,
        image: null,
      },
    });
  });

  test('returns 409 for a taken email', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: returns 422 instead of 409');
    const newUser = createUserData({ email: user.email });
    const response = await request.post('/api/users', {
      data: {
        user: newUser,
      },
    });

    expect(response.status()).toBe(409);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('returns 409 for a taken username', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: a duplicate username is accepted');
    const newUser = createUserData({ username: user.username });
    const response = await request.post('/api/users', {
      data: {
        user: newUser,
      },
    });

    expect(response.status()).toBe(409);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('returns 422 for an empty password', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const newUser = createUserData({ password: '' });
    const response = await request.post('/api/users', {
      data: {
        user: newUser,
      },
    });

    expect(response.status()).toBe(422);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });
});

test.describe('PUT /api/user', () => {
  test.beforeEach(async () => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.userSettings);
  });

  test('updates bio and image', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    test.fail(true, 'BUG: returns 500 when the request has no password');
    const response = await request.put('/api/user', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        user: { bio: 'SomeManWithSword', image: 'image.url' },
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toEqual({
      user: {
        username: user.username,
        email: user.email,
        token: expect.any(String),
        bio: 'SomeManWithSword',
        image: 'image.url',
      },
    });
  });

  test('returns 401 without token', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.put('/api/user', {
      data: {
        user: { bio: 'SomeManWithSword2', image: 'image.url2' },
      },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('updates the username', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'BUG: the response has no email');
    const uniqueName = generateUsername();
    const response = await request.put('/api/user', {
      headers: { Authorization: `Token ${user.token}` },
      data: {
        user: { username: uniqueName, password: user.password },
      },
    });

    expect(response.status()).toBe(200);
    const json = await response.json();

    expect(json).toEqual({
      user: {
        username: uniqueName,
        email: user.email,
        token: user.token,
        bio: null,
        image: null,
      },
    });
  });
});
