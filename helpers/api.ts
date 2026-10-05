import { expect, type APIRequestContext } from '@playwright/test';

export type User = {
  username: string;
  email: string;
  password: string;
};

export function generateEmail(): string {
  const username = `user${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return `${username}@example.com`;
}

export async function createUser(
  request: APIRequestContext,
  password: string = 'Passw0rd!',
): Promise<User> {
  const username = `user${Date.now()}${Math.floor(Math.random() * 1000)}`;
  const user: User = {
    username,
    email: generateEmail(),
    password,
  };
  const response = await request.post('/api/users', { data: { user } });
  expect(response.ok(), 'user should be created via API').toBeTruthy();
  return user;
}
