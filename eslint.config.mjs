import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig(
  {
    ignores: [
      'playwright-report/',
      'test-results/',
      'playwright/',
      'allure-report/',
      'allure-results/',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // allow dropping a field via rest destructuring: const { tagList, ...rest } = obj
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  // typed linting for TS: catches a forgotten await on any Promise (own helpers, page objects)
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: true, tsconfigRootDir: import.meta.dirname },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'error',
    },
  },
  {
    files: ['tests/**/*.ts'],
    ...playwright.configs['flat/recommended'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/valid-expect': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-skipped-test': 'warn',
      'playwright/expect-expect': 'error',
    },
  },
  // .mjs files are Node scripts (e.g. Claude Code hooks): process, console, etc.
  { files: ['**/*.mjs'], languageOptions: { globals: globals.node } },
);
