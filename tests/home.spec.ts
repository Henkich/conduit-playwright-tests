import { test, expect } from '@playwright/test';

test('Main Page has logo and Global Feed', async ({ page }) => {
  await page.goto('/');

  const navbar = page.getByRole('navigation');
  await expect(navbar.getByRole('link', { name: 'conduit' })).toBeVisible();
  await expect(page.getByText('Global Feed')).toBeVisible();
});