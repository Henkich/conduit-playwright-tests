import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig(
  { ignores: ['playwright-report/', 'test-results/', 'playwright/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    rules: {
      // allow dropping a field via rest destructuring: const { tagList, ...rest } = obj
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    },
  },
  { files: ['tests/**'], ...playwright.configs['flat/recommended'] },
);
