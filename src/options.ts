import type { InitOptions } from '@vskstudio/takt-core'

/**
 * Options for the Takt integration and `<Takt />` component. Mirrors core's
 * {@link InitOptions} naming; `spa` maps to core's `auto`.
 */
export interface TaktOptions {
  /** Site identifier sent with every event. Defaults to `location.hostname`. */
  domain?: string
  /** Ingestion endpoint. Defaults to `/api/event`. */
  endpoint?: string
  /**
   * First-party origin to derive the endpoint from (`{origin}/api/event`) — your
   * Takt domain or a custom domain to dodge ad-blockers. `endpoint` wins over it.
   */
  scriptOrigin?: string
  /** Auto-track outbound link clicks. */
  outbound?: boolean
  /** Auto-track file downloads. */
  files?: boolean
  /**
   * Report a `404` event when the page is an error page (`[data-takt-404]` /
   * `<meta name="takt:404">` marker, or a 404 HTTP status).
   */
  track404?: boolean
  /** Track client-side navigations (history + Astro View Transitions). Default `true`. */
  spa?: boolean
  /** Suppress events when the browser's Do Not Track is enabled. Default `true`. */
  respectDnt?: boolean
  /** Suppress events on localhost and private IP ranges. Default `true`. */
  excludeLocalhost?: boolean
  /** Master kill switch — when `false`, every event is suppressed. */
  enabled?: boolean
  /** Fraction of visitors to track, `0`–`1`. Defaults to tracking everyone. */
  sampleRate?: number
  /** Send the full query string with pageviews instead of stripping it. */
  trackQuery?: boolean
  /** Whitelist of query params to keep when `trackQuery` is off. */
  queryParams?: string[]
  /**
   * Rewrite each URL before it is sent (e.g. strip a fragment or PII).
   * MUST be a self-contained function: it is stringified at build time and
   * re-evaluated in the browser, so it cannot reference closure/outer-scope
   * variables. Never build it from user input.
   */
  scrubUrl?: (url: string) => string
  /** Auto-track elements marked with `data-takt-event`. */
  tagged?: boolean
}

/**
 * Map user options to core's {@link InitOptions} for JSON serialization.
 * `scrubUrl` is intentionally absent here — it is a function and cannot survive
 * `JSON.stringify`, so it is threaded separately to {@link buildRuntime}.
 */
export function resolveOptions(options: TaktOptions = {}): InitOptions {
  return {
    domain: options.domain,
    endpoint: options.endpoint,
    scriptOrigin: options.scriptOrigin,
    outbound: options.outbound ?? false,
    files: options.files ?? false,
    notFound: options.track404 ?? false,
    respectDnt: options.respectDnt ?? true,
    excludeLocalhost: options.excludeLocalhost ?? true,
    auto: options.spa ?? true,
    enabled: options.enabled,
    sampleRate: options.sampleRate,
    trackQuery: options.trackQuery,
    queryParams: options.queryParams,
    tagged: options.tagged,
  }
}
