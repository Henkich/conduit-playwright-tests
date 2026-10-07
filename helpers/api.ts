import { expect, type APIRequestContext } from '@playwright/test';
import { uniqueId, generateEmail } from './data';

export type User = {
  username: string;
  email: string;
  password: string;
};

export async function createUser(
  request: APIRequestContext,
  password: string = 'Passw0rd!',
): Promise<User> {
  const username = `user${uniqueId()}`;
  const user: User = {
    username,
    email: generateEmail(),
    password,
  };
  const response = await request.post('/api/users', { data: { user } });
  expect(response.ok(), 'user should be created via API').toBeTruthy();
  return user;
}
