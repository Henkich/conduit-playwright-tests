import { readFileSync } from 'fs';

export const AUTH_FILE = 'playwright/.auth/user.json';
export const GUEST = { cookies: [], origins: [] };

type StorageItem = { name: string; value: string };

// Token of the user logged in by auth.setup.ts; the app keeps it in localStorage 'loggedUser'
export function getAuthToken(): string {
  const state = JSON.parse(readFileSync(AUTH_FILE, 'utf-8'));
  const loggedUser = state.origins[0].localStorage.find(
    (item: StorageItem) => item.name === 'loggedUser',
  );
  return JSON.parse(loggedUser.value).loggedUser.token;
}
