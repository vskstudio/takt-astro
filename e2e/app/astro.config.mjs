import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import takt from '@vskstudio/takt-astro'

// Alias the package specifier to the built artifact so the example exercises the
// real published output (dist) rather than the TypeScript source.
const dist = fileURLToPath(new URL('../../dist/index.js', import.meta.url))
const component = fileURLToPath(new URL('../../Takt.astro', import.meta.url))

export default defineConfig({
  integrations: [takt({ domain: 'example.com', endpoint: '/api/event', excludeLocalhost: false })],
  vite: {
    resolve: {
      alias: {
        '@vskstudio/takt-astro/Takt.astro': component,
        '@vskstudio/takt-astro': dist,
      },
    },
  },
})
