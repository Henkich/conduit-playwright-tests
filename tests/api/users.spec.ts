import { test, expect } from '../../fixtures';

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
