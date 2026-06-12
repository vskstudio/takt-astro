import type { InitOptions } from '@vskstudio/takt-core'

/**
 * Build the browser runtime that boots Takt.
 *
 * Returned as a source string because Astro's `injectScript` and the `<Takt />`
 * component both take a raw module body.
 */
export function buildRuntime(options: InitOptions): string {
  // SPA tracking is requested unless core's `auto` was explicitly disabled.
  const spa = options.auto !== false
  // `<` is escaped so a domain/endpoint containing `</script>` (or `<!--`) cannot
  // terminate the inline `<script>` tag or open a comment in the emitted HTML —
  // JSON.stringify alone does not escape `/`, and the HTML parser stops at a
  // literal `</script>` regardless of JS string context. JSON.parse ignores the
  // `\uXXXX` escapes, so the values round-trip unchanged at runtime.
  // `auto` is forced off: Astro's ClientRouter runs several history operations per
  // navigation (scroll-restoration replaceState + pushState), so core's history
  // patch would emit several pageviews per nav. We drive pageviews from Astro's
  // own lifecycle instead — see below.
  const json = JSON.stringify({ ...options, auto: false })
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
  return [
    `import { init, pageview } from '@vskstudio/takt-core';`,
    // SSR/prerender guard: this module is evaluated under Node when Astro
    // prerenders, where window/init's browser APIs are absent.
    `if (typeof window !== 'undefined' && !window.__takt) {`,
    `  const o = ${json};`,
    // Idempotent across both entry paths (integration + <Takt/>): the flag stops
    // a second boot from re-registering listeners or re-firing the initial view.
    `  window.__takt = true;`,
    `  init(o);`,
    // One initial pageview (also covers full-page MPA loads, where the script
    // re-runs per navigation and astro:after-swap never fires).
    `  pageview();`,
    // astro:after-swap fires exactly once per ClientRouter navigation (incl.
    // back/forward), giving one pageview per nav with no double-count.
    ...(spa ? [`  document.addEventListener('astro:after-swap', () => pageview());`] : []),
    `}`,
  ].join('\n')
}
