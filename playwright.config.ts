import { defineConfig } from '@playwright/test'

// Builds the package, then serves the Astro e2e app and runs the specs against it.
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:4173' },
  webServer: {
    command: 'pnpm build && pnpm exec astro dev --root e2e/app --port 4173',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
