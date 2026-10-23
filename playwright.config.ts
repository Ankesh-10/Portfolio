import { defineConfig } from "@playwright/test";

// `npm run test:e2e` builds, serves the production build and runs the suite (spec §15 Phase 5/6 checks).
const PORT = 3111;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: `http://localhost:${PORT}`, launchOptions: { args: [] } },
  webServer: {
    command: `npm run build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});
