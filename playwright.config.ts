import { defineConfig } from '@playwright/test'

// Builds the package once (global-setup), then serves BOTH public install paths
// as production builds (astro build + preview) and runs the same contract suite
// against each: the integration app on 4178, the <Takt /> component app on 4179.
// Production (not dev) is served so the SSR/prerender path is exercised.
// Ports are unique per wrapper repo so a sibling's leftover server can't be reused.
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: 'integration', testMatch: /integration\.spec\.ts/, use: { baseURL: 'http://localhost:4178' } },
    { name: 'component', testMatch: /component\.spec\.ts/, use: { baseURL: 'http://localhost:4179' } },
  ],
  webServer: [
    {
      command: 'pnpm exec astro build --root e2e/app && pnpm exec astro preview --root e2e/app --port 4178',
      url: 'http://localhost:4178',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'pnpm exec astro build --root e2e/app-component && pnpm exec astro preview --root e2e/app-component --port 4179',
      url: 'http://localhost:4179',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
