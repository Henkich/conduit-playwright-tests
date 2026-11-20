import { defineConfig } from 'allure';

// Allure 3 report config, picked up by `allure generate` / `allure open`
export default defineConfig({
  // Every `generate` appends the run here and reads previous runs: History tab, flaky, trends.
  // Local only (git-ignored); CI starts clean, so its reports have no history.
  historyPath: './allure-history.jsonl',
  // Unlimited by default; one entry per `generate` (~110 KB for our suite)
  historyLimit: 20,
  plugins: {
    awesome: {
      // Tree by business labels instead of file paths; unlabelled tests stay grouped by file
      options: { groupBy: ['epic', 'feature'] },
    },
  },
});
