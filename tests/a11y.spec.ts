import { test, expect } from '../fixtures';
import { GUEST } from '../helpers/auth';
import { createArticle } from '../helpers/api';
import * as allure from 'allure-js-commons';
import { EPIC, FEATURE } from '../helpers/allure';
import { AxeBuilder } from '@axe-core/playwright';

// Each page: one scan of all WCAG A/AA rules except known violations (catches new ones)
// + one test.fail test per known violation (turns red when the bug is fixed).

test.describe('Login page accessibility', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async ({ loginPage }) => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.login);
    await loginPage.open();
  });

  test(
    'has no WCAG A/AA violations except known ones',
    { tag: '@a11y' },
    async ({ page, loginPage }) => {
      await allure.severity(allure.Severity.NORMAL);
      await expect(loginPage.passwordInput).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['color-contrast']) // known bug, checked in a separate test
        .analyze();

      expect(results.violations.map((v) => v.id)).toEqual([]);
    },
  );

  test('text has enough color contrast', { tag: '@a11y' }, async ({ page, loginPage }) => {
    test.fail(true, 'BUG: nav links, green button and links are below 4.5:1 contrast');
    await allure.severity(allure.Severity.NORMAL);
    await expect(loginPage.passwordInput).toBeVisible();

    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe('Register page accessibility', () => {
  test.use({ storageState: GUEST });

  test.beforeEach(async ({ registerPage }) => {
    await allure.epic(EPIC.auth);
    await allure.feature(FEATURE.registration);
    await registerPage.open();
  });

  test(
    'has no WCAG A/AA violations except known ones',
    { tag: '@a11y' },
    async ({ page, registerPage }) => {
      await allure.severity(allure.Severity.NORMAL);
      await expect(registerPage.passwordInput).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['color-contrast']) // known bug, checked in a separate test
        .analyze();

      expect(results.violations.map((v) => v.id)).toEqual([]);
    },
  );

  test('text has enough color contrast', { tag: '@a11y' }, async ({ page, registerPage }) => {
    test.fail(true, 'BUG: nav links, green button and links are below 4.5:1 contrast');
    await allure.severity(allure.Severity.NORMAL);
    await expect(registerPage.passwordInput).toBeVisible();

    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});

test.describe('Home page accessibility', () => {
  test.use({ storageState: GUEST });

  // The page content depends on DB state (pagination shows only with enough articles),
  // so the test creates its own article and fakes the total to always get two pages.
  test.beforeEach(async ({ homePage, page, user, request }) => {
    await allure.epic(EPIC.articles);
    await allure.feature(FEATURE.articleList);
    await createArticle(request, user.token);

    await page.route('**/api/articles*', async (route) => {
      const response = await route.fetch();
      const json = await response.json();

      await route.fulfill({ response, json: { ...json, articlesCount: 6 } });
    });
    await homePage.open();
  });

  test(
    'has no WCAG A/AA violations except known ones',
    { tag: '@a11y' },
    async ({ page, homePage }) => {
      await allure.severity(allure.Severity.NORMAL);
      await expect(homePage.navPagination).toBeVisible();

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa'])
        .disableRules(['color-contrast', 'listitem']) // known bugs, checked in separate tests
        .analyze();

      expect(results.violations.map((v) => v.id)).toEqual([]);
    },
  );

  test('text has enough color contrast', { tag: '@a11y' }, async ({ page, homePage }) => {
    test.fail(true, 'BUG: nav links, article meta and tags are below 4.5:1 contrast');
    await allure.severity(allure.Severity.NORMAL);
    await expect(homePage.navPagination).toBeVisible();

    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

    expect(results.violations.map((v) => v.id)).toEqual([]);
  });

  test('pagination items are inside a list', { tag: '@a11y' }, async ({ page, homePage }) => {
    test.fail(true, 'BUG: pagination <li> elements have no <ul>/<ol> parent');
    await allure.severity(allure.Severity.MINOR);
    await expect(homePage.navPagination).toBeVisible();

    const results = await new AxeBuilder({ page }).withRules(['listitem']).analyze();

    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
