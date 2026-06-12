import type { InitOptions } from '@vskstudio/takt-core'

/**
 * Build the browser runtime that boots Takt.
 *
 * Returned as a source string because Astro's `injectScript` and the `<Takt />`
 * component both take a raw module body.
 */
export function buildRuntime(options: InitOptions): string {
  // `<` is escaped so a domain/endpoint containing `</script>` (or `<!--`) cannot
  // terminate the inline `<script>` tag or open a comment in the emitted HTML —
  // JSON.stringify alone does not escape `/`, and the HTML parser stops at a
  // literal `</script>` regardless of JS string context. JSON.parse ignores the
  // `\uXXXX` escapes, so the values round-trip unchanged at runtime.
  const json = JSON.stringify(options)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
  return [
    `import { init } from '@vskstudio/takt-core';`,
    // SSR/prerender guard: this module is evaluated under Node when Astro
    // prerenders, where window/init's browser APIs are absent.
    `if (typeof window !== 'undefined' && !window.__takt) {`,
    `  const o = ${json};`,
    // Idempotent across both entry paths (integration + <Takt/>): the flag stops
    // a second boot from disposing the first instance's listeners.
    `  window.__takt = true;`,
    // Single source of pageviews. init() enables core's SPA tracking, which
    // patches history.pushState/replaceState. Astro's ClientRouter navigates via
    // pushState and does NOT replace the history object on DOM swap, so the patch
    // persists and fires one pageview per View Transitions navigation. init()
    // also fires the initial pageview. We therefore do NOT listen to
    // astro:page-load — doing so would double-count every in-app navigation.
    `  init(o);`,
    `}`,
  ].join('\n')
}
