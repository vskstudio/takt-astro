# @vskstudio/takt-astro


> 📚 **Documentation** — [taktlytics.com/docs/wrappers/astro](https://taktlytics.com/docs/wrappers/astro)

Astro integration for [Takt](https://github.com/vskstudio/takt-core), privacy-friendly analytics. It injects a tiny browser runtime that boots Takt, fires the initial pageview, and tracks client-side navigations — including [Astro View Transitions](https://docs.astro.build/en/guides/view-transitions/).

## Install

```sh
pnpm add @vskstudio/takt-astro @vskstudio/takt-core
```

## Usage

Pick **one** of the two paths below — not both. Both boot core's default instance, so combining them would just re-initialise.

### Integration (recommended)

```js
// astro.config.mjs
import { defineConfig } from 'astro/config'
import takt from '@vskstudio/takt-astro'

export default defineConfig({
  integrations: [takt({ domain: 'example.com' })],
})
```

### `<Takt />` component

For per-layout control, place the component in a layout `<head>`:

```astro
---
import Takt from '@vskstudio/takt-astro/Takt.astro'
---
<head>
  <Takt domain="example.com" />
</head>
```

## Options

Both the integration and the component accept the same options, with one exception: `scrubUrl` is a function and works **only via the integration** (see the note below).

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `domain` | `string` | `location.hostname` | Site identifier sent with every event. |
| `endpoint` | `string` | `/api/event` | Ingestion endpoint. |
| `scriptOrigin` | `string` | – | First-party origin to derive the endpoint from (`{origin}/api/event`) — your Takt domain or a custom domain to dodge ad-blockers (endpoint wins over it). |
| `outbound` | `boolean` | `false` | Auto-track outbound link clicks. |
| `files` | `boolean` | `false` | Auto-track file downloads. |
| `track404` | `boolean` | `false` | Report a `404` event when the page is an error page (`[data-takt-404]` / `<meta name="takt:404">` marker, or a 404 HTTP status). |
| `spa` | `boolean` | `true` | Track client-side navigations. |
| `respectDnt` | `boolean` | `true` | Suppress events when Do Not Track is on. |
| `excludeLocalhost` | `boolean` | `true` | Suppress events on localhost / private IPs. |
| `enabled` | `boolean` | `true` | Master kill switch — set `false` to suppress every event. |
| `sampleRate` | `number` | `1` | Fraction of visitors to track, `0`–`1`. |
| `trackQuery` | `boolean` | `false` | Send the full query string with pageviews instead of stripping it. |
| `queryParams` | `string[]` | – | Whitelist of query params to keep when `trackQuery` is off. |
| `exclude` | `string[]` | – | Path prefixes never tracked, e.g. `['/app', '/account']` (segment-bounded, checked at send time). |
| `scrubUrl` | `(url: string) => string` | – | **Integration only.** Rewrite each URL before it is sent (e.g. strip a fragment or PII). See the note below. |
| `tagged` | `boolean` | `false` | Auto-track elements marked with `data-takt-event`. |

> **`scrubUrl` note.** Unlike the other options, `scrubUrl` is a **function**, so it
> is supported **only via the integration**, not the `<Takt />` component. The
> integration serializes config into a build-time runtime string, so `scrubUrl` is
> stringified with `.toString()` and re-evaluated in the browser. It MUST be a
> **self-contained** function — no closure variables or outer-scope references — and
> must be **developer-controlled**: never build it from user input.
>
> The `<Takt />` component serializes its config as a JSON data island, which cannot
> carry a function — so passing `scrubUrl` to `<Takt />` **throws at build time**
> rather than silently doing nothing. Use the integration if you need it.

## View Transitions

Astro's client router runs several history operations per navigation (scroll-restoration `replaceState` plus `pushState`), so Takt does **not** rely on core's history patch here — it would over-count. Instead the runtime fires one explicit initial pageview and then one per Astro `astro:after-swap` event (including View Transitions DOM swaps and back/forward), so each navigation is counted exactly once. On a plain MPA (no client router) the script re-runs per page load, which fires the initial pageview each time. The runtime is SSR/prerender safe — it only runs in the browser.

## Custom events

Re-exported from core for convenience:

```js
import { track } from '@vskstudio/takt-astro'

track('Signup', { revenue: { amount: '9.00', currency: 'USD' } })
```

## Widgets

Thin wrappers around Takt's server-rendered badge SVG and embed iframe.

```astro
---
import Badge from '@vskstudio/takt-astro/Badge.astro'
import Embed from '@vskstudio/takt-astro/Embed.astro'
---
<Badge domain="example.com" variant="d" />
<Embed domain="example.com" theme="dark" />
```

`Badge` renders an `<img>` (props: `domain`, `variant`, `glyph`, `lang`, `host`). Its `alt` defaults to `"takt"` and can be overridden. `Embed` renders an `<iframe>` (props: `domain`, `theme`, `lang`, `host`, `width`, `height`, `title`); the iframe is sandboxed (`allow-scripts allow-same-origin`) and ships a fixed `referrerpolicy="strict-origin-when-cross-origin"` — both are locked and cannot be weakened by a consumer. Extra attributes pass through to the underlying element, but the built `src` is locked and cannot be overridden. The optional `host` must be an absolute `http(s)` URL — core validates it and throws on anything else (e.g. a `javascript:` URL), and reduces it to its origin (dropping path/query). An empty `host` resolves same-origin.

## Public stats

`createStats` (re-exported from core) reads public analytics:

```js
import { createStats } from '@vskstudio/takt-astro'

const stats = createStats({ domain: 'example.com' })
const summary = await stats.summary({ period: '7d' })
```

## License

MIT
