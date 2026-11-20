import { defineConfig } from 'allure';

// Allure 3 report config, picked up by `allure generate` / `allure open`
export default defineConfig({
  plugins: {
    awesome: {
      // Tree by business labels instead of file paths; unlabelled tests stay grouped by file
      options: { groupBy: ['epic', 'feature'] },
    },
  },
});
