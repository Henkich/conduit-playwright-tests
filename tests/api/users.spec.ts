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

  test('Return user with valid creds', async ({ request, user }) => {
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

  test('Incorrect password', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'wrong password return 422 instead of 401');
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

  test('Return loggined user', async ({ request, user }) => {
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

  test('Return user with unloggined user', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    const response = await request.get('/api/user', {});

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json).toEqual({
      errors: {
        body: ['You need to login first!'],
      },
    });
  });

  test('Return user with unknown token', async ({ request }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, '500 response code instead of 401');
    const response = await request.get('/api/user', {
      headers: { Authorization: `Token 345gj03430f304v3408g034f34f34yg34f34` },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('Return user with monotoken', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, '500 error insead of 401');
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

  test('Successfully create the user', async ({ request }) => {
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

  test('Create User with same email', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'using already existed email in user creation returns 422 instead of 409');
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

  test('Create User with same Username', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'another user with same username CAN BE created');
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

  test('Create User with empty password', async ({ request }) => {
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

  test('Update users bio and image', async ({ request, user }) => {
    await allure.severity(allure.Severity.CRITICAL);
    test.fail(true, '500 error after updating bio and image');
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

  test('Update users bio and image without token', async ({ request }) => {
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

  test('Update username with password', async ({ request, user }) => {
    await allure.severity(allure.Severity.NORMAL);
    test.fail(true, 'email doesnt return in response after changing username');
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
