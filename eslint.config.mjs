import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default defineConfig(
  { ignores: ['playwright-report/', 'test-results/', 'playwright/'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  { files: ['tests/**'], ...playwright.configs['flat/recommended'] },
);
