import { test, expect } from '../../fixtures';
import { generateEmail, generateUsername } from '../../helpers/data';

test.describe('POST /api/users/login', () => {
  test('Return user with valid creds', async ({ request, user }) => {
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

  test('Unexisted email', async ({ request, user }) => {
    test.fail(true, 'Unexisted email return 404 instead of 422');
    const response = await request.post('/api/users/login', {
      data: { user: { email: '234@56234', password: user.password } },
    });
    expect(response.status()).toBe(422);
    const json = await response.json();

    expect(json.errors).toBeDefined();
    expect(json).toEqual({
      errors: { body: ['Email not found sign in first'] },
    });
  });

  test('Incorrect password', async ({ request, user }) => {
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
  test('Return loggined user', async ({ request, user }) => {
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
    test.fail(true, '500 response code instead of 401');
    const response = await request.get('/api/user', {
      headers: { Authorization: `Token 345gj03430f304v3408g034f34f34yg34f34` },
    });

    expect(response.status()).toBe(401);
    const json = await response.json();

    expect(json.errors).toBeDefined();
  });

  test('Return user with monotoken', async ({ request, user }) => {
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
  test('Successfully create the user', async ({ request }) => {
    const newUser = {
      email: generateEmail(),
      username: generateUsername(),
      password: '34523445f',
    };
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
    test.fail(true, 'using already existed email in user creation returns 422 instead of 409');
    const newUser = {
      email: user.email,
      username: generateUsername(),
      password: '34523442345f',
    };
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
    test.fail(true, 'another user with same username CAN BE created');
    const newUser = {
      email: generateEmail(),
      username: user.username,
      password: '34523442345f',
    };
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
    const newUser = {
      email: generateEmail(),
      username: generateUsername(),
      password: '',
    };
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
