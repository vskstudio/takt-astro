import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Unit tests live in test/; e2e/ is Playwright's territory.
    include: ['test/**/*.test.ts'],
  },
})
