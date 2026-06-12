# @vskstudio/takt-astro

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

Both the integration and the component accept the same options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `domain` | `string` | `location.hostname` | Site identifier sent with every event. |
| `endpoint` | `string` | `/api/event` | Ingestion endpoint. |
| `outbound` | `boolean` | `false` | Auto-track outbound link clicks. |
| `files` | `boolean` | `false` | Auto-track file downloads. |
| `spa` | `boolean` | `true` | Track client-side navigations. |
| `respectDnt` | `boolean` | `true` | Suppress events when Do Not Track is on. |
| `excludeLocalhost` | `boolean` | `true` | Suppress events on localhost / private IPs. |

## View Transitions

Astro's client router runs several history operations per navigation (scroll-restoration `replaceState` plus `pushState`), so Takt does **not** rely on core's history patch here — it would over-count. Instead the runtime fires one explicit initial pageview and then one per Astro `astro:after-swap` event (including View Transitions DOM swaps and back/forward), so each navigation is counted exactly once. On a plain MPA (no client router) the script re-runs per page load, which fires the initial pageview each time. The runtime is SSR/prerender safe — it only runs in the browser.

## Custom events

Re-exported from core for convenience:

```js
import { track } from '@vskstudio/takt-astro'

track('Signup', { revenue: { amount: '9.00', currency: 'USD' } })
```

## License

MIT
