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
  /** Track client-side navigations (history + Astro View Transitions). Default `true`. */
  spa?: boolean
  /** Suppress events when the browser's Do Not Track is enabled. Default `true`. */
  respectDnt?: boolean
  /** Suppress events on localhost and private IP ranges. Default `true`. */
  excludeLocalhost?: boolean
}

export function resolveOptions(options: TaktOptions = {}): InitOptions {
  return {
    domain: options.domain,
    endpoint: options.endpoint,
    scriptOrigin: options.scriptOrigin,
    outbound: options.outbound ?? false,
    files: options.files ?? false,
    respectDnt: options.respectDnt ?? true,
    excludeLocalhost: options.excludeLocalhost ?? true,
    auto: options.spa ?? true,
  }
}
